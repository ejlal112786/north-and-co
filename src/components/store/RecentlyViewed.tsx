"use client";

import { useEffect, useState } from "react";
import { getRecent } from "./wishlist-store";
import { ProductCard, type CardProduct } from "./ProductCard";

export function RecentlyViewed({ exclude }: { exclude?: string }) {
  const [products, setProducts] = useState<CardProduct[]>([]);
  useEffect(() => {
    const slugs = getRecent().filter((s) => s !== exclude);
    if (!slugs.length) return;
    fetch(`/api/products?slugs=${slugs.join(",")}`)
      .then((r) => r.json())
      .then((j) => setProducts(j.products || []));
  }, [exclude]);
  if (!products.length) return null;
  return (
    <section className="mx-auto max-w-catalog px-4 py-16">
      <h2 className="font-serif text-3xl">Recently viewed</h2>
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}
