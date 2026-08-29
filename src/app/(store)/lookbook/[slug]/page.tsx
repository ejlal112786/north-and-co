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
  const rows = (await Promise.all(lb.pieces.map(async (piece) => ({ piece, product: await getProductBySlug(piece.slug) })))).filter(
    (r): r is typeof r & { product: NonNullable<typeof r.product> } => !!r.product
  );
  const variants = rows
    .map((r) => r.product.variants.find((v) => v.stockQty - v.reservedQty > 0) || r.product.variants[0])
    .filter(Boolean)
    .map((v) => v!.id);

  return (
    <div>
      <section className="relative min-h-[72vh] overflow-hidden bg-ink text-paper md:min-h-[85vh]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={lb.image} alt="" className="hero-zoom photo-grade absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/25 to-ink/20" />
        <div className="relative mx-auto flex min-h-[72vh] max-w-catalog flex-col justify-end px-5 pb-14 pt-24 md:min-h-[85vh] md:px-8 md:pb-20">
          <nav className="text-[12px] uppercase tracking-widest text-paper/70">
            <Link href="/">Home</Link> / <Link href="/lookbook">Lookbooks</Link> / {lb.title}
          </nav>
          <p className="mt-6 text-[11px] uppercase tracking-[0.24em] text-paper/75">{lb.kicker}</p>
          <h1 className="mt-3 font-serif text-[clamp(3rem,8vw,7rem)] leading-[0.9]">{lb.title}</h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-paper/85">{lb.subtitle}</p>
          <div className="mt-8">
            <LookbookAdd variantIds={variants} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 md:py-20">
        {lb.essay.split("\n\n").map((para, i) => (
          <p key={i} className={`leading-relaxed text-[#3f3a34] ${i === 0 ? "font-serif text-2xl md:text-3xl" : "mt-5 text-[15px]"}`}>
            {para}
          </p>
        ))}
      </section>

      <div className="mx-auto max-w-catalog px-0 pb-20 md:px-4">
        <div className="catalog-grid grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-8 md:grid-cols-4">
          {rows.map(({ piece, product: p }, i) => (
            <div key={p.id}>
              <p className="mb-2 px-5 text-[11px] uppercase tracking-widest text-muted sm:px-0">{piece.note}</p>
              <ProductCard product={toCard(p)} currency={settings.store.currency} index={i} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
