"use client";

import { useEffect, useState } from "react";
import { getWishlist } from "@/components/store/wishlist-store";
import { ProductCard, type CardProduct } from "@/components/store/ProductCard";
import Link from "next/link";

export default function WishlistPage() {
  const [products, setProducts] = useState<CardProduct[] | null>(null);
  useEffect(() => {
    const slugs = getWishlist();
    if (!slugs.length) {
      setProducts([]);
      return;
    }
    fetch(`/api/products?slugs=${slugs.join(",")}`)
      .then((r) => r.json())
      .then((j) => setProducts(j.products || []));
  }, []);
  return (
    <div className="mx-auto max-w-catalog px-4 py-10">
      <h1 className="font-serif text-4xl">Wishlist</h1>
      <p className="mt-2 text-sm text-muted">Stored in this browser only. We do not have customer accounts to sync it to.</p>
      {products == null ? <p className="mt-8 text-sm">Loading…</p> : null}
      {products && !products.length ? (
        <p className="mt-8">
          Empty. <Link href="/shop" className="underline">Shop</Link>
        </p>
      ) : null}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {products?.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}
