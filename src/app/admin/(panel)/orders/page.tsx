import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireAdmin("orders");
  const { q, status } = await searchParams;
  const orders = await prisma.order.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(q
        ? {
            OR: [
              { orderNumber: { contains: q } },
              { email: { contains: q.toLowerCase() } },
              { customerName: { contains: q } },
              { phone: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return (
    <div>
      <h1 className="font-serif text-4xl">Orders</h1>
      <form className="mt-4 flex gap-2">
        <input name="q" defaultValue={q} placeholder="Search number, email, name" className="border border-line bg-paper px-3 py-2 text-sm" />
        <select name="status" defaultValue={status || ""} className="border border-line bg-paper px-2 text-sm">
          <option value="">All statuses</option>
          {["PENDING","PAYMENT_PENDING","PAID","PROCESSING","PACKED","SHIPPED","OUT_FOR_DELIVERY","DELIVERED","CANCELLED","RETURNED","REFUNDED"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button className="border border-ink px-3 text-sm">Filter</button>
      </form>
      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-ink text-left">
            <th className="py-2">Order</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Payment</th>
            <th className="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-line">
              <td className="py-2">
                <Link className="underline" href={`/admin/orders/${o.id}`}>
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
                {o.paymentMethod} · {o.paymentStatus}
              </td>
              <td className="text-right">{formatMoney(o.totalCents, o.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
