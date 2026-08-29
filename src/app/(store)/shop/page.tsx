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
    sale: g("sale") === "1",
    page,
  };
  const [result, categories, brands, settings] = await Promise.all([
    searchProducts(filters),
    prisma.category.findMany({ where: { isActive: true, parentId: null }, orderBy: { sortOrder: "asc" }, include: { children: true } }),
    prisma.brand.findMany({ where: { isActive: true } }),
    getSettings(),
  ]);

  const title = filters.sale
    ? "Sale cloth"
    : filters.category
      ? categories.find((c) => c.slug === filters.category)?.name ||
        categories.flatMap((c) => c.children).find((c) => c.slug === filters.category)?.name ||
        "Shop"
      : "The catalog";

  return (
    <div className="mx-auto max-w-catalog px-0 py-0 md:px-4 md:py-10">
      <div className="relative overflow-hidden bg-ink text-paper md:mb-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/banners/linen.jpg" alt="" className="hero-zoom photo-grade absolute inset-0 h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-ink/20" />
        <div className="relative px-5 py-14 md:px-8 md:py-16">
          <nav className="text-[12px] uppercase tracking-widest text-paper/70">
            <Link href="/">Home</Link>
            {" / "}
            <Link href="/shop">Shop</Link>
            {filters.category || filters.sale ? (
              <>
                {" / "}
                <span>{title}</span>
              </>
            ) : null}
          </nav>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <h1 className="font-serif text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.92]">{title}</h1>
            <p className="text-sm text-paper/75">{result.total} pieces</p>
          </div>
        </div>
      </div>

      <div className="px-5 md:px-0">
        <div className="mt-8 grid gap-10 lg:grid-cols-[240px_1fr]">
          <ShopFilters categories={categories} brands={brands} />
          <div>
            {!result.products.length ? (
              <div className="relative overflow-hidden border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/banners/lookbook.jpg" alt="" className="photo-grade h-64 w-full object-cover md:h-80" />
                <div className="p-8 md:p-12">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-muted">No results</p>
                  <h2 className="mt-3 font-serif text-4xl md:text-5xl">Nothing in this cut of the catalog.</h2>
                  <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
                    The filters may be too tight, or that size is gone. We would rather show you an empty page than a lie about stock.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-6 text-[12px] uppercase tracking-[0.16em]">
                    <Link href="/shop" className="link-underline">
                      Reset filters
                    </Link>
                    <Link href="/shop?sort=newest" className="link-underline">
                      Newest
                    </Link>
                    <Link href="/lookbook" className="link-underline">
                      Lookbooks
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="catalog-grid -mx-5 grid grid-cols-1 gap-0 sm:mx-0 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 md:grid-cols-3">
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
                        className={`tap grid w-11 place-items-center border ${n === result.page ? "border-ink bg-ink text-paper" : "border-line"}`}
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
    </div>
  );
}
