import Link from "next/link";
import { LOOKBOOKS } from "@/lib/lookbooks";
import { Reveal } from "@/components/store/Reveal";

export const metadata = { title: "Lookbooks" };

export default function LookbooksPage() {
  return (
    <div className="mx-auto max-w-catalog px-4 py-16">
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Styled together</p>
      <h1 className="mt-2 font-serif text-5xl">Lookbooks</h1>
      <p className="mt-4 max-w-xl text-sm text-muted">
        Complete outfits from the catalog. Every piece is a real SKU with live stock. Add the set, or open each item.
      </p>
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {LOOKBOOKS.map((l, i) => (
          <Reveal key={l.slug} delay={i * 80}>
            <Link href={`/lookbook/${l.slug}`} className="group block">
              <div className="aspect-[4/5] overflow-hidden bg-bone">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={l.image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              </div>
              <h2 className="mt-4 font-serif text-2xl">{l.title}</h2>
              <p className="mt-1 text-sm text-muted">{l.subtitle}</p>
              <p className="mt-3 text-[11px] uppercase tracking-widest">Shop the look</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
