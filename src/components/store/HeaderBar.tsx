"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SearchModal } from "./SearchModal";
import { LOOKBOOKS } from "@/lib/lookbooks";

type Item = { id: string; label: string; href: string };

export function HeaderBar({ items, initialCount }: { items: Item[]; initialCount: number }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const sync = async () => {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const j = await res.json();
        setCount(j.itemCount ?? 0);
      }
    };
    sync();
    window.addEventListener("nc-cart", sync);
    return () => window.removeEventListener("nc-cart", sync);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="bg-ink text-paper">
        <p className="mx-auto max-w-catalog px-4 py-2 text-center text-[11px] uppercase tracking-[0.18em]">
          Guest checkout · No accounts · Rapid or cash on delivery
        </p>
      </div>
      <header
        className={`sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur transition-shadow duration-500 ${scrolled ? "shadow-sm" : ""}`}
      >
        <div
          className={`mx-auto flex max-w-catalog items-center justify-between gap-4 px-4 transition-all duration-500 ${scrolled ? "py-2" : "py-3 lg:py-4"}`}
        >
          <button
            type="button"
            className="tap px-1 text-sm uppercase tracking-widest lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            {open ? "Close" : "Menu"}
          </button>
          <Link href="/" className="font-serif text-xl tracking-brand sm:text-2xl">
            NORTH &amp; CO.
          </Link>
          <nav className="hidden items-center gap-6 text-[13px] uppercase tracking-[0.16em] lg:flex">
            {items.map((i) => (
              <Link key={i.id} href={i.href} className="link-underline hover:text-copper">
                {i.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1 text-[12px] uppercase tracking-[0.14em] sm:gap-3">
            <button type="button" onClick={() => setSearch(true)} className="tap px-2 hover:text-copper">
              Search
            </button>
            <Link href="/wishlist" className="tap hidden items-center px-2 hover:text-copper sm:inline-flex">
              Wishlist
            </Link>
            <Link href="/track" className="tap hidden items-center px-2 hover:text-copper sm:inline-flex">
              Track
            </Link>
            <Link href="/cart" className={`tap inline-flex items-center px-2 hover:text-copper ${count > 0 ? "cart-pop" : ""}`}>
              Cart {count > 0 ? `(${count})` : ""}
            </Link>
          </div>
        </div>
      </header>

      {open ? (
        <div className="overlay-in fixed inset-0 z-50 bg-paper lg:hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <p className="font-serif text-xl">The book</p>
            <button type="button" className="tap px-2 text-[12px] uppercase tracking-widest" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
          <div className="h-[calc(100%-57px)] overflow-y-auto">
            {LOOKBOOKS.map((l) => (
              <Link
                key={l.slug}
                href={`/lookbook/${l.slug}`}
                onClick={() => setOpen(false)}
                className="group relative block min-h-[28vh] overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={l.image} alt="" className="photo-grade absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-ink/40" />
                <div className="relative z-10 flex min-h-[28vh] flex-col justify-end p-6 text-paper">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-paper/70">{l.kicker}</p>
                  <h2 className="mt-2 font-serif text-4xl">{l.title}</h2>
                </div>
              </Link>
            ))}
            <nav className="px-6 py-8">
              <ul className="space-y-1 text-sm uppercase tracking-[0.16em]">
                {items.map((i) => (
                  <li key={i.id}>
                    <Link href={i.href} onClick={() => setOpen(false)} className="tap flex items-center">
                      {i.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/wishlist" onClick={() => setOpen(false)} className="tap flex items-center">
                    Wishlist
                  </Link>
                </li>
                <li>
                  <Link href="/track" onClick={() => setOpen(false)} className="tap flex items-center">
                    Track order
                  </Link>
                </li>
                <li>
                  <Link href="/contact" onClick={() => setOpen(false)} className="tap flex items-center">
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      ) : null}

      {search ? <SearchModal onClose={() => setSearch(false)} /> : null}
    </>
  );
}
