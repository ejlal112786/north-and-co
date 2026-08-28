import { prisma } from "./prisma";
import { parseJson } from "./utils";
import type { Coupon } from "@prisma/client";

export type CartLine = {
  variantId: string;
  productId: string;
  categoryId: string | null;
  quantity: number;
  unitPriceCents: number;
};

export type CouponResult =
  | { ok: true; discountCents: number; freeShipping: boolean; coupon: Coupon }
  | { ok: false; error: string };

export async function evaluateCoupon(
  codeRaw: string,
  lines: CartLine[],
  email?: string | null
): Promise<CouponResult> {
  const code = codeRaw.trim().toUpperCase();
  if (!code) return { ok: false, error: "Enter a code." };
  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.isActive) return { ok: false, error: "This code is not valid." };
  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) return { ok: false, error: "This code is not active yet." };
  if (coupon.endsAt && coupon.endsAt < now) return { ok: false, error: "This code has expired." };
  if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) {
    return { ok: false, error: "This code has reached its usage limit." };
  }

  const subtotal = lines.reduce((s, l) => s + l.unitPriceCents * l.quantity, 0);
  if (subtotal < coupon.minOrderCents) {
    return {
      ok: false,
      error: `Minimum order is ${(coupon.minOrderCents / 100).toFixed(2)}.`,
    };
  }

  if (coupon.firstOrderOnly && email) {
    const prior = await prisma.order.count({
      where: {
        email: email.toLowerCase(),
        paymentStatus: { in: ["PAID", "PENDING"] },
        status: { notIn: ["CANCELLED"] },
      },
    });
    if (prior > 0) return { ok: false, error: "This code is for first orders only." };
  }

  if (email) {
    const used = await prisma.order.count({
      where: {
        email: email.toLowerCase(),
        couponCode: code,
        status: { notIn: ["CANCELLED"] },
      },
    });
    if (used >= coupon.perCustomerLimit) {
      return { ok: false, error: "You have already used this code." };
    }
  }

  const productIds = parseJson<string[]>(coupon.productIds, []);
  const categoryIds = parseJson<string[]>(coupon.categoryIds, []);

  const eligible = lines.filter((l) => {
    if (coupon.type === "PRODUCT" && productIds.length) return productIds.includes(l.productId);
    if (coupon.type === "CATEGORY" && categoryIds.length)
      return l.categoryId ? categoryIds.includes(l.categoryId) : false;
    return true;
  });
  const eligibleSubtotal = eligible.reduce((s, l) => s + l.unitPriceCents * l.quantity, 0);

  let discountCents = 0;
  let freeShipping = false;

  switch (coupon.type) {
    case "PERCENT":
      discountCents = Math.round((eligibleSubtotal * coupon.value) / 100);
      break;
    case "FIXED":
      discountCents = Math.min(coupon.value, eligibleSubtotal);
      break;
    case "FREE_SHIPPING":
      freeShipping = true;
      break;
    case "PRODUCT":
    case "CATEGORY":
      discountCents = Math.round((eligibleSubtotal * coupon.value) / 100);
      break;
    case "BUY_X_GET_Y": {
      const buyX = coupon.buyX ?? 2;
      const getY = coupon.getY ?? 1;
      const units: number[] = [];
      for (const l of eligible) {
        for (let i = 0; i < l.quantity; i++) units.push(l.unitPriceCents);
      }
      units.sort((a, b) => a - b);
      const group = buyX + getY;
      const freeCount = Math.floor(units.length / group) * getY;
      discountCents = units.slice(0, freeCount).reduce((s, n) => s + n, 0);
      break;
    }
  }

  discountCents = Math.min(discountCents, subtotal);
  return { ok: true, discountCents, freeShipping, coupon };
}
