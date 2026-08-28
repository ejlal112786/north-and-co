"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SearchModal } from "./SearchModal";

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
        className={`sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur transition-shadow duration-300 ${scrolled ? "shadow-sm" : ""}`}
      >
        <div
          className={`mx-auto flex max-w-catalog items-center justify-between gap-4 px-4 transition-all duration-300 ${scrolled ? "py-2" : "py-3 lg:py-4"}`}
        >
          <button
            className="lg:hidden text-sm uppercase tracking-widest"
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
              <Link key={i.id} href={i.href} className="hover:text-copper">
                {i.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4 text-[12px] uppercase tracking-[0.14em]">
            <button type="button" onClick={() => setSearch(true)} className="hover:text-copper">
              Search
            </button>
            <Link href="/wishlist" className="hidden sm:inline hover:text-copper">
              Wishlist
            </Link>
            <Link href="/track" className="hidden sm:inline hover:text-copper">
              Track
            </Link>
            <Link href="/cart" className={`hover:text-copper ${count > 0 ? "cart-pop" : ""}`}>
              Cart {count > 0 ? `(${count})` : ""}
            </Link>
          </div>
        </div>
        {open ? (
          <nav className="border-t border-line px-4 py-4 lg:hidden">
            <ul className="space-y-3 text-sm uppercase tracking-[0.16em]">
              {items.map((i) => (
                <li key={i.id}>
                  <Link href={i.href} onClick={() => setOpen(false)}>
                    {i.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/wishlist" onClick={() => setOpen(false)}>
                  Wishlist
                </Link>
              </li>
              <li>
                <Link href="/track" onClick={() => setOpen(false)}>
                  Track order
                </Link>
              </li>
              <li>
                <Link href="/contact" onClick={() => setOpen(false)}>
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        ) : null}
      </header>
      {search ? <SearchModal onClose={() => setSearch(false)} /> : null}
    </>
  );
}
