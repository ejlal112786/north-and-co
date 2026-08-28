import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatMoney } from "@/lib/money";

export default async function AnalyticsPage() {
  await requireAdmin("analytics");
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [events, orders, searches] = await Promise.all([
    prisma.analyticsEvent.groupBy({ by: ["type"], _count: true, where: { createdAt: { gte: since } } }),
    prisma.order.findMany({ where: { createdAt: { gte: since }, status: { notIn: ["CANCELLED"] } }, include: { items: true } }),
    prisma.analyticsEvent.findMany({
      where: { type: "search", createdAt: { gte: since } },
      take: 200,
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const productSales = new Map<string, number>();
  for (const o of orders) {
    for (const i of o.items) productSales.set(i.productName, (productSales.get(i.productName) || 0) + i.quantity);
  }
  const best = [...productSales.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  const revenue = orders.filter((o) => o.paymentStatus === "PAID" || o.status === "DELIVERED").reduce((s, o) => s + o.totalCents, 0);
  const qcount = new Map<string, number>();
  for (const s of searches) {
    try {
      const q = JSON.parse(s.meta).q as string;
      if (q) qcount.set(q, (qcount.get(q) || 0) + 1);
    } catch {
      /* ignore */
    }
  }
  return (
    <div>
      <h1 className="font-serif text-4xl">Analytics · 30 days</h1>
      <p className="mt-2 text-sm">Revenue {formatMoney(revenue)} · Orders {orders.length}</p>
      <h2 className="mt-8 font-serif text-2xl">Events</h2>
      <ul className="mt-2 text-sm">
        {events.map((e) => (
          <li key={e.type} className="border-b border-line py-1">
            {e.type}: {e._count}
          </li>
        ))}
      </ul>
      <h2 className="mt-8 font-serif text-2xl">Best sellers</h2>
      <ul className="mt-2 text-sm">
        {best.map(([n, c]) => (
          <li key={n} className="border-b border-line py-1">
            {n} · {c} sold
          </li>
        ))}
      </ul>
      <h2 className="mt-8 font-serif text-2xl">Search queries</h2>
      <ul className="mt-2 text-sm">
        {[...qcount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([q, c]) => (
          <li key={q}>
            {q} ({c})
          </li>
        ))}
      </ul>
    </div>
  );
}
