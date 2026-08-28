"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatMoney, discountPercent } from "@/lib/money";
import { Stars } from "./Stars";
import { WishlistButton } from "./WishlistButton";
import { SizeGuide } from "./SizeGuide";
import { parseJson } from "@/lib/utils";
import { swatchHex } from "@/lib/swatches";

function availableQty(stockQty: number, reservedQty: number) {
  return Math.max(0, stockQty - reservedQty);
}

type Variant = {
  id: string;
  title: string;
  sku: string;
  priceCents: number;
  compareAtCents: number | null;
  stockQty: number;
  reservedQty: number;
  options: string;
};

export function ProductBuyBox({
  product,
  currency,
  avg,
  reviewCount,
}: {
  product: {
    id: string;
    slug: string;
    name: string;
    variants: Variant[];
    sizes: string[];
    colors: string[];
  };
  currency: string;
  avg: number;
  reviewCount: number;
}) {
  const router = useRouter();
  const [color, setColor] = useState(product.colors[0] || "");
  const [size, setSize] = useState(product.sizes[0] || "");
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const variant = useMemo(() => {
    return (
      product.variants.find((v) => {
        const o = parseJson<{ size?: string; color?: string }>(v.options, {});
        if (product.colors.length && o.color !== color) return false;
        if (product.sizes.length && o.size !== size) return false;
        return true;
      }) || product.variants[0]
    );
  }, [product, color, size]);

  if (!variant) return <p>Unavailable.</p>;
  const avail = availableQty(variant.stockQty, variant.reservedQty);
  const sale = discountPercent(variant.priceCents, variant.compareAtCents);

  async function add(goCheckout: boolean) {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ variantId: variant.id, quantity: qty }),
      });
      const j = await res.json();
      if (!res.ok) {
        setMsg(j.error || "Could not add");
        return;
      }
      window.dispatchEvent(new Event("nc-cart"));
      fetch("/api/analytics", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type: "add_to_cart", meta: { variantId: variant.id } }),
      }).catch(() => null);
      if (goCheckout) router.push("/checkout");
      else {
        setMsg("Added to cart.");
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6">
      <div className="flex items-baseline gap-3">
        <p className="text-2xl">{formatMoney(variant.priceCents, currency)}</p>
        {variant.compareAtCents && variant.compareAtCents > variant.priceCents ? (
          <p className="text-muted line-through">{formatMoney(variant.compareAtCents, currency)}</p>
        ) : null}
        {sale ? <p className="text-sale text-sm">−{sale}%</p> : null}
      </div>
      {reviewCount ? (
        <a href="#reviews" className="mt-2 inline-block">
          <Stars value={avg} count={reviewCount} />
        </a>
      ) : null}
      <p className="mt-2 text-xs text-muted">SKU {variant.sku}</p>
      <p className={`mt-2 text-sm ${avail <= 0 ? "text-sale" : avail <= 5 ? "text-copper" : "text-sage"}`}>
        {avail <= 0 ? "Out of stock" : avail <= 5 ? `${avail} left` : "In stock"}
      </p>

      {product.colors.length ? (
        <div className="mt-6">
          <p className="text-[11px] uppercase tracking-widest text-muted">Color — {color}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {product.colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                title={c}
                className={`h-8 w-8 rounded-full border ${c === color ? "border-ink ring-1 ring-ink" : "border-line"}`}
                style={{ background: swatchHex(c) }}
                aria-label={c}
              />
            ))}
          </div>
        </div>
      ) : null}
      {product.sizes.length ? (
        <div className="mt-4">
          <p className="text-[11px] uppercase tracking-widest text-muted">Size — {size}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.sizes.map((s) => {
              const exists = product.variants.some((v) => {
                const o = parseJson<{ size?: string; color?: string }>(v.options, {});
                return o.size === s && (!product.colors.length || o.color === color);
              });
              const v = product.variants.find((vr) => {
                const o = parseJson<{ size?: string; color?: string }>(vr.options, {});
                return o.size === s && (!product.colors.length || o.color === color);
              });
              const a = v ? availableQty(v.stockQty, v.reservedQty) : 0;
              return (
                <button
                  key={s}
                  type="button"
                  disabled={!exists || a <= 0}
                  onClick={() => setSize(s)}
                  className={`border px-3 py-1 text-sm disabled:opacity-30 ${s === size ? "border-ink bg-ink text-paper" : "border-line"}`}
                >
                  {s}
                </button>
              );
            })}
          </div>
          <SizeGuide sizes={product.sizes} />
        </div>
      ) : null}

      <div className="mt-6 flex items-center gap-3">
        <label className="text-[11px] uppercase tracking-widest text-muted">Qty</label>
        <input
          type="number"
          min={1}
          max={Math.max(1, avail)}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
          className="w-16 border border-line bg-transparent px-2 py-2 text-center"
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          disabled={busy || avail <= 0}
          onClick={() => add(false)}
          className="bg-ink px-6 py-3 text-[12px] uppercase tracking-[0.16em] text-paper disabled:opacity-40"
        >
          Add to cart
        </button>
        <button
          disabled={busy || avail <= 0}
          onClick={() => add(true)}
          className="border border-ink px-6 py-3 text-[12px] uppercase tracking-[0.16em] disabled:opacity-40"
        >
          Buy now
        </button>
        <WishlistButton slug={product.slug} />
      </div>
      {msg ? <p className="mt-3 text-sm">{msg}</p> : null}
    </div>
  );
}
