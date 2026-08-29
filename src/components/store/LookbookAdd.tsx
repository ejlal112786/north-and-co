"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LookbookAdd({ variantIds }: { variantIds: string[] }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  async function add() {
    setBusy(true);
    setMsg("");
    try {
      for (const variantId of variantIds) {
        const res = await fetch("/api/cart/items", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ variantId, quantity: 1 }),
        });
        if (!res.ok) {
          const j = await res.json();
          setMsg(j.error || "Could not add a piece — check stock.");
          return;
        }
      }
      window.dispatchEvent(new Event("nc-cart"));
      router.push("/cart");
    } finally {
      setBusy(false);
    }
  }

  if (!variantIds.length) return null;
  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={add}
        className="tap bg-paper px-6 text-[12px] uppercase tracking-[0.16em] text-ink disabled:opacity-40"
      >
        {busy ? "Adding…" : "Add the look to cart"}
      </button>
      {msg ? <p className="mt-3 text-sm text-sale">{msg}</p> : null}
    </div>
  );
}
