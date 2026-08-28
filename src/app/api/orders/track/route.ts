import { prisma } from "@/lib/prisma";
import { trackSchema } from "@/lib/validation";
import { assertSameOrigin, error, json } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const ip = getClientIp(req.headers);
    const rl = rateLimit(`track:${ip}`, 20, 15 * 60 * 1000);
    if (!rl.ok) return error("Too many attempts", 429);
    const body = trackSchema.parse(await req.json());
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: body.orderNumber.trim().toUpperCase(),
        email: body.email.trim().toLowerCase(),
      },
    });
    if (!order) return error("No order matches that number and email.", 404);
    return json({ token: order.accessToken });
  } catch {
    return error("Could not look up order", 400);
  }
}
