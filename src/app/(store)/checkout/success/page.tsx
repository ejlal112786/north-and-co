import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { fulfillRapidOrder } from "@/lib/orders";
import { formatMoney } from "@/lib/money";
import { parseJson } from "@/lib/utils";

type OrderWithItems = Prisma.OrderGetPayload<{ include: { items: true } }>;

export const metadata = { title: "Order confirmed" };

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    token?: string;
    payment_id?: string;
    paymentId?: string;
    id?: string;
  }>;
}) {
  const sp = await searchParams;
  const paymentId = sp.payment_id || sp.paymentId || sp.id;
  let order: OrderWithItems | null = null;
  let payError = "";

  if (paymentId) {
    try {
      const full = await fulfillRapidOrder(paymentId);
      order = await prisma.order.findUnique({ where: { id: full.id }, include: { items: true } });
      if (order && order.paymentStatus !== "PAID") {
        payError = "Rapid Gateway did not confirm this payment. It has not been marked paid.";
      }
    } catch (e) {
      payError = e instanceof Error ? e.message : "Payment could not be verified.";
      order = await prisma.order.findFirst({
        where: { rapidAccessCode: paymentId },
        include: { items: true },
      });
    }
  } else if (sp.token) {
    order = await prisma.order.findUnique({ where: { accessToken: sp.token }, include: { items: true } });
    if (order?.paymentMethod === "RAPID" && order.rapidAccessCode && order.paymentStatus === "PENDING") {
      try {
        const full = await fulfillRapidOrder(order.rapidAccessCode);
        order = await prisma.order.findUnique({ where: { id: full.id }, include: { items: true } });
        if (order && order.paymentStatus !== "PAID") {
          payError = "Rapid Gateway did not confirm this payment. It has not been marked paid.";
        }
      } catch (e) {
        payError = e instanceof Error ? e.message : "Payment could not be verified.";
      }
    }
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <h1 className="font-serif text-4xl">We could not find that order</h1>
        <p className="mt-4 text-sm text-muted">
          If you paid, do not retry blindly — write to the desk with your order number. We only mark paid after Rapid
          Gateway confirms the amount.
        </p>
        <Link href="/track" className="mt-6 inline-block underline">
          Track an order
        </Link>
      </div>
    );
  }

  const ship = parseJson<{ address?: string; city?: string; country?: string }>(order.shippingAddress, {});

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <p className="text-[11px] uppercase tracking-[0.2em] text-sage">Thank you</p>
      <h1 className="mt-2 font-serif text-5xl">Order {order.orderNumber}</h1>
      {payError ? (
        <p className="mt-4 border border-sale p-3 text-sm text-sale">
          Payment verification issue: {payError}. Status is still {order.paymentStatus}.
        </p>
      ) : (
        <p className="mt-4 text-sm text-muted">
          A confirmation is queued to {order.email}. You do not need an account. Keep this page or the email link.
        </p>
      )}
      <dl className="mt-8 divide-y divide-line border-y border-line text-sm">
        <div className="flex justify-between py-3">
          <dt>Status</dt>
          <dd>{order.status.replaceAll("_", " ")}</dd>
        </div>
        <div className="flex justify-between py-3">
          <dt>Payment</dt>
          <dd>
            {order.paymentMethod === "COD" ? "Cash on delivery" : "Rapid Gateway"} — {order.paymentStatus}
          </dd>
        </div>
        <div className="flex justify-between py-3">
          <dt>Total</dt>
          <dd>{formatMoney(order.totalCents, order.currency)}</dd>
        </div>
        <div className="flex justify-between py-3">
          <dt>Ship to</dt>
          <dd className="text-right">
            {order.customerName}
            <br />
            {[ship.address, ship.city, ship.country].filter(Boolean).join(", ")}
          </dd>
        </div>
        <div className="flex justify-between py-3">
          <dt>Estimated delivery</dt>
          <dd>{order.estimatedDelivery || "See tracking"}</dd>
        </div>
      </dl>
      <ul className="mt-6 space-y-2 text-sm">
        {order.items.map((i) => (
          <li key={i.id} className="flex justify-between">
            <span>
              {i.productName} × {i.quantity}
            </span>
            <span>{formatMoney(i.totalCents, order.currency)}</span>
          </li>
        ))}
      </ul>
      <Link
        href={`/track/${order.accessToken}`}
        className="mt-8 inline-block bg-ink px-6 py-3 text-[12px] uppercase tracking-widest text-paper"
      >
        Track this order
      </Link>
    </div>
  );
}
