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
    <div className="mx-auto max-w-catalog px-5 py-10 md:px-4">
      <p className="text-[11px] uppercase tracking-[0.22em] text-muted">This browser only</p>
      <h1 className="mt-2 font-serif text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.92]">Wishlist</h1>
      <p className="mt-4 max-w-md text-sm text-muted">
        Stored here, not in an account. We do not have customer logins to sync it to.
      </p>
      {products == null ? <p className="mt-8 text-sm">Loading…</p> : null}
      {products && !products.length ? (
        <div className="mt-10 border border-line p-8 md:p-12">
          <h2 className="font-serif text-4xl">Nothing saved.</h2>
          <p className="mt-3 max-w-md text-sm text-muted">Open a piece and tap the heart. It stays on this device.</p>
          <Link href="/shop" className="link-underline mt-6 inline-flex min-h-[44px] items-center text-[12px] uppercase tracking-[0.16em]">
            The shop
          </Link>
        </div>
      ) : null}
      <div className="catalog-grid mt-8 -mx-5 grid grid-cols-1 gap-0 sm:mx-0 sm:grid-cols-2 sm:gap-6 md:grid-cols-4">
        {products?.map((p, i) => (
          <ProductCard key={p.slug} product={p} index={i} />
        ))}
      </div>
    </div>
  );
}
