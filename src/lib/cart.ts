import { cookies, headers } from "next/headers";
import { prisma } from "./prisma";
import { nanoid } from "nanoid";
import { availableQty } from "./inventory";
import { evaluateCoupon, type CartLine } from "./coupons";
import { parseJson } from "./utils";

const COOKIE = "nc_cart";

export async function getCartToken(): Promise<string> {
  const h = await headers();
  const fromMw = h.get("x-cart-token");
  if (fromMw) return fromMw;
  const jar = await cookies();
  return jar.get(COOKIE)?.value || nanoid(24);
}

const cartInclude = {
  coupon: true,
  items: {
    include: {
      variant: {
        include: {
          product: { include: { images: { orderBy: { sortOrder: "asc" as const }, take: 1 } } },
        },
      },
    },
  },
};

export async function getOrCreateCart() {
  const token = await getCartToken();
  return prisma.cart.upsert({
    where: { token },
    create: {
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
    update: {},
    include: cartInclude,
  });
}

export async function cartSummary(email?: string | null) {
  const cart = await getOrCreateCart();
  const activeItems = cart.items.filter((i) => !i.savedForLater);
  const later = cart.items.filter((i) => i.savedForLater);

  const lines: CartLine[] = [];
  const detailed = [];

  for (const item of activeItems) {
    const v = item.variant;
    const avail = availableQty(v.stockQty, v.reservedQty);
    const qty = Math.min(item.quantity, Math.max(avail, 0));
    const opts = parseJson<{ size?: string; color?: string }>(v.options, {});
    detailed.push({
      id: item.id,
      variantId: v.id,
      productId: v.productId,
      name: v.product.name,
      slug: v.product.slug,
      variantTitle: v.title,
      sku: v.sku,
      options: opts,
      image: v.imageUrl || v.product.images[0]?.url || "",
      quantity: item.quantity,
      available: avail,
      unitPriceCents: v.priceCents,
      compareAtCents: v.compareAtCents,
      lineTotalCents: v.priceCents * qty,
      outOfStock: avail <= 0,
      clamped: qty !== item.quantity,
    });
    if (avail > 0 && qty > 0) {
      lines.push({
        variantId: v.id,
        productId: v.productId,
        categoryId: v.product.categoryId,
        quantity: qty,
        unitPriceCents: v.priceCents,
      });
    }
  }

  const subtotalCents = lines.reduce((s, l) => s + l.unitPriceCents * l.quantity, 0);
  let discountCents = 0;
  let freeShipping = false;
  let couponError: string | null = null;
  let couponCode: string | null = cart.coupon?.code ?? null;

  if (cart.coupon) {
    const result = await evaluateCoupon(cart.coupon.code, lines, email);
    if (result.ok) {
      discountCents = result.discountCents;
      freeShipping = result.freeShipping;
    } else {
      couponError = result.error;
      couponCode = cart.coupon.code;
    }
  }

  return {
    cartId: cart.id,
    token: cart.token,
    items: detailed,
    savedForLater: later.map((i) => ({
      id: i.id,
      variantId: i.variantId,
      name: i.variant.product.name,
      slug: i.variant.product.slug,
      variantTitle: i.variant.title,
      image: i.variant.imageUrl || i.variant.product.images[0]?.url || "",
      unitPriceCents: i.variant.priceCents,
      quantity: i.quantity,
    })),
    subtotalCents,
    discountCents,
    freeShipping,
    couponCode,
    couponError,
    itemCount: detailed.reduce((s, i) => s + i.quantity, 0),
  };
}

export async function addToCart(variantId: string, quantity: number) {
  const qty = Math.max(1, Math.min(99, Math.floor(quantity)));
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { product: true },
  });
  if (!variant || !variant.isActive || variant.product.status !== "PUBLISHED") {
    throw new Error("PRODUCT_UNAVAILABLE");
  }
  const avail = availableQty(variant.stockQty, variant.reservedQty);
  if (avail <= 0) throw new Error("OUT_OF_STOCK");

  const cart = await getOrCreateCart();
  const existing = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, variantId, savedForLater: false },
  });
  const nextQty = Math.min(avail, (existing?.quantity ?? 0) + qty);
  if (existing) {
    await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: nextQty } });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, variantId, quantity: nextQty },
    });
  }
  await prisma.cart.update({ where: { id: cart.id }, data: { updatedAt: new Date() } });
  return cartSummary();
}
