import { notFound } from "next/navigation";
import Link from "next/link";
import { getLookbook } from "@/lib/lookbooks";
import { getProductBySlug, toCard } from "@/lib/catalog";
import { ProductCard } from "@/components/store/ProductCard";
import { getSettings } from "@/lib/settings";
import { LookbookAdd } from "@/components/store/LookbookAdd";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const lb = getLookbook(slug);
  return { title: lb?.title || "Lookbook" };
}

export default async function LookbookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lb = getLookbook(slug);
  if (!lb) notFound();
  const settings = await getSettings();
  const rows = await Promise.all(
    lb.pieces.map(async (piece) => ({ piece, product: await getProductBySlug(piece.slug) }))
  );
  const products = rows.filter((r) => r.product);
  const variants = products
    .map((r) => r.product!.variants.find((v) => v.stockQty - v.reservedQty > 0) || r.product!.variants[0])
    .filter(Boolean)
    .map((v) => v!.id);

  return (
    <div>
      <section className="relative min-h-[50vh] bg-ink text-paper">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={lb.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-ink/20" />
        <div className="relative mx-auto flex min-h-[50vh] max-w-catalog flex-col justify-end px-4 pb-12 pt-24">
          <nav className="text-[12px] uppercase tracking-widest text-paper/70">
            <Link href="/">Home</Link> / <Link href="/lookbook">Lookbooks</Link> / {lb.title}
          </nav>
          <h1 className="mt-4 font-serif text-5xl">{lb.title}</h1>
          <p className="mt-3 max-w-lg text-paper/80">{lb.subtitle}</p>
          <div className="mt-6">
            <LookbookAdd variantIds={variants} />
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-catalog px-4 py-16">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((p, i) =>
            p ? (
              <div key={p.id}>
                <p className="mb-2 text-[11px] uppercase tracking-widest text-muted">{lb.pieces[i]?.note}</p>
                <ProductCard product={toCard(p)} currency={settings.store.currency} />
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}
