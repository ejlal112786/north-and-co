import Link from "next/link";
import { LOOKBOOKS } from "@/lib/lookbooks";

export const metadata = { title: "Lookbooks" };

export default function LookbooksPage() {
  return (
    <div>
      <section className="mx-auto max-w-3xl px-6 py-16 text-center md:py-20">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Styled together</p>
        <h1 className="mt-4 font-serif text-[clamp(3rem,8vw,6rem)] leading-[0.9]">Lookbooks</h1>
        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
          Complete outfits from the catalog. Every piece is a live SKU with server stock. Add the set, or open each item.
        </p>
      </section>
      <div>
        {LOOKBOOKS.map((l) => (
          <Link key={l.slug} href={`/lookbook/${l.slug}`} className="group relative block min-h-[70vh] overflow-hidden md:min-h-[82vh]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={l.image} alt="" className="photo-grade absolute inset-0 h-full w-full object-cover duration-[1.1s] group-hover:scale-[1.04]" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/20 to-ink/10" />
            <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-catalog flex-col justify-end px-6 pb-16 text-paper md:min-h-[82vh] md:px-8 md:pb-20">
              <p className="text-[11px] uppercase tracking-[0.24em] text-paper/75">{l.kicker}</p>
              <h2 className="mt-3 font-serif text-[clamp(2.6rem,7vw,6rem)] leading-[0.9]">{l.title}</h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-paper/85">{l.subtitle}</p>
              <span className="mt-8 inline-flex min-h-[44px] items-center text-[11px] uppercase tracking-[0.2em]">Open the look</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
