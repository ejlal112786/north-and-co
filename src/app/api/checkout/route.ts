import { checkoutSchema } from "@/lib/validation";
import { placeOrder } from "@/lib/orders";
import { assertSameOrigin, error, json, USER_ERRORS } from "@/lib/http";
import { originFromHeaders, getClientIp } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import { expireStaleReservations } from "@/lib/inventory";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const ip = getClientIp(req.headers);
    const rl = rateLimit(`checkout:${ip}`, 8, 10 * 60 * 1000);
    if (!rl.ok) return error("Too many checkout attempts. Wait a few minutes.", 429);
    await expireStaleReservations();
    const body = checkoutSchema.parse(await req.json());
    const origin = originFromHeaders(req.headers);
    const result = await placeOrder(body, origin);
    return json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    if (msg === "CSRF") return error("Invalid origin", 403);
    if (msg.startsWith("RAPID_")) {
      return error(USER_ERRORS.RAPID_UNAVAILABLE + (msg.includes(":") ? ` (${msg.split(":").slice(1).join(":")})` : ""), 400);
    }
    return error(USER_ERRORS[msg] || (msg.startsWith("Invalid") ? "Check the form and try again." : "Checkout failed"), 400);
  }
}
