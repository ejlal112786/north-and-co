import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatMoney } from "@/lib/money";

export default async function CustomersPage() {
  await requireAdmin("customers");
  const orders = await prisma.order.findMany({
    where: { status: { notIn: ["CANCELLED"] } },
    orderBy: { createdAt: "desc" },
  });
  const map = new Map<
    string,
    { email: string; name: string; phone: string; count: number; spend: number; last: Date }
  >();
  for (const o of orders) {
    const cur = map.get(o.email) || {
      email: o.email,
      name: o.customerName,
      phone: o.phone,
      count: 0,
      spend: 0,
      last: o.createdAt,
    };
    cur.count += 1;
    cur.spend += o.totalCents;
    if (o.createdAt > cur.last) cur.last = o.createdAt;
    map.set(o.email, cur);
  }
  const rows = [...map.values()].sort((a, b) => b.spend - a.spend);
  return (
    <div>
      <h1 className="font-serif text-4xl">Buyers</h1>
      <p className="mt-2 text-sm text-muted">Order-based records. There are no customer accounts.</p>
      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-ink text-left">
            <th className="py-2">Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Orders</th>
            <th>Spend</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.email} className="border-b border-line">
              <td className="py-2">{r.name}</td>
              <td>{r.email}</td>
              <td>{r.phone}</td>
              <td>{r.count}</td>
              <td>{formatMoney(r.spend)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
