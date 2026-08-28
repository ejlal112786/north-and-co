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
    <footer className="mt-24 border-t border-line bg-mist">
      <div className="mx-auto grid max-w-catalog gap-12 px-4 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-serif text-2xl tracking-brand">NORTH &amp; CO.</p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
            {settings.store.tagline}. Guest checkout only — we do not keep customer accounts. Keep your order
            number.
          </p>
          <NewsletterForm />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted">The shop</p>
          <ul className="mt-4 space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.id}>
                <Link href={i.href} className="hover:text-copper">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Support</p>
          <p className="mt-4 text-sm leading-relaxed">
            {settings.store.email}
            {settings.store.phone ? (
              <>
                <br />
                {settings.store.phone}
              </>
            ) : null}
          </p>
          <p className="mt-4 text-sm text-muted">
            Returns within {settings.returns.windowDays} days. Pay with Rapid Gateway (cards, JazzCash, easypaisa,
            Raast) or cash on delivery.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link href="/contact" className="underline">
              Write the desk
            </Link>
            <Link href="/faq" className="underline">
              FAQs
            </Link>
            <Link href="/track" className="underline">
              Track
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-catalog flex-wrap items-center justify-between gap-2 px-4 py-4 text-[11px] uppercase tracking-[0.16em] text-muted">
          <span>© {new Date().getFullYear()} North &amp; Co.</span>
          <span>Secure checkout · Stock reserved server-side · No fake urgency</span>
        </div>
      </div>
    </footer>
  );
}
