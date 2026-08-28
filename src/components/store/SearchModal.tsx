"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/money";

type Suggest = {
  products: { name: string; slug: string; images: { url: string }[]; variants: { priceCents: number }[] }[];
  categories: { name: string; slug: string }[];
};

export function SearchModal({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const [data, setData] = useState<Suggest | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    input.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (q.trim().length < 2) {
      setData(null);
      return;
    }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(q)}`);
      if (res.ok) setData(await res.json());
    }, 180);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="fixed inset-0 z-50 bg-ink/40" onClick={onClose}>
      <div
        className="mx-auto mt-16 max-w-xl border border-line bg-paper p-4 shadow-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) {
              router.push(`/search?q=${encodeURIComponent(q.trim())}`);
              onClose();
            }
          }}
        >
          <label className="text-[11px] uppercase tracking-[0.18em] text-muted">Search the shop</label>
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Merino, linen, brass…"
            className="mt-2 w-full border-b border-ink bg-transparent py-2 text-lg outline-none"
          />
        </form>
        {data ? (
          <div className="mt-4 grid gap-4 text-sm">
            {data.categories.length ? (
              <div>
                <p className="text-[11px] uppercase tracking-widest text-muted">Categories</p>
                <ul className="mt-1">
                  {data.categories.map((c) => (
                    <li key={c.slug}>
                      <Link href={`/shop?category=${c.slug}`} onClick={onClose} className="block py-1 hover:text-copper">
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {data.products.length ? (
              <ul className="divide-y divide-line">
                {data.products.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/product/${p.slug}`} onClick={onClose} className="flex items-center gap-3 py-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.images[0]?.url || "/images/fallback.jpg"} alt="" className="h-12 w-10 object-cover bg-bone" />
                      <span className="flex-1">{p.name}</span>
                      <span className="text-muted">{formatMoney(p.variants[0]?.priceCents ?? 0)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : q.trim().length >= 2 ? (
              <p className="text-muted">No exact matches. Press enter to search.</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
