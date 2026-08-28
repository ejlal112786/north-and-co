"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function QuickAdd({ variantId }: { variantId: string }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <button
      type="button"
      disabled={busy}
      aria-label="Add to cart"
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setBusy(true);
        try {
          const res = await fetch("/api/cart/items", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ variantId, quantity: 1 }),
          });
          if (!res.ok) {
            const j = await res.json().catch(() => ({}));
            alert(j.error || "Could not add to cart");
          } else {
            window.dispatchEvent(new Event("nc-cart"));
            router.refresh();
          }
        } finally {
          setBusy(false);
        }
      }}
      className="grid h-8 w-8 place-items-center bg-ink text-paper text-sm"
    >
      {busy ? "…" : "+"}
    </button>
  );
}
