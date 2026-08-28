import { getOrCreateCart, cartSummary } from "@/lib/cart";
import { evaluateCoupon } from "@/lib/coupons";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin, error, json } from "@/lib/http";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const { code } = z.object({ code: z.string() }).parse(await req.json());
    const cart = await getOrCreateCart();
    const summary = await cartSummary();
    const lines = summary.items
      .filter((i) => !i.outOfStock)
      .map((i) => ({
        variantId: i.variantId,
        productId: i.productId,
        categoryId: null as string | null,
        quantity: i.quantity,
        unitPriceCents: i.unitPriceCents,
      }));
    const result = await evaluateCoupon(code, lines);
    if (!result.ok) {
      await prisma.cart.update({ where: { id: cart.id }, data: { couponId: null } });
      return error(result.error, 400);
    }
    await prisma.cart.update({ where: { id: cart.id }, data: { couponId: result.coupon.id } });
    return json(await cartSummary());
  } catch (e) {
    return error(e instanceof Error ? e.message : "Invalid code", 400);
  }
}
