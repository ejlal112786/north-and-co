import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { notFound } from "next/navigation";
import { formatMoney } from "@/lib/money";
import { parseJson } from "@/lib/utils";
import { OrderActions } from "@/components/admin/OrderActions";
import Link from "next/link";

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("orders");
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, payments: true, refunds: true, notes: true, shipments: true, returns: true },
  });
  if (!order) notFound();
  const ship = parseJson<Record<string, string>>(order.shippingAddress, {});
  return (
    <div className="max-w-3xl">
      <p className="text-xs">
        <Link href="/admin/orders">Orders</Link>
      </p>
      <h1 className="font-serif text-4xl">{order.orderNumber}</h1>
      <p className="mt-1 text-sm text-muted">
        {order.customerName} · {order.email} · {order.phone}
      </p>
      <p className="mt-1 text-sm text-muted">
        Pay {order.paymentMethod} · {order.paymentStatus}
        {order.rapidTransactionId ? ` · Rapid txn ${order.rapidTransactionId}` : ""}
        {order.rapidAccessCode ? ` · AccessCode ${order.rapidAccessCode}` : ""}
      </p>
      <p className="mt-2 text-sm">
        Ship: {Object.values(ship).filter(Boolean).join(", ")}
        <br />
        Method: {order.shippingMethod} · Est. {order.estimatedDelivery}
      </p>
      <ul className="mt-6 divide-y divide-line border-y border-line text-sm">
        {order.items.map((i) => (
          <li key={i.id} className="flex justify-between py-2">
            <span>
              {i.productName} · {i.variantTitle} × {i.quantity}
              <span className="block text-xs text-muted">{i.sku}</span>
            </span>
            <span>{formatMoney(i.totalCents, order.currency)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm">
        Subtotal {formatMoney(order.subtotalCents)} · Discount {formatMoney(order.discountCents)} · Ship{" "}
        {formatMoney(order.shippingCents)} · Tax {formatMoney(order.taxCents)} ·{" "}
        <strong>Total {formatMoney(order.totalCents, order.currency)}</strong>
      </p>
      <OrderActions order={JSON.parse(JSON.stringify(order))} />
      {order.notes.length ? (
        <div className="mt-8">
          <h2 className="font-serif text-xl">Internal notes</h2>
          <ul className="mt-2 text-sm">
            {order.notes.map((n) => (
              <li key={n.id} className="border-b border-line py-2">
                {n.body}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <Link href={`/invoice/${order.accessToken}`} className="mt-6 inline-block text-sm underline">
        Customer invoice
      </Link>
    </div>
  );
}
