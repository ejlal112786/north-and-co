import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { NewsletterForm } from "./NewsletterForm";
import { getSettings } from "@/lib/settings";

export async function Footer() {
  const [items, settings] = await Promise.all([
    prisma.navigationItem.findMany({
      where: { location: "footer", isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    getSettings(),
  ]);
  return (
    <footer className="mt-8 border-t border-line bg-paper">
      <div className="mx-auto max-w-catalog px-5 py-14 md:px-8 md:py-16">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="font-serif text-3xl tracking-brand">NORTH &amp; CO.</p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
              Cloth for town. Guest checkout only — we do not keep customer accounts. Keep your order number.
            </p>
            <NewsletterForm />
          </div>
          <div className="md:col-span-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted">The shop</p>
            <ul className="mt-4 space-y-1 text-sm">
              {items.map((i) => (
                <li key={i.id}>
                  <Link href={i.href} className="tap inline-flex items-center hover:text-copper">
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Desk</p>
            <p className="mt-4 text-sm leading-relaxed">{settings.store.email}</p>
            <p className="mt-3 text-sm text-muted">
              Returns within {settings.returns.windowDays} days. Rapid Gateway or cash on delivery.
            </p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <Link href="/contact" className="link-underline">
                Write
              </Link>
              <Link href="/faq" className="link-underline">
                FAQs
              </Link>
              <Link href="/track" className="link-underline">
                Track
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-catalog flex-wrap items-center justify-between gap-2 px-5 py-5 text-[11px] uppercase tracking-[0.16em] text-muted md:px-8">
          <span>© {new Date().getFullYear()} North &amp; Co. · Pakistan law</span>
          <span>Stock reserved server-side · No fake urgency</span>
        </div>
      </div>
    </footer>
  );
}
