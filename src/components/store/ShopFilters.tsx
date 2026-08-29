"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type Cat = { slug: string; name: string; children: { slug: string; name: string }[] };
type Brand = { slug: string; name: string };

const SIZES = ["XS", "S", "M", "L", "XL", "28", "30", "32", "34", "36"];
const COLORS = [
  "Navy",
  "Oat",
  "Black",
  "White",
  "Olive",
  "Ink",
  "Camel",
  "Indigo",
  "Stone",
  "Ivory",
  "Charcoal",
  "Sand",
  "Khaki",
  "Bone",
  "Rust",
  "Washed",
];
const GENDERS = [
  ["men", "Men"],
  ["women", "Women"],
  ["unisex", "Unisex"],
];
const STYLES = [
  ["minimal", "Minimal"],
  ["workwear", "Workwear"],
  ["outdoor", "Outdoor"],
  ["evening", "Evening"],
  ["basics", "Basics"],
];

export function ShopFilters({ categories, brands }: { categories: Cat[]; brands: Brand[] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function set(key: string, value?: string) {
    const next = new URLSearchParams(sp.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    next.delete("page");
    router.push(`/shop?${next.toString()}`);
  }

  const body = (
    <form
      className="space-y-8 text-sm"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const next = new URLSearchParams(sp.toString());
        const min = String(fd.get("min") || "");
        const max = String(fd.get("max") || "");
        if (min) next.set("min", min);
        else next.delete("min");
        if (max) next.set("max", max);
        else next.delete("max");
        next.delete("page");
        router.push(`/shop?${next.toString()}`);
      }}
    >
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Sort</p>
        <select
          className="tap mt-2 w-full border border-line bg-paper px-2"
          value={sp.get("sort") || "newest"}
          onChange={(e) => set("sort", e.target.value)}
        >
          <option value="relevance">Relevance</option>
          <option value="newest">Newest</option>
          <option value="bestselling">Best selling</option>
          <option value="price_asc">Price, low to high</option>
          <option value="price_desc">Price, high to low</option>
          <option value="rating">Highest rated</option>
        </select>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Category</p>
        <ul className="mt-2 space-y-1">
          <li>
            <button type="button" className={`tap px-0 ${!sp.get("category") ? "text-copper" : ""}`} onClick={() => set("category")}>
              All
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <button
                type="button"
                className={`tap px-0 ${sp.get("category") === c.slug ? "text-copper" : ""}`}
                onClick={() => set("category", c.slug)}
              >
                {c.name}
              </button>
              {c.children.length ? (
                <ul className="ml-3 mt-1 space-y-1 text-muted">
                  {c.children.map((ch) => (
                    <li key={ch.slug}>
                      <button
                        type="button"
                        className={`tap px-0 ${sp.get("category") === ch.slug ? "text-copper" : ""}`}
                        onClick={() => set("category", ch.slug)}
                      >
                        {ch.name}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Brand</p>
        <ul className="mt-2 space-y-1">
          {brands.map((b) => (
            <li key={b.slug}>
              <button
                type="button"
                className={`tap px-0 ${sp.get("brand") === b.slug ? "text-copper" : ""}`}
                onClick={() => set("brand", sp.get("brand") === b.slug ? undefined : b.slug)}
              >
                {b.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Gender</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {GENDERS.map(([id, label]) => (
            <button
              type="button"
              key={id}
              onClick={() => set("gender", sp.get("gender") === id ? undefined : id)}
              className={`tap border px-3 text-xs ${sp.get("gender") === id ? "border-ink bg-ink text-paper" : "border-line"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Style</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {STYLES.map(([id, label]) => (
            <button
              type="button"
              key={id}
              onClick={() => set("style", sp.get("style") === id ? undefined : id)}
              className={`tap border px-3 text-xs ${sp.get("style") === id ? "border-ink bg-ink text-paper" : "border-line"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Price (USD)</p>
        <div className="mt-2 flex gap-2">
          <input name="min" defaultValue={sp.get("min") || ""} placeholder="Min" className="tap w-full border border-line bg-transparent px-2" />
          <input name="max" defaultValue={sp.get("max") || ""} placeholder="Max" className="tap w-full border border-line bg-transparent px-2" />
        </div>
        <button className="tap mt-2 text-[11px] uppercase tracking-widest underline">Apply</button>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Size</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {SIZES.map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => set("size", sp.get("size") === s ? undefined : s)}
              className={`tap min-w-[44px] border px-2 text-xs ${sp.get("size") === s ? "border-ink bg-ink text-paper" : "border-line"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Color</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {COLORS.map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => set("color", sp.get("color") === s ? undefined : s)}
              className={`tap border px-3 text-xs ${sp.get("color") === s ? "border-ink bg-ink text-paper" : "border-line"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <label className="tap flex items-center gap-2">
          <input type="checkbox" checked={sp.get("inStock") === "1"} onChange={(e) => set("inStock", e.target.checked ? "1" : undefined)} />
          In stock
        </label>
        <label className="tap flex items-center gap-2">
          <input type="checkbox" checked={sp.get("sale") === "1"} onChange={(e) => set("sale", e.target.checked ? "1" : undefined)} />
          On sale
        </label>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Rating</p>
        {[4, 3].map((r) => (
          <button key={r} type="button" className="tap block px-0" onClick={() => set("rating", sp.get("rating") === String(r) ? undefined : String(r))}>
            {r}+ stars {sp.get("rating") === String(r) ? "✓" : ""}
          </button>
        ))}
      </div>
      <button type="button" className="tap text-[11px] uppercase tracking-widest underline" onClick={() => router.push("/shop")}>
        Clear all
      </button>
    </form>
  );

  return (
    <aside>
      <button
        type="button"
        className="tap mb-4 border border-line px-4 text-[12px] uppercase tracking-widest lg:hidden"
        onClick={() => setOpen(true)}
      >
        Filter the rack
      </button>

      {open ? (
        <div className="overlay-in fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Close filters" onClick={() => setOpen(false)} />
          <div className="filter-drawer relative h-full w-[min(100%,22rem)] overflow-y-auto border-r border-line bg-paper p-6">
            <div className="mb-6 flex items-center justify-between">
              <p className="font-serif text-2xl">Filter</p>
              <button type="button" className="tap text-[12px] uppercase tracking-widest" onClick={() => setOpen(false)}>
                Done
              </button>
            </div>
            {body}
          </div>
        </div>
      ) : null}

      <div className="hidden lg:block">{body}</div>
    </aside>
  );
}
