/**
 * Rapid Gateway Pakistan (rapidgateway.pk)
 * Hosted checkout: cards, JazzCash, easypaisa, Raast.
 *
 * Amounts sent to Rapid are PKR **major units** (whole rupees), not paisa.
 * Internally this shop still stores integer minor units (paisa).
 * Example: order.totalCents = 425000 → Rapid `amount: 4250` (Rs 4,250).
 *
 * Merchant ID + Secret Key live only in env. Never sent to the browser.
 * Paid only after we re-query Rapid (webhook signature is not enough on its own).
 */
import crypto from "crypto";

export const RAPID_METHODS = ["card", "jazzcash", "easypaisa", "raast"] as const;

export type RapidPayment = {
  id: string;
  checkout_url: string;
  status?: string;
  amount?: number;
  currency?: string;
  reference?: string;
  metadata?: Record<string, unknown>;
  raw: Record<string, unknown>;
};

function merchantId() {
  return (process.env.RAPID_MERCHANT_ID || process.env.RG_MERCHANT_ID || "").trim();
}

function secretKey() {
  return (process.env.RAPID_SECRET_KEY || process.env.RG_SECRET_KEY || "").trim();
}

function webhookSecret() {
  return (process.env.RAPID_WEBHOOK_SECRET || process.env.RG_WEBHOOK_SECRET || "").trim();
}

export function rapidEnabled() {
  return Boolean(merchantId() && secretKey());
}

/** Rapid Gateway PK charges whole rupees. */
export function rupeesFromCents(cents: number) {
  return Math.round(cents / 100);
}

export function amountsMatch(orderCents: number, gatewayAmount: number) {
  if (!Number.isFinite(gatewayAmount)) return false;
  const rupees = rupeesFromCents(orderCents);
  return gatewayAmount === rupees || gatewayAmount === orderCents;
}

export function toE164(phone: string) {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  if (digits.startsWith("92")) return `+${digits}`;
  if (digits.startsWith("0")) return `+92${digits.slice(1)}`;
  return `+${digits}`;
}

function apiBase() {
  const raw = (process.env.RAPID_API_BASE || process.env.RAPID_ENDPOINT || "").trim();
  if (raw.startsWith("http")) return raw.replace(/\/$/, "");
  const mode = raw.toLowerCase();
  if (mode === "sandbox" || mode === "test") return "https://sandbox.api.rapidgateway.pk";
  return "https://api.rapidgateway.pk";
}

function unwrap(data: Record<string, unknown>): Record<string, unknown> {
  const inner = data.data;
  if (inner && typeof inner === "object" && !Array.isArray(inner)) {
    return inner as Record<string, unknown>;
  }
  const payment = data.payment;
  if (payment && typeof payment === "object" && !Array.isArray(payment)) {
    return payment as Record<string, unknown>;
  }
  return data;
}

function asPayment(data: Record<string, unknown>): RapidPayment {
  const u = unwrap(data);
  const id = String(u.id || u.payment_id || u.paymentId || "");
  const checkout =
    String(u.checkout_url || u.checkoutUrl || u.redirect_url || u.redirectUrl || u.url || "") || "";
  return {
    id,
    checkout_url: checkout,
    status: u.status != null ? String(u.status) : undefined,
    amount: u.amount != null ? Number(u.amount) : undefined,
    currency: u.currency != null ? String(u.currency) : undefined,
    reference: u.reference != null ? String(u.reference) : undefined,
    metadata: (u.metadata as Record<string, unknown>) || undefined,
    raw: u,
  };
}

async function rapidFetch(path: string, init?: RequestInit): Promise<Record<string, unknown>> {
  if (!rapidEnabled()) throw new Error("RAPID_NOT_CONFIGURED");
  const headers: Record<string, string> = {
    Authorization: `Bearer ${secretKey()}`,
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Merchant-Id": merchantId(),
    ...(init?.headers as Record<string, string> | undefined),
  };
  let res: Response;
  try {
    res = await fetch(`${apiBase()}${path}`, { ...init, headers });
  } catch (e) {
    throw new Error(`RAPID_NETWORK:${e instanceof Error ? e.message : "fetch failed"}`);
  }
  const text = await res.text();
  let json: Record<string, unknown> = {};
  if (text) {
    try {
      json = JSON.parse(text) as Record<string, unknown>;
    } catch {
      throw new Error(`RAPID_BAD_RESPONSE:${res.status}`);
    }
  }
  if (!res.ok) {
    const msg =
      (typeof json.error === "string" && json.error) ||
      (typeof json.message === "string" && json.message) ||
      `HTTP_${res.status}`;
    throw new Error(`RAPID_HTTP:${msg}`);
  }
  return json;
}

export async function createRapidPayment(input: {
  amountCents: number;
  orderId: string;
  orderNumber: string;
  accessToken: string;
  description: string;
  customer: { name: string; email: string; phone: string };
  returnUrl: string;
  cancelUrl: string;
  webhookUrl: string;
}): Promise<RapidPayment> {
  // Rapid Gateway Pakistan: amount is PKR rupees (major units), currency always PKR.
  const amount = rupeesFromCents(input.amountCents);
  const body = {
    merchant_id: merchantId(),
    amount,
    currency: "PKR",
    methods: [...RAPID_METHODS],
    customer: {
      name: input.customer.name,
      email: input.customer.email,
      phone: toE164(input.customer.phone),
    },
    reference: input.orderNumber,
    description: input.description.slice(0, 120),
    return_url: input.returnUrl,
    callback_url: input.returnUrl,
    cancel_url: input.cancelUrl,
    webhook_url: input.webhookUrl,
    metadata: {
      orderId: input.orderId,
      accessToken: input.accessToken,
      expectedAmount: amount,
    },
  };

  const json = await rapidFetch("/v1/payments", {
    method: "POST",
    headers: { "Idempotency-Key": input.orderId },
    body: JSON.stringify(body),
  });
  const payment = asPayment(json);
  if (!payment.id || !payment.checkout_url) throw new Error("RAPID_SESSION");
  return payment;
}

export async function getRapidPayment(paymentId: string): Promise<RapidPayment> {
  const json = await rapidFetch(`/v1/payments/${encodeURIComponent(paymentId)}`);
  const payment = asPayment(json);
  if (!payment.id) payment.id = paymentId;
  return payment;
}

const PAID = new Set(["succeeded", "success", "paid", "completed", "captured", "complete"]);
const FAILED = new Set(["failed", "declined", "cancelled", "canceled", "expired", "void"]);

export function rapidIsPaid(payment: RapidPayment) {
  const status = (payment.status || "").toLowerCase();
  if (PAID.has(status)) return true;
  const raw = payment.raw;
  if (raw.paid === true || raw.success === true) return true;
  return false;
}

export function rapidIsFailed(payment: RapidPayment) {
  return FAILED.has((payment.status || "").toLowerCase());
}

export async function refundRapid(paymentId: string | number, amountCents: number, reason: string) {
  const json = await rapidFetch(`/v1/payments/${encodeURIComponent(String(paymentId))}/refunds`, {
    method: "POST",
    body: JSON.stringify({
      amount: rupeesFromCents(amountCents),
      currency: "PKR",
      reason: reason.slice(0, 120) || "Refund",
    }),
  });
  const u = unwrap(json);
  if (u.status && FAILED.has(String(u.status).toLowerCase())) throw new Error("RAPID_REFUND:not_approved");
  return { TransactionID: u.id || paymentId, ...u };
}

/** HMAC-SHA256 of the raw webhook body. Header: X-RG-Signature */
export function verifyRapidSignature(rawBody: string, signatureHeader: string | null) {
  const secret = webhookSecret();
  if (!secret) return { ok: false, reason: "no_secret" as const };
  if (!signatureHeader) return { ok: false, reason: "missing" as const };
  const sent = signatureHeader.replace(/^sha256=/i, "").trim();
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(sent);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, reason: "mismatch" as const };
  }
  return { ok: true as const };
}

export function webhookSecretConfigured() {
  return Boolean(webhookSecret());
}

export function extractRapidPaymentId(payload: Record<string, unknown>, search: URLSearchParams) {
  const data = payload.data && typeof payload.data === "object" ? (payload.data as Record<string, unknown>) : {};
  const candidates = [
    search.get("payment_id"),
    search.get("id"),
    payload.payment_id,
    payload.paymentId,
    payload.id,
    data.id,
    data.payment_id,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c) return c;
  }
  return null;
}

export function extractRapidEventType(payload: Record<string, unknown>) {
  return String(payload.type || payload.event || payload.status || "").toLowerCase();
}
