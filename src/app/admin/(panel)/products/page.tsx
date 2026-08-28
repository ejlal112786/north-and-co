import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { formatMoney } from "@/lib/money";

export default async function ProductsAdmin({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin("products");
  const { q } = await searchParams;
  const products = await prisma.product.findMany({
    where: q ? { searchText: { contains: q.toLowerCase() } } : {},
    include: { variants: true, category: true },
    orderBy: { updatedAt: "desc" },
  });
  return (
    <div>
      <div className="flex items-end justify-between">
        <h1 className="font-serif text-4xl">Products</h1>
        <Link href="/admin/products/new" className="bg-ink px-4 py-2 text-[12px] uppercase tracking-widest text-paper">
          New
        </Link>
      </div>
      <form className="mt-4">
        <input name="q" defaultValue={q} placeholder="Search" className="border border-line bg-paper px-3 py-2 text-sm" />
      </form>
      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-ink text-left">
            <th className="py-2">Name</th>
            <th>Status</th>
            <th>Category</th>
            <th>Stock</th>
            <th>From</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-line">
              <td className="py-2">
                <Link href={`/admin/products/${p.id}`} className="underline">
                  {p.name}
                </Link>
                <div className="text-xs text-muted">{p.slug}</div>
              </td>
              <td>{p.status}</td>
              <td>{p.category?.name}</td>
              <td>{p.variants.reduce((s, v) => s + v.stockQty, 0)}</td>
              <td>{formatMoney(Math.min(...p.variants.map((v) => v.priceCents)))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
