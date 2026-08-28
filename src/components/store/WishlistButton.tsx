"use client";

import { useEffect, useState } from "react";
import { getWishlist, toggleWishlist } from "./wishlist-store";

export function WishlistButton({ slug }: { slug: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(getWishlist().includes(slug));
  }, [slug]);
  return (
    <button
      type="button"
      aria-label={on ? "Remove from wishlist" : "Add to wishlist"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setOn(toggleWishlist(slug).includes(slug));
      }}
      className="grid h-8 w-8 place-items-center bg-paper/90 text-sm"
    >
      {on ? "♥" : "♡"}
    </button>
  );
}
