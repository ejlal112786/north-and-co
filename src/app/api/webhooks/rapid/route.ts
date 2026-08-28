import { fulfillRapidOrder, failRapidOrder } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { error, json } from "@/lib/http";
import {
  extractRapidEventType,
  extractRapidPaymentId,
  verifyRapidSignature,
  webhookSecretConfigured,
} from "@/lib/rapid";

export const runtime = "nodejs";

async function handle(req: Request) {
  const url = new URL(req.url);
  const raw = await req.text();
  const signature =
    req.headers.get("x-rg-signature") ||
    req.headers.get("X-RG-Signature") ||
    req.headers.get("x-rapid-signature");

  if (webhookSecretConfigured() && req.method !== "GET") {
    const check = verifyRapidSignature(raw, signature);
    if (!check.ok) return error("Invalid Rapid signature", 401);
  }

  let payload: Record<string, unknown> = {};
  if (raw) {
    try {
      payload = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      const params = new URLSearchParams(raw);
      payload = Object.fromEntries(params.entries());
    }
  }

  const paymentId = extractRapidPaymentId(payload, url.searchParams);
  if (!paymentId) return error("Missing payment id", 400);

  const event = extractRapidEventType(payload);
  const failed = event.includes("fail") || event.includes("cancel") || event === "payment.failed";

  try {
    if (failed) {
      const order = await prisma.order.findUnique({ where: { rapidAccessCode: paymentId } });
      if (order) await failRapidOrder(order.id);
      return json({ received: true, paid: false });
    }

    // Always re-query Rapid. Never trust the callback body for paid/amount.
    const order = await fulfillRapidOrder(paymentId);
    return json({
      received: true,
      paid: order.paymentStatus === "PAID",
      order: order.orderNumber,
    });
  } catch (e) {
    return error(e instanceof Error ? e.message : "Webhook failed", 500);
  }
}

export async function POST(req: Request) {
  return handle(req);
}

export async function GET(req: Request) {
  return handle(req);
}
