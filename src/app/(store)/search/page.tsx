import { searchProducts, toCard, fuzzyRescue } from "@/lib/catalog";
import { ProductCard } from "@/components/store/ProductCard";
import Link from "next/link";
import { track } from "@/lib/analytics";

export const metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const { q = "", sort } = await searchParams;
  await track("search", { q });
  const result = q.trim()
    ? await searchProducts({ q, sort: sort || "relevance", pageSize: 24 })
    : { products: [], total: 0, pages: 0, page: 1 };
  const suggestions = !result.products.length && q.trim() ? await fuzzyRescue(q) : [];
  const recommended =
    !result.products.length && q.trim()
      ? await searchProducts({ featured: true, pageSize: 12 })
      : null;

  return (
    <div className="mx-auto max-w-catalog px-5 py-10 md:px-4">
      <p className="text-[11px] uppercase tracking-[0.22em] text-muted">The catalog</p>
      <h1 className="mt-2 font-serif text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.92]">Search</h1>
      <form className="mt-6 flex max-w-lg gap-2">
        <input
          name="q"
          defaultValue={q}
          className="tap flex-1 border border-line bg-transparent px-3"
          placeholder="Merino, trench, loafer…"
        />
        <button className="tap bg-ink px-5 text-[12px] uppercase tracking-widest text-paper">Search</button>
      </form>
      {q ? <p className="mt-4 text-sm text-muted">{result.total} results for “{q}”</p> : null}
      {result.products.length ? (
        <div className="catalog-grid mt-10 -mx-5 grid grid-cols-1 gap-0 sm:mx-0 sm:grid-cols-2 sm:gap-6 md:grid-cols-4">
          {result.products.map((p, i) => (
            <ProductCard key={p.slug} product={toCard(p)} index={i} />
          ))}
        </div>
      ) : q ? (
        <div className="mt-10">
          <div className="relative overflow-hidden border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/banners/lookbook.jpg" alt="" className="photo-grade h-56 w-full object-cover" />
            <div className="p-8 md:p-12">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted">No exact matches</p>
              <h2 className="mt-3 font-serif text-4xl md:text-5xl">We do not have “{q}” on the rack.</h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
                Try a fibre, a garment, or a colour we actually stock. Or open a lookbook and start from an outfit.
              </p>
              {suggestions.length ? (
                <p className="mt-5 text-sm">
                  Did you mean{" "}
                  {suggestions.map((s, i) => (
                    <span key={s.slug}>
                      <Link href={`/product/${s.slug}`} className="underline">
                        {s.name}
                      </Link>
                      {i < suggestions.length - 1 ? ", " : ""}
                    </span>
                  ))}
                  ?
                </p>
              ) : null}
              <div className="mt-6 flex flex-wrap gap-6 text-[12px] uppercase tracking-[0.16em]">
                <Link href="/shop" className="link-underline">
                  The shop
                </Link>
                <Link href="/lookbook" className="link-underline">
                  Lookbooks
                </Link>
              </div>
            </div>
          </div>
          {recommended?.products.length ? (
            <div className="mt-12">
              <h2 className="font-serif text-3xl">From the rack instead</h2>
              <div className="mt-6 grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-4 md:grid-cols-4">
                {recommended.products.slice(0, 4).map((p, i) => (
                  <ProductCard key={p.slug} product={toCard(p)} index={i} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="mt-10 max-w-md text-muted">Try merino, trench, loafer, silk — words for the cloth, not a brand hunt.</p>
      )}
    </div>
  );
}
