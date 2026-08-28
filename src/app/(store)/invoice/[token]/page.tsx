import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatMoney } from "@/lib/money";
import { formatDate, parseJson } from "@/lib/utils";
import { getSettings } from "@/lib/settings";
import { PrintButton } from "@/components/store/PrintButton";

export default async function InvoicePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [order, settings] = await Promise.all([
    prisma.order.findUnique({ where: { accessToken: token }, include: { items: true } }),
    getSettings(),
  ]);
  if (!order) notFound();
  const ship = parseJson<Record<string, string>>(order.shippingAddress, {});
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="flex justify-between">
        <div>
          <p className="tracking-brand">NORTH &amp; CO.</p>
          <p className="mt-2 text-sm text-muted">{settings.store.address}</p>
        </div>
        <div className="text-right">
          <p className="font-serif text-3xl">Invoice</p>
          <p className="text-sm">{order.orderNumber}</p>
          <p className="text-sm">{formatDate(order.createdAt)}</p>
        </div>
      </div>
      <p className="mt-8 text-sm">
        Bill to {order.customerName}
        <br />
        {order.email} · {order.phone}
        <br />
        {Object.values(ship).filter(Boolean).join(", ")}
      </p>
      <table className="mt-8 w-full text-sm">
        <thead>
          <tr className="border-b border-ink text-left">
            <th className="py-2">Item</th>
            <th>Qty</th>
            <th className="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((i) => (
            <tr key={i.id} className="border-b border-line">
              <td className="py-2">
                {i.productName}
                <div className="text-xs text-muted">{i.variantTitle} · {i.sku}</div>
              </td>
              <td>{i.quantity}</td>
              <td className="text-right">{formatMoney(i.totalCents, order.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 ml-auto w-56 space-y-1 text-sm">
        <p className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatMoney(order.subtotalCents, order.currency)}</span>
        </p>
        <p className="flex justify-between">
          <span>Discount</span>
          <span>−{formatMoney(order.discountCents, order.currency)}</span>
        </p>
        <p className="flex justify-between">
          <span>Shipping</span>
          <span>{formatMoney(order.shippingCents, order.currency)}</span>
        </p>
        <p className="flex justify-between">
          <span>Tax</span>
          <span>{formatMoney(order.taxCents, order.currency)}</span>
        </p>
        <p className="flex justify-between font-medium">
          <span>Total</span>
          <span>{formatMoney(order.totalCents, order.currency)}</span>
        </p>
        <p className="text-xs text-muted">
          {order.paymentMethod} · {order.paymentStatus}
        </p>
      </div>
      <PrintButton />
    </div>
  );
}
