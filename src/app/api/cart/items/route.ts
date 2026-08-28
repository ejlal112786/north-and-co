import { addToCart, getOrCreateCart, cartSummary } from "@/lib/cart";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin, error, json, USER_ERRORS } from "@/lib/http";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const body = z.object({ variantId: z.string(), quantity: z.number().int().min(1).max(99) }).parse(await req.json());
    const summary = await addToCart(body.variantId, body.quantity);
    return json(summary);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    if (msg === "CSRF") return error("Invalid origin", 403);
    return error(USER_ERRORS[msg] || "Could not add to cart", 400);
  }
}

export async function PATCH(req: Request) {
  try {
    assertSameOrigin(req);
    const body = z
      .object({
        itemId: z.string(),
        quantity: z.number().int().min(0).max(99),
        savedForLater: z.boolean().optional(),
      })
      .parse(await req.json());
    const cart = await getOrCreateCart();
    const item = await prisma.cartItem.findFirst({ where: { id: body.itemId, cartId: cart.id } });
    if (!item) return error("Item not in cart", 404);
    if (body.quantity === 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
    } else {
      await prisma.cartItem.update({
        where: { id: item.id },
        data: {
          quantity: body.quantity,
          savedForLater: body.savedForLater ?? item.savedForLater,
        },
      });
    }
    return json(await cartSummary());
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    return error(msg === "CSRF" ? "Invalid origin" : "Could not update cart", 400);
  }
}

export async function DELETE(req: Request) {
  try {
    assertSameOrigin(req);
    const cart = await getOrCreateCart();
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return json(await cartSummary());
  } catch {
    return error("Could not clear cart", 400);
  }
}
