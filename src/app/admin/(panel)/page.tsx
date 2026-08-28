import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function AdminHome() {
  await requireAdmin("dashboard");
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const [
    orders,
    today,
    pending,
    processing,
    delivered,
    products,
    low,
    recent,
    events,
  ] = await Promise.all([
    prisma.order.findMany({ where: { status: { notIn: ["CANCELLED"] } } }),
    prisma.order.findMany({ where: { createdAt: { gte: start }, status: { notIn: ["CANCELLED"] } } }),
    prisma.order.count({ where: { status: { in: ["PENDING", "PAYMENT_PENDING"] } } }),
    prisma.order.count({ where: { status: "PROCESSING" } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.product.count({ where: { status: "PUBLISHED" } }),
    prisma.productVariant.count({ where: { isActive: true, stockQty: { lte: 5 } } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.analyticsEvent.groupBy({ by: ["type"], _count: true }),
  ]);
  const revenue = orders.filter((o) => o.paymentStatus === "PAID" || o.status === "DELIVERED").reduce((s, o) => s + o.totalCents, 0);
  const todayRev = today.filter((o) => o.paymentStatus === "PAID" || o.paymentMethod === "COD").reduce((s, o) => s + o.totalCents, 0);
  const aov = orders.length ? Math.round(revenue / orders.length) : 0;
  const checkouts = events.find((e) => e.type === "checkout_start")?._count ?? 0;
  const paid = events.find((e) => e.type === "order_paid")?._count ?? 0;

  const tiles = [
    { l: "Revenue (paid/delivered)", v: formatMoney(revenue) },
    { l: "Today", v: formatMoney(todayRev) },
    { l: "Orders", v: String(orders.length) },
    { l: "AOV", v: formatMoney(aov) },
    { l: "Pending", v: String(pending) },
    { l: "Processing", v: String(processing) },
    { l: "Delivered", v: String(delivered) },
    { l: "Products", v: String(products) },
    { l: "Low stock SKUs", v: String(low) },
    { l: "Conv. (paid / checkout starts)", v: checkouts ? `${Math.round((paid / checkouts) * 100)}%` : "—" },
  ];

  return (
    <div>
      <h1 className="font-serif text-4xl">Desk</h1>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        {tiles.map((t) => (
          <div key={t.l} className="border border-line bg-paper p-4">
            <p className="text-[11px] uppercase tracking-widest text-muted">{t.l}</p>
            <p className="mt-2 font-serif text-2xl">{t.v}</p>
          </div>
        ))}
      </div>
      <h2 className="mt-10 font-serif text-2xl">Recent orders</h2>
      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="border-b border-ink text-left">
            <th className="py-2">Order</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Pay</th>
            <th className="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {recent.map((o) => (
            <tr key={o.id} className="border-b border-line">
              <td className="py-2">
                <Link href={`/admin/orders/${o.id}`} className="underline">
                  {o.orderNumber}
                </Link>
                <div className="text-xs text-muted">{formatDate(o.createdAt)}</div>
              </td>
              <td>
                {o.customerName}
                <div className="text-xs text-muted">{o.email}</div>
              </td>
              <td>{o.status}</td>
              <td>
                {o.paymentMethod} {o.paymentStatus}
              </td>
              <td className="text-right">{formatMoney(o.totalCents, o.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
