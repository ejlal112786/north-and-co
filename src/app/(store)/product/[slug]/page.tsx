import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug, searchProducts, toCard, variantOptions } from "@/lib/catalog";
import { ProductGallery } from "@/components/store/ProductGallery";
import { ProductBuyBox } from "@/components/store/ProductBuyBox";
import { ProductReviews } from "@/components/store/ProductReviews";
import { ProductCard } from "@/components/store/ProductCard";
import { RecentlyViewed } from "@/components/store/RecentlyViewed";
import { RecordView } from "@/components/store/RecordView";
import { parseJson } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Not found" };
  return {
    title: p.seoTitle || p.name,
    description: p.seoDescription || p.shortDescription,
    openGraph: { images: p.images[0] ? [p.images[0].url] : [] },
    alternates: { canonical: `/product/${p.slug}` },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const settings = await getSettings();
  const opts = variantOptions(product.variants);
  const related = product.relationsFrom.filter((r) => r.kind === "related").map((r) => r.related);
  const fbt = product.relationsFrom.filter((r) => r.kind === "fbt").map((r) => r.related);
  const more = related.length
    ? related
    : (await searchProducts({ category: product.category?.slug, pageSize: 4 })).products.filter((p) => p.slug !== slug);
  const specs = parseJson<{ label: string; value: string }[]>(product.specifications, []);
  const ratings = product.reviews.map((r) => r.rating);
  const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
  const breakdown = [5, 4, 3, 2, 1].map((n) => ({
    n,
    c: ratings.filter((r) => r === n).length,
  }));

  await prisma.analyticsEvent.create({
    data: { type: "product_view", path: `/product/${slug}`, meta: JSON.stringify({ slug }) },
  }).catch(() => null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    sku: product.variants[0]?.sku,
    image: product.images.map((i) => i.url),
    brand: product.brand?.name,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: settings.store.currency.toUpperCase(),
      lowPrice: (Math.min(...product.variants.map((v) => v.priceCents)) / 100).toFixed(2),
      highPrice: (Math.max(...product.variants.map((v) => v.priceCents)) / 100).toFixed(2),
      availability: product.variants.some((v) => v.stockQty - v.reservedQty > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    aggregateRating: ratings.length
      ? { "@type": "AggregateRating", ratingValue: avg.toFixed(1), reviewCount: ratings.length }
      : undefined,
  };

  return (
    <div className="mx-auto max-w-catalog px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <RecordView slug={product.slug} />
      <nav className="text-[12px] uppercase tracking-widest text-muted">
        <Link href="/">Home</Link>
        {product.category ? (
          <>
            {" / "}
            <Link href={`/shop?category=${product.category.slug}`}>{product.category.name}</Link>
          </>
        ) : null}
        {" / "}
        {product.name}
      </nav>
      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} videoUrl={product.videoUrl} name={product.name} />
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{product.brand?.name}</p>
          <h1 className="mt-2 font-serif text-4xl sm:text-5xl">{product.name}</h1>
          <p className="mt-3 text-muted">{product.shortDescription}</p>
          <ProductBuyBox
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              variants: product.variants.map((v) => ({
                id: v.id,
                title: v.title,
                sku: v.sku,
                priceCents: v.priceCents,
                compareAtCents: v.compareAtCents,
                stockQty: v.stockQty,
                reservedQty: v.reservedQty,
                options: v.options,
              })),
              sizes: opts.sizes,
              colors: opts.colors,
            }}
            currency={settings.store.currency}
            avg={avg}
            reviewCount={ratings.length}
          />
          <div className="mt-8 space-y-3 text-sm leading-relaxed text-[#3f3a34]">
            {product.description.split("\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          {specs.length ? (
            <dl className="mt-8 divide-y divide-line border-y border-line text-sm">
              {specs.map((s) => (
                <div key={s.label} className="grid grid-cols-3 gap-2 py-3">
                  <dt className="text-muted">{s.label}</dt>
                  <dd className="col-span-2">{s.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          <div className="mt-8 grid gap-4 border border-line p-4 text-sm md:grid-cols-2">
            <p>
              <strong>Shipping.</strong> Quoted at checkout from your country, in {settings.store.currency.toUpperCase()}. Times are estimates until the desk adds a tracking number.
            </p>
            <p>
              <strong>Returns.</strong> {settings.returns.windowDays} days from delivery, unused, tags on. Start with your order number — we do not auto-refund outside policy.
            </p>
            <p>
              <strong>Pay.</strong> Rapid Gateway (cards, JazzCash, easypaisa, Raast) when keys are set, or cash on delivery. COD stays unpaid until cash is received.
            </p>
            <p>
              <strong>Support.</strong>{" "}
              <Link href="/contact" className="underline">
                Contact
              </Link>
              ,{" "}
              <Link href="/faq" className="underline">
                FAQs
              </Link>
              ,{" "}
              <Link href="/track" className="underline">
                track
              </Link>
              ,{" "}
              <Link href="/returns" className="underline">
                returns
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      {fbt.length ? (
        <section className="mt-20">
          <h2 className="font-serif text-3xl">Frequently bought together</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {fbt.map((p) => (
              <ProductCard
                key={p.id}
                product={toCard({
                  slug: p.slug,
                  name: p.name,
                  images: p.images,
                  variants: p.variants.map((v) => ({
                    id: v.id,
                    priceCents: v.priceCents,
                    compareAtCents: v.compareAtCents,
                    stockQty: v.stockQty,
                    reservedQty: v.reservedQty,
                  })),
                })}
              />
            ))}
          </div>
        </section>
      ) : null}

      <ProductReviews
        slug={product.slug}
        reviews={product.reviews}
        avg={avg}
        breakdown={breakdown}
      />

      <section className="mt-20">
        <h2 className="font-serif text-3xl">Related</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {more.slice(0, 4).map((p) => {
            const slug = p.slug;
            return (
              <ProductCard
                key={slug}
                product={toCard({
                  slug,
                  name: p.name,
                  images: p.images,
                  variants: p.variants.map((v) => ({
                    id: v.id,
                    priceCents: v.priceCents,
                    compareAtCents: v.compareAtCents,
                    stockQty: v.stockQty,
                    reservedQty: v.reservedQty,
                  })),
                  minPrice: "minPrice" in p && typeof p.minPrice === "number" ? p.minPrice : undefined,
                  avgRating: "avgRating" in p && typeof p.avgRating === "number" ? p.avgRating : undefined,
                  reviewCount: "reviewCount" in p && typeof p.reviewCount === "number" ? p.reviewCount : undefined,
                  available: "available" in p && typeof p.available === "number" ? p.available : undefined,
                  bestseller: p.bestseller,
                  newArrival: p.newArrival,
                })}
              />
            );
          })}
        </div>
      </section>
      <RecentlyViewed exclude={product.slug} />
    </div>
  );
}
