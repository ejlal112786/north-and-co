import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { searchProducts, toCard } from "@/lib/catalog";
import { ProductCard } from "@/components/store/ProductCard";
import { RecentlyViewed } from "@/components/store/RecentlyViewed";
import { getSettings } from "@/lib/settings";
import { Reveal } from "@/components/store/Reveal";
import { LOOKBOOKS } from "@/lib/lookbooks";

const FALL = LOOKBOOKS[0]!;
const WEEKEND = LOOKBOOKS[1]!;
const TOWN = LOOKBOOKS[2]!;
const EVENING = LOOKBOOKS[3]!;

export default async function HomePage() {
  const settings = await getSettings();
  const currency = settings.store.currency;
  const [featured, newest, sale, cats, banners, faqs] = await Promise.all([
    searchProducts({ featured: true, pageSize: 12, sort: "newest" }),
    searchProducts({ newArrival: true, pageSize: 12, sort: "newest" }),
    searchProducts({ sale: true, pageSize: 12, sort: "newest" }),
    prisma.category.findMany({
      where: { featured: true, isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 4,
    }),
    prisma.banner.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.faq.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 3 }),
  ]);
  const hero = banners.find((b) => b.position === "home-hero");
  const strip = banners.find((b) => b.position === "home-strip");
  const rack = featured.products.slice(0, 4);
  const justIn = newest.products.slice(0, 4);
  const marked = sale.products.slice(0, 4);

  return (
    <>
      <section className="relative min-h-[88vh] overflow-hidden bg-ink text-paper md:min-h-[94vh]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hero?.image || "/images/banners/hero.jpg"}
          alt=""
          className="hero-zoom photo-grade absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-ink/25" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-catalog flex-col justify-end px-5 pb-16 pt-32 md:min-h-[94vh] md:px-8 md:pb-20">
          <p className="text-[11px] uppercase tracking-[0.28em] text-paper/75">
            {hero?.subtitle || "North & Co. · Cloth, this season"}
          </p>
          <h1 className="mt-5 max-w-4xl font-serif text-[clamp(3.4rem,11vw,8.6rem)] leading-[0.86] tracking-tight">
            {hero?.title || "Fall cloth"}
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-paper/85 md:text-base">
            {settings.store.tagline}. One coat. One knit. A trouser with enough cloth to sit. Guest checkout. Rapid or cash on delivery.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-8">
            <Link
              href="/shop"
              className="tap inline-flex items-center border border-paper/80 px-6 text-[11px] uppercase tracking-[0.22em] text-paper hover:bg-paper hover:text-ink"
            >
              The shop
            </Link>
            <Link href="/lookbook/fall-cloth" className="link-underline text-[11px] uppercase tracking-[0.22em] text-paper/90">
              Fall look
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
              Guest checkout · Prices in USD · Rapid or cash on delivery · 30-day returns · No customer accounts · Stock checked on the server ·&nbsp;
            </span>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-3xl px-6 py-20 text-center md:py-28">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted">A house note</p>
        <p className="mt-6 font-serif text-[clamp(1.7rem,3.5vw,2.75rem)] leading-[1.25] text-ink">
          We sell clothes you can name. Merino. Waxed cotton. Unfinished hems. If a size is gone, the site says so.
        </p>
        <p className="mx-auto mt-6 max-w-lg text-[15px] leading-relaxed text-muted">
          No account. No points. Prices in dollars. Rapid Gateway takes the card in rupees. Cash on delivery stays unpaid until the cash is in the envelope.
        </p>
      </section>

      <LookStrip look={FALL} align="left" />

      {rack.length ? (
        <section className="mx-auto max-w-catalog px-5 py-16 md:px-8 md:py-24">
          <Reveal>
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted">From the rack</p>
                <h2 className="mt-2 font-serif text-4xl md:text-5xl">A few pieces</h2>
              </div>
              <Link href="/shop" className="link-underline hidden text-[11px] uppercase tracking-[0.18em] md:inline">
                All cloth
              </Link>
            </div>
          </Reveal>
          <div className="-mx-5 grid grid-cols-1 gap-0 sm:mx-0 sm:grid-cols-2 sm:gap-10">
            {rack.map((p, i) => (
              <Reveal key={p.slug} delay={i * 80}>
                <ProductCard product={toCard(p)} currency={currency} index={i} large />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      <LookStrip look={TOWN} align="right" />

      {cats.length ? (
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2">
            {cats.map((c) => (
              <Link
                key={c.id}
                href={`/shop?category=${c.slug}`}
                className="group relative block min-h-[52vh] overflow-hidden md:min-h-[64vh]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.image || "/images/banners/linen.jpg"}
                  alt=""
                  className="photo-grade absolute inset-0 h-full w-full object-cover duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-ink/30 transition group-hover:bg-ink/40" />
                <div className="relative z-10 flex h-full min-h-[52vh] flex-col justify-end p-8 text-paper md:min-h-[64vh] md:p-12">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-paper/70">Department</p>
                  <h2 className="mt-3 font-serif text-5xl md:text-6xl">{c.name}</h2>
                  {c.description ? <p className="mt-3 max-w-xs text-sm text-paper/80">{c.description}</p> : null}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <LookStrip look={EVENING} align="left" />

      {marked.length ? (
        <section className="border-y border-line bg-mist">
          <div className="mx-auto grid max-w-catalog gap-10 px-5 py-16 md:grid-cols-12 md:px-8 md:py-20">
            <div className="md:col-span-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted">Marked down</p>
              <h2 className="mt-3 font-serif text-4xl md:text-5xl">A few on sale</h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
                Compare-at is the last full price. Coupon KNIT15 is fifteen percent off knitwear at checkout — not stacked on these.
              </p>
              <Link href="/shop?sale=1" className="link-underline mt-6 inline-block text-[11px] uppercase tracking-[0.18em]">
                Sale cloth
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:col-span-8">
              {marked.map((p, i) => (
                <ProductCard key={p.slug} product={toCard(p)} currency={currency} index={i} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-catalog px-5 py-16 md:px-8 md:py-24">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <Link href={`/lookbook/${WEEKEND.slug}`} className="group relative block overflow-hidden">
            <div className="aspect-[4/5] overflow-hidden bg-bone">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={WEEKEND.image} alt="" className="photo-grade h-full w-full object-cover duration-700 group-hover:scale-105" />
            </div>
          </Link>
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted">{WEEKEND.kicker}</p>
            <h2 className="mt-3 font-serif text-5xl md:text-6xl">{WEEKEND.title}</h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted">{WEEKEND.essay.split("\n\n")[0]}</p>
            <Link
              href={`/lookbook/${WEEKEND.slug}`}
              className="tap mt-8 inline-flex items-center border border-ink px-6 text-[11px] uppercase tracking-[0.2em] hover:bg-ink hover:text-paper"
            >
              The kit
            </Link>
          </div>
        </div>
      </section>

      {justIn.length ? (
        <section className="mx-auto max-w-catalog px-5 pb-8 md:px-8">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-serif text-4xl md:text-5xl">Just in</h2>
            <Link href="/shop?sort=newest" className="link-underline text-[11px] uppercase tracking-[0.18em]">
              Newest first
            </Link>
          </div>
          <div className="-mx-5 flex snap-x snap-mandatory gap-0 overflow-x-auto pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-8 sm:overflow-visible md:grid-cols-4">
            {justIn.map((p, i) => (
              <div key={p.slug} className="w-[86vw] shrink-0 snap-start sm:w-auto">
                <ProductCard product={toCard(p)} currency={currency} index={i} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="border-y border-line bg-mist">
        <div className="mx-auto grid max-w-catalog gap-10 px-5 py-14 md:grid-cols-3 md:px-8">
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

      {faqs.length ? (
        <section className="mx-auto max-w-catalog px-5 py-16 md:px-8">
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-4xl">Questions, answered</h2>
            <Link href="/faq" className="link-underline text-[12px] uppercase tracking-widest">
              All FAQs
            </Link>
          </div>
          <dl className="mt-8 divide-y divide-line border-y border-line">
            {faqs.map((f) => (
              <div key={f.id} className="grid gap-2 py-6 md:grid-cols-3">
                <dt className="font-medium">{f.question}</dt>
                <dd className="text-sm leading-relaxed text-muted md:col-span-2">{f.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <section className="border-t border-line px-5 py-16 text-center md:py-20">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Colophon</p>
        <p className="mx-auto mt-4 max-w-xl font-serif text-2xl leading-snug md:text-3xl">
          North &amp; Co. · Cloth for town. Guest checkout. Rapid or cash on delivery. Pakistan law.
        </p>
      </section>

      <RecentlyViewed />
    </>
  );
}

function LookStrip({
  look,
  align,
}: {
  look: (typeof LOOKBOOKS)[number];
  align: "left" | "right";
}) {
  return (
    <Link href={`/lookbook/${look.slug}`} className="group relative block min-h-[72vh] overflow-hidden md:min-h-[88vh]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={look.image}
        alt=""
        className="photo-grade absolute inset-0 h-full w-full object-cover duration-[1.2s] group-hover:scale-[1.04]"
      />
      <div
        className={`absolute inset-0 ${
          align === "right"
            ? "bg-gradient-to-l from-ink/70 via-ink/25 to-transparent"
            : "bg-gradient-to-r from-ink/70 via-ink/25 to-transparent"
        }`}
      />
      <div
        className={`relative z-10 mx-auto flex min-h-[72vh] max-w-catalog flex-col justify-end px-6 pb-16 text-paper md:min-h-[88vh] md:px-8 md:pb-20 ${
          align === "right" ? "items-end text-right" : "items-start"
        }`}
      >
        <p className="text-[11px] uppercase tracking-[0.24em] text-paper/75">{look.kicker}</p>
        <h2 className="mt-4 max-w-xl font-serif text-[clamp(2.8rem,7vw,6.4rem)] leading-[0.9]">{look.title}</h2>
        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-paper/85">{look.subtitle}</p>
        <span className="mt-8 inline-flex min-h-[44px] items-center text-[11px] uppercase tracking-[0.2em]">Open the look</span>
      </div>
    </Link>
  );
}
