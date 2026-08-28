import { nanoid } from "nanoid";
import { prisma } from "./prisma";
import { cartSummary, getOrCreateCart } from "./cart";
import { evaluateCoupon } from "./coupons";
import { quoteShipping } from "./shipping";
import { reserveStock, commitReservation, releaseReservation } from "./inventory";
import { getSettings } from "./settings";
import { mailOrderConfirmation, mailPayment, orderToEmail } from "./mail";
import { track } from "./analytics";
import {
  amountsMatch,
  createRapidPayment,
  getRapidPayment,
  rapidEnabled,
  rapidIsPaid,
} from "./rapid";
import type { checkoutSchema } from "./validation";
import type { z } from "zod";

type CheckoutInput = z.infer<typeof checkoutSchema>;

async function nextOrderNumber() {
  const row = await prisma.counter.upsert({
    where: { key: "order" },
    update: { value: { increment: 1 } },
    create: { key: "order", value: 1001 },
  });
  return `NC-${row.value}`;
}

export async function placeOrder(input: CheckoutInput, origin: string) {
  const settings = await getSettings();
  const cart = await getOrCreateCart();
  const summary = await cartSummary(input.email.toLowerCase());

  if (!summary.items.length) throw new Error("CART_EMPTY");
  if (summary.items.some((i) => i.outOfStock)) throw new Error("OUT_OF_STOCK");

  if (input.paymentMethod === "RAPID") {
    if (!settings.payments.rapidEnabled || !rapidEnabled()) throw new Error("RAPID_UNAVAILABLE");
  } else if (!settings.payments.codEnabled) {
    throw new Error("COD_UNAVAILABLE");
  }

  const lines = summary.items
    .filter((i) => !i.outOfStock)
    .map((i) => ({
      variantId: i.variantId,
      productId: i.productId,
      categoryId: null as string | null,
      quantity: Math.min(i.quantity, i.available),
      unitPriceCents: i.unitPriceCents,
    }));

  for (const line of lines) {
    const v = await prisma.productVariant.findUnique({
      where: { id: line.variantId },
      include: { product: true },
    });
    if (!v || v.priceCents !== line.unitPriceCents) throw new Error("PRICE_CHANGED");
    line.categoryId = v.product.categoryId;
    line.unitPriceCents = v.priceCents;
  }

  const subtotalCents = lines.reduce((s, l) => s + l.unitPriceCents * l.quantity, 0);
  let discountCents = 0;
  let freeShipping = false;
  let couponId: string | undefined;
  let couponCode: string | undefined;
  const code = (input.couponCode || summary.couponCode || "").trim();
  if (code) {
    const result = await evaluateCoupon(code, lines, input.email);
    if (!result.ok) throw new Error("INVALID_COUPON");
    discountCents = result.discountCents;
    freeShipping = result.freeShipping;
    couponId = result.coupon.id;
    couponCode = result.coupon.code;
  }

  const quotes = await quoteShipping(input.shipping.country, subtotalCents - discountCents);
  const method = quotes.find((q) => q.id === input.shippingMethodId);
  if (!method) throw new Error("SHIPPING_UNAVAILABLE");
  const shippingCents = freeShipping ? 0 : method.rateCents;
  const taxable = Math.max(0, subtotalCents - discountCents);
  const taxCents = Math.round((taxable * settings.tax.rateBps) / 10000);
  const totalCents = taxable + shippingCents + taxCents;

  const billing = input.billingSame || !input.billing ? input.shipping : input.billing;
  const accessToken = nanoid(28);
  const orderNumber = await nextOrderNumber();

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber,
        accessToken,
        customerName: input.name.trim(),
        email: input.email.toLowerCase().trim(),
        phone: input.phone.trim(),
        shippingAddress: JSON.stringify(input.shipping),
        billingAddress: JSON.stringify(billing),
        deliveryNotes: input.shipping.instructions || "",
        status: input.paymentMethod === "COD" ? "PAYMENT_PENDING" : "PENDING",
        paymentStatus: "PENDING",
        paymentMethod: input.paymentMethod,
        subtotalCents,
        discountCents,
        shippingCents,
        taxCents,
        totalCents,
        currency: settings.store.currency,
        couponId,
        couponCode,
        shippingMethod: method.name,
        shippingMethodCode: method.code,
        estimatedDelivery: method.estimate,
        items: {
          create: await Promise.all(
            lines.map(async (l) => {
              const v = await tx.productVariant.findUniqueOrThrow({
                where: { id: l.variantId },
                include: { product: { include: { images: { take: 1, orderBy: { sortOrder: "asc" } } } } },
              });
              return {
                variantId: v.id,
                productName: v.product.name,
                variantTitle: v.title,
                sku: v.sku,
                quantity: l.quantity,
                unitPriceCents: v.priceCents,
                totalCents: v.priceCents * l.quantity,
                imageUrl: v.imageUrl || v.product.images[0]?.url || "",
                productSlug: v.product.slug,
              };
            })
          ),
        },
      },
      include: { items: true },
    });
    return created;
  });

  try {
    for (const item of order.items) {
      if (item.variantId) await reserveStock(item.variantId, item.quantity, order.id);
    }
  } catch {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED", paymentStatus: "FAILED" },
    });
    throw new Error("INSUFFICIENT_STOCK");
  }

  if (couponId) {
    await prisma.coupon.update({ where: { id: couponId }, data: { usageCount: { increment: 1 } } });
  }

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id, savedForLater: false } });
  await prisma.cart.update({ where: { id: cart.id }, data: { couponId: null } });

  await track("checkout_complete_attempt", { orderId: order.id, method: input.paymentMethod });

  if (input.paymentMethod === "COD") {
    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: "cod",
        amountCents: totalCents,
        currency: settings.store.currency,
        status: "PENDING",
      },
    });
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "PROCESSING" },
    });
    await commitReservation(order.id);
    const full = await prisma.order.findUniqueOrThrow({ where: { id: order.id }, include: { items: true } });
    await mailOrderConfirmation(orderToEmail(full));
    return {
      orderNumber: full.orderNumber,
      accessToken: full.accessToken,
      redirectUrl: `/checkout/success?token=${full.accessToken}`,
    };
  }

  try {
    const rapid = await createRapidPayment({
      amountCents: totalCents,
      orderId: order.id,
      orderNumber: order.orderNumber,
      accessToken: order.accessToken,
      description: order.items.map((i) => `${i.productName} × ${i.quantity}`).join(", ").slice(0, 64),
      customer: { name: input.name.trim(), email: input.email, phone: input.phone },
      returnUrl: `${origin}/checkout/success?token=${order.accessToken}`,
      cancelUrl: `${origin}/checkout/cancel?token=${order.accessToken}`,
      webhookUrl: `${origin}/api/webhooks/rapid`,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { rapidAccessCode: rapid.id, status: "PAYMENT_PENDING", currency: "pkr" },
    });
    return {
      orderNumber: order.orderNumber,
      accessToken: order.accessToken,
      redirectUrl: rapid.checkout_url,
    };
  } catch (err) {
    try {
      await failRapidOrder(order.id);
    } catch {
      /* still surface the Rapid error */
    }
    throw err;
  }
}

export async function fulfillRapidOrder(paymentId: string) {
  const result = await getRapidPayment(paymentId);
  const metaOrderId =
    result.metadata && typeof result.metadata.orderId === "string" ? result.metadata.orderId : null;
  const order =
    (metaOrderId
      ? await prisma.order.findUnique({ where: { id: metaOrderId }, include: { items: true } })
      : null) ||
    (await prisma.order.findUnique({ where: { rapidAccessCode: paymentId }, include: { items: true } })) ||
    (result.reference
      ? await prisma.order.findUnique({ where: { orderNumber: result.reference }, include: { items: true } })
      : null);
  if (!order) throw new Error("NO_ORDER");

  if (!rapidIsPaid(result)) {
    return order;
  }

  if (order.paymentStatus === "PAID") return order;
  if (order.status === "CANCELLED") return order;

  const amount = Number(result.amount ?? 0);
  if (amount && !amountsMatch(order.totalCents, amount)) {
    throw new Error("AMOUNT_MISMATCH");
  }

  const txnId = String(result.raw.transaction_id || result.raw.txn_id || result.id || paymentId);

  const claimed = await prisma.order.updateMany({
    where: { id: order.id, paymentStatus: "PENDING" },
    data: {
      paymentStatus: "PAID",
      status: "PAID",
      rapidAccessCode: paymentId,
      rapidTransactionId: txnId,
    },
  });
  if (claimed.count === 0) {
    return prisma.order.findUniqueOrThrow({ where: { id: order.id }, include: { items: true } });
  }

  await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: "rapid",
      providerRef: txnId,
      amountCents: order.totalCents,
      currency: "pkr",
      status: "PAID",
      rawPayload: JSON.stringify({
        id: result.id,
        status: result.status,
        amount: result.amount,
        currency: result.currency || "PKR",
      }),
    },
  });

  await commitReservation(order.id);
  await prisma.order.update({ where: { id: order.id }, data: { status: "PROCESSING" } });
  const full = await prisma.order.findUniqueOrThrow({ where: { id: order.id }, include: { items: true } });
  await mailOrderConfirmation(orderToEmail(full));
  await mailPayment(orderToEmail(full), "success");
  await track("order_paid", { orderId: order.id, total: order.totalCents });
  return full;
}

export async function failRapidOrder(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order || order.paymentStatus === "PAID") return order;
  if (order.status === "CANCELLED") return order;
  await releaseReservation(order.id);
  await prisma.order.update({
    where: { id: order.id },
    data: { status: "CANCELLED", paymentStatus: "CANCELLED" },
  });
  if (order.couponId) {
    await prisma.coupon.update({
      where: { id: order.couponId },
      data: { usageCount: { decrement: 1 } },
    });
  }
  await mailPayment(orderToEmail(order), "failure");
  return order;
}
