import { NextResponse } from "next/server";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function error(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function assertSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return;
  let o: URL;
  try {
    o = new URL(origin);
  } catch {
    throw new Error("CSRF");
  }
  if (o.host !== host) throw new Error("CSRF");
}

export const USER_ERRORS: Record<string, string> = {
  CART_EMPTY: "Your cart is empty.",
  OUT_OF_STOCK: "An item in your cart is no longer available in that quantity.",
  PRODUCT_UNAVAILABLE: "This product is unavailable.",
  PRICE_CHANGED: "A price changed. Refresh and try again.",
  INVALID_COUPON: "That code cannot be applied to this order.",
  SHIPPING_UNAVAILABLE: "Shipping is not available for that address.",
  RAPID_UNAVAILABLE: "Rapid Gateway is not configured (Merchant ID + Secret Key). Choose cash on delivery or try later.",
  COD_UNAVAILABLE: "Cash on delivery is not available.",
  INSUFFICIENT_STOCK: "We could not reserve stock. Reduce quantity and try again.",
  RAPID_SESSION: "Could not start Rapid checkout.",
  AMOUNT_MISMATCH: "Payment amount did not match the order. Nothing was marked paid.",
  CSRF: "This request could not be verified.",
};
