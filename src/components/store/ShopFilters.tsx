"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type Cat = { slug: string; name: string; children: { slug: string; name: string }[] };
type Brand = { slug: string; name: string };

const SIZES = ["S", "M", "L", "XL", "28", "30", "32", "34", "36"];
const COLORS = ["Navy", "Oat", "Black", "White", "Olive", "Ink", "Flax", "Brass", "Tan", "Rust", "Charcoal", "Sand", "Terracotta"];
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
          className="mt-2 w-full border border-line bg-paper px-2 py-2"
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
            <button type="button" className={!sp.get("category") ? "text-copper" : ""} onClick={() => set("category")}>
              All
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <button
                type="button"
                className={sp.get("category") === c.slug ? "text-copper" : ""}
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
                        className={sp.get("category") === ch.slug ? "text-copper" : ""}
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
                className={sp.get("brand") === b.slug ? "text-copper" : ""}
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
              className={`border px-2 py-1 text-xs ${sp.get("gender") === id ? "border-ink bg-ink text-paper" : "border-line"}`}
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
              className={`border px-2 py-1 text-xs ${sp.get("style") === id ? "border-ink bg-ink text-paper" : "border-line"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Price (PKR)</p>
        <div className="mt-2 flex gap-2">
          <input name="min" defaultValue={sp.get("min") || ""} placeholder="Min" className="w-full border border-line bg-transparent px-2 py-1" />
          <input name="max" defaultValue={sp.get("max") || ""} placeholder="Max" className="w-full border border-line bg-transparent px-2 py-1" />
        </div>
        <button className="mt-2 text-[11px] uppercase tracking-widest underline">Apply</button>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Size</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {SIZES.map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => set("size", sp.get("size") === s ? undefined : s)}
              className={`border px-2 py-1 text-xs ${sp.get("size") === s ? "border-ink bg-ink text-paper" : "border-line"}`}
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
              className={`border px-2 py-1 text-xs ${sp.get("color") === s ? "border-ink bg-ink text-paper" : "border-line"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={sp.get("inStock") === "1"} onChange={(e) => set("inStock", e.target.checked ? "1" : undefined)} />
          In stock
        </label>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Rating</p>
        {[4, 3].map((r) => (
          <button key={r} type="button" className="block" onClick={() => set("rating", sp.get("rating") === String(r) ? undefined : String(r))}>
            {r}+ stars {sp.get("rating") === String(r) ? "✓" : ""}
          </button>
        ))}
      </div>
      <button type="button" className="text-[11px] uppercase tracking-widest underline" onClick={() => router.push("/shop")}>
        Clear all
      </button>
    </form>
  );

  return (
    <aside>
      <button className="mb-4 border border-line px-3 py-2 text-[12px] uppercase tracking-widest lg:hidden" onClick={() => setOpen((v) => !v)}>
        {open ? "Hide filters" : "Filters"}
      </button>
      <div className={`${open ? "block" : "hidden"} lg:block`}>{body}</div>
    </aside>
  );
}
