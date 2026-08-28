import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { formatDate, parseJson } from "@/lib/utils";
import Link from "next/link";

const STEPS = [
  "PENDING",
  "PAYMENT_PENDING",
  "PAID",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export default async function TrackTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const order = await prisma.order.findUnique({
    where: { accessToken: token },
    include: { items: true, shipments: true },
  });
  if (!order) notFound();
  const ship = parseJson<{ address?: string; city?: string; state?: string; postal?: string; country?: string }>(
    order.shippingAddress,
    {}
  );
  const idx = STEPS.indexOf(order.status);
  const cancelled = ["CANCELLED", "RETURNED", "REFUNDED"].includes(order.status);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Order tracking</p>
      <h1 className="mt-2 font-serif text-4xl">{order.orderNumber}</h1>
      <p className="mt-2 text-sm text-muted">
        Placed {formatDate(order.createdAt)} · Payment {order.paymentStatus.replaceAll("_", " ").toLowerCase()}
      </p>

      {cancelled ? (
        <p className="mt-6 border border-line p-4">{order.status.replaceAll("_", " ")}</p>
      ) : (
        <ol className="mt-8 space-y-2">
          {STEPS.filter((s) => !["PENDING", "PAYMENT_PENDING", "PAID"].includes(s) || s === order.status).map((s) => {
            const done = STEPS.indexOf(s) <= idx || (s === "PROCESSING" && idx >= STEPS.indexOf("PROCESSING"));
            return (
              <li key={s} className={`flex items-center gap-3 text-sm ${done ? "" : "text-muted"}`}>
                <span className={`h-2 w-2 rounded-full ${done ? "bg-ink" : "bg-line"}`} />
                {s.replaceAll("_", " ")}
              </li>
            );
          })}
        </ol>
      )}

      {order.trackingNumber ? (
        <p className="mt-6 text-sm">
          {order.carrier} · {order.trackingNumber}
        </p>
      ) : null}
      <p className="mt-2 text-sm text-muted">Estimated delivery {order.estimatedDelivery || "—"}</p>

      <ul className="mt-8 divide-y divide-line border-y border-line text-sm">
        {order.items.map((i) => (
          <li key={i.id} className="flex justify-between py-3">
            <span>
              {i.productName} · {i.variantTitle} × {i.quantity}
            </span>
            <span>{formatMoney(i.totalCents, order.currency)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 flex justify-between font-medium">
        <span>Total</span>
        <span>{formatMoney(order.totalCents, order.currency)}</span>
      </p>
      <p className="mt-6 text-sm">
        {order.customerName}
        <br />
        {[ship.address, ship.city, ship.state, ship.postal, ship.country].filter(Boolean).join(", ")}
      </p>
      <div className="mt-8 flex flex-wrap gap-4 text-sm">
        <Link href={`/invoice/${order.accessToken}`} className="underline">
          Invoice
        </Link>
        <Link href="/returns" className="underline">
          Start a return
        </Link>
        <Link href="/contact" className="underline">
          Contact the desk
        </Link>
      </div>
    </div>
  );
}
