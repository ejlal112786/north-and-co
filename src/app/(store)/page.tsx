import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { searchProducts, toCard } from "@/lib/catalog";
import { ProductCard } from "@/components/store/ProductCard";
import { RecentlyViewed } from "@/components/store/RecentlyViewed";
import { getSettings } from "@/lib/settings";
import { Reveal } from "@/components/store/Reveal";
import { LOOKBOOKS } from "@/lib/lookbooks";

export default async function HomePage() {
  const settings = await getSettings();
  const currency = settings.store.currency;
  const [featured, newest, best, cats, banners, faqs] = await Promise.all([
    searchProducts({ featured: true, pageSize: 8, sort: "newest" }),
    searchProducts({ newArrival: true, pageSize: 8, sort: "newest" }),
    searchProducts({ bestseller: true, pageSize: 8, sort: "bestselling" }),
    prisma.category.findMany({
      where: { featured: true, isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 8,
    }),
    prisma.banner.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.faq.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 3 }),
  ]);
  const hero = banners.find((b) => b.position === "home-hero");
  const split = banners.find((b) => b.position === "home-split");
  const strip = banners.find((b) => b.position === "home-strip");

  return (
    <>
      <section className="relative min-h-[86vh] bg-ink text-paper">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hero?.image || "/images/banners/hero.jpg"}
          alt=""
          className="hero-zoom absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-ink/30" />
        <div className="relative mx-auto flex min-h-[86vh] max-w-catalog flex-col justify-end px-4 pb-16 pt-32">
          <p className="text-[11px] uppercase tracking-[0.22em]">Guest checkout · Rapid or COD · No accounts</p>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[1.05] sm:text-7xl">
            {hero?.title || "Cloth cut to last. Guest checkout, no accounts."}
          </h1>
          <p className="mt-5 max-w-lg text-base text-paper/80">
            {hero?.subtitle || settings.store.tagline}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className="bg-paper px-6 py-3 text-[12px] uppercase tracking-[0.18em] text-ink">
              Shop the catalog
            </Link>
            <Link
              href="/shop?category=apparel"
              className="border border-paper px-6 py-3 text-[12px] uppercase tracking-[0.18em]"
            >
              Apparel
            </Link>
            <Link href="/lookbook" className="border border-paper px-6 py-3 text-[12px] uppercase tracking-[0.18em]">
              Lookbooks
            </Link>
          </div>
        </div>
      </section>

      {strip ? (
        <p className="border-b border-line bg-sage px-4 py-3 text-center text-[12px] uppercase tracking-[0.18em] text-paper">
          <Link href={strip.href}>
            {strip.title} — {strip.subtitle}
          </Link>
        </p>
      ) : null}

      <div className="marquee bg-paper">
        <div className="marquee-track py-3 text-[12px] uppercase tracking-[0.2em] text-muted">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="px-8">
              Guest checkout · Prices in USD · Rapid or cash on delivery · 30-day returns · No customer accounts
              · Stock checked on the server ·&nbsp;
            </span>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-catalog px-4 py-16">
        <Reveal>
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-4xl">Featured</h2>
            <Link href="/shop" className="text-[12px] uppercase tracking-widest hover:text-copper">
              All products
            </Link>
          </div>
        </Reveal>
        <div className="catalog-grid mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {featured.products.map((p, i) => (
            <ProductCard key={p.slug} product={toCard(p)} currency={currency} index={i} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-catalog px-4 py-8">
        <Reveal>
          <h2 className="font-serif text-4xl">Shop by category</h2>
        </Reveal>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {cats.map((c) => (
            <Link key={c.id} href={`/shop?category=${c.slug}`} className="group block">
              <div className="aspect-[3/4] overflow-hidden bg-bone">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.image || "/images/fallback.jpg"}
                  alt={c.name}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
              <p className="mt-2 text-[12px] uppercase tracking-[0.16em]">{c.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {split ? (
        <section className="mx-auto grid max-w-catalog items-center gap-0 px-4 py-16 md:grid-cols-2">
          <div className="aspect-[4/5] bg-bone">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={split.image || "/images/banners/linen.jpg"} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="bg-sage px-8 py-16 text-paper md:px-16">
            <p className="text-[11px] uppercase tracking-[0.2em]">From the rack</p>
            <h2 className="mt-4 font-serif text-4xl">{split.title}</h2>
            <p className="mt-4 max-w-sm text-paper/80">{split.subtitle}</p>
            <Link href={split.href} className="mt-8 inline-block border border-paper px-5 py-2 text-[12px] uppercase tracking-widest">
              Shop the piece
            </Link>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-catalog px-4 py-16">
        <Reveal>
        <div className="flex items-end justify-between">
          <h2 className="font-serif text-4xl">Lookbooks</h2>
          <Link href="/lookbook" className="text-[12px] uppercase tracking-widest">
            All looks
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {LOOKBOOKS.map((l) => (
            <Link key={l.slug} href={`/lookbook/${l.slug}`} className="group block">
              <div className="aspect-[16/10] overflow-hidden bg-bone">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={l.image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              </div>
              <h3 className="mt-3 font-serif text-2xl">{l.title}</h3>
              <p className="mt-1 text-sm text-muted">{l.subtitle}</p>
            </Link>
          ))}
        </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-catalog px-4 py-16">
        <Reveal>
          <h2 className="font-serif text-4xl">New arrivals</h2>
        </Reveal>
        <div className="catalog-grid mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {newest.products.map((p, i) => (
            <ProductCard key={p.slug} product={toCard(p)} currency={currency} index={i} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-catalog px-4 py-16">
        <Reveal>
          <h2 className="font-serif text-4xl">Best sellers</h2>
        </Reveal>
        <div className="catalog-grid mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {best.products.map((p, i) => (
            <ProductCard key={p.slug} product={toCard(p)} currency={currency} index={i} />
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-mist">
        <div className="mx-auto grid max-w-catalog gap-8 px-4 py-14 md:grid-cols-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Shipping</p>
            <p className="mt-2 font-serif text-2xl">Quoted at checkout.</p>
            <p className="mt-2 text-sm text-muted">Pakistan local and tracked international. Times are estimates until we add a tracking number.</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Returns</p>
            <p className="mt-2 font-serif text-2xl">Thirty days, unused.</p>
            <p className="mt-2 text-sm text-muted">Start a return with your order number. We do not auto-promise refunds outside policy.</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Pay</p>
            <p className="mt-2 font-serif text-2xl">Rapid or cash.</p>
            <p className="mt-2 text-sm text-muted">Cards, JazzCash, easypaisa, and Raast when Rapid is configured. COD stays unpaid until delivery.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-catalog px-4 py-16">
        <div className="flex items-end justify-between">
          <h2 className="font-serif text-4xl">Questions, answered</h2>
          <Link href="/faq" className="text-[12px] uppercase tracking-widest">
            All FAQs
          </Link>
        </div>
        <dl className="mt-8 divide-y divide-line border-y border-line">
          {faqs.map((f) => (
            <div key={f.id} className="grid gap-2 py-5 md:grid-cols-3">
              <dt className="font-medium">{f.question}</dt>
              <dd className="text-sm leading-relaxed text-muted md:col-span-2">{f.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <RecentlyViewed />
    </>
  );
}
