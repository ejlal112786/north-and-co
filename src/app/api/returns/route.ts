import { prisma } from "@/lib/prisma";
import { assertSameOrigin, error, json } from "@/lib/http";
import { z } from "zod";
import { getSettings } from "@/lib/settings";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const body = z
      .object({
        orderNumber: z.string().min(4),
        email: z.string().email(),
        reason: z.string().min(8).max(500),
      })
      .parse(await req.json());
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: body.orderNumber.trim().toUpperCase(),
        email: body.email.trim().toLowerCase(),
      },
      include: { items: true, returns: true },
    });
    if (!order) return error("No order matches that number and email.", 404);
    if (["CANCELLED"].includes(order.status)) return error("This order cannot be returned.", 400);
    const settings = await getSettings();
    const age = Date.now() - order.createdAt.getTime();
    if (age > settings.returns.windowDays * 24 * 60 * 60 * 1000) {
      return error(`Returns are within ${settings.returns.windowDays} days of the order.`, 400);
    }
    if (order.returns.some((r) => r.status === "REQUESTED" || r.status === "APPROVED")) {
      return error("A return is already open on this order.", 400);
    }
    await prisma.returnRequest.create({
      data: {
        orderId: order.id,
        email: order.email,
        reason: body.reason,
        items: JSON.stringify(order.items.map((i) => ({ orderItemId: i.id, quantity: i.quantity }))),
      },
    });
    return json({ message: "Return requested. The desk will email you after review." });
  } catch {
    return error("Could not start return", 400);
  }
}
