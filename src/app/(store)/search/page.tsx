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
      ? await searchProducts({ featured: true, pageSize: 4 })
      : null;

  return (
    <div className="mx-auto max-w-catalog px-4 py-10">
      <h1 className="font-serif text-4xl">Search</h1>
      <form className="mt-4 flex max-w-lg gap-2">
        <input
          name="q"
          defaultValue={q}
          className="flex-1 border border-line bg-transparent px-3 py-2"
          placeholder="Search products"
        />
        <button className="bg-ink px-4 text-[12px] uppercase tracking-widest text-paper">Search</button>
      </form>
      {q ? <p className="mt-4 text-sm text-muted">{result.total} results for “{q}”</p> : null}
      {result.products.length ? (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {result.products.map((p) => (
            <ProductCard key={p.slug} product={toCard(p)} />
          ))}
        </div>
      ) : q ? (
        <div className="mt-8">
          <p className="font-serif text-2xl">No exact matches.</p>
          {suggestions.length ? (
            <p className="mt-3 text-sm">
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
          {recommended?.products.length ? (
            <div className="mt-8">
              <h2 className="font-serif text-2xl">Recommended instead</h2>
              <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                {recommended.products.map((p) => (
                  <ProductCard key={p.slug} product={toCard(p)} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="mt-8 text-muted">Try merino, linen, brass, tote…</p>
      )}
    </div>
  );
}
