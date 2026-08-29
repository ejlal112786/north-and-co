import Link from "next/link";
import { searchProducts, toCard } from "@/lib/catalog";
import { ProductCard } from "@/components/store/ProductCard";
import { ShopFilters } from "@/components/store/ShopFilters";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Shop" };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const g = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const page = Number(g("page") || 1);
  const filters = {
    q: g("q"),
    category: g("category"),
    brand: g("brand"),
    min: g("min") ? Number(g("min")) * 100 : undefined,
    max: g("max") ? Number(g("max")) * 100 : undefined,
    inStock: g("inStock") === "1",
    rating: g("rating") ? Number(g("rating")) : undefined,
    size: g("size"),
    color: g("color"),
    gender: g("gender"),
    style: g("style"),
    sort: g("sort") || "newest",
    page,
  };
  const [result, categories, brands, settings] = await Promise.all([
    searchProducts(filters),
    prisma.category.findMany({ where: { isActive: true, parentId: null }, orderBy: { sortOrder: "asc" }, include: { children: true } }),
    prisma.brand.findMany({ where: { isActive: true } }),
    getSettings(),
  ]);

  const title = filters.category
    ? categories.find((c) => c.slug === filters.category)?.name ||
      categories.flatMap((c) => c.children).find((c) => c.slug === filters.category)?.name ||
      "Shop"
    : "The catalog";

  return (
    <div className="mx-auto max-w-catalog px-4 py-10">
      <nav className="text-[12px] uppercase tracking-widest text-muted">
        <Link href="/">Home</Link>
        {" / "}
        <Link href="/shop">Shop</Link>
        {filters.category ? (
          <>
            {" / "}
            <span>{title}</span>
          </>
        ) : null}
      </nav>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-5xl">{title}</h1>
        <p className="text-sm text-muted">{result.total} pieces</p>
      </div>
      <div className="mt-8 grid gap-10 lg:grid-cols-[240px_1fr]">
        <ShopFilters categories={categories} brands={brands} />
        <div>
          {!result.products.length ? (
            <div className="border border-line p-10">
              <p className="font-serif text-2xl">Nothing in this cut of the catalog.</p>
              <p className="mt-2 text-sm text-muted">Clear filters, or browse new arrivals.</p>
              <Link href="/shop" className="mt-4 inline-block underline">
                Reset filters
              </Link>
            </div>
          ) : (
            <div className="catalog-grid grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
              {result.products.map((p, i) => (
                <ProductCard key={p.slug} product={toCard(p)} currency={settings.store.currency} index={i} />
              ))}
            </div>
          )}
          {result.pages > 1 ? (
            <ol className="mt-12 flex flex-wrap gap-2 text-sm">
              {Array.from({ length: result.pages }, (_, i) => i + 1).map((n) => {
                const params = new URLSearchParams();
                Object.entries(sp).forEach(([k, v]) => {
                  if (typeof v === "string") params.set(k, v);
                });
                params.set("page", String(n));
                return (
                  <li key={n}>
                    <Link
                      href={`/shop?${params.toString()}`}
                      className={`grid h-9 w-9 place-items-center border ${n === result.page ? "border-ink bg-ink text-paper" : "border-line"}`}
                    >
                      {n}
                    </Link>
                  </li>
                );
              })}
            </ol>
          ) : null}
        </div>
      </div>
    </div>
  );
}
