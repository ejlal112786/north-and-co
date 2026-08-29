"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatMoney } from "@/lib/money";

type Summary = {
  items: {
    id: string;
    name: string;
    slug: string;
    variantTitle: string;
    image: string;
    quantity: number;
    available: number;
    unitPriceCents: number;
    lineTotalCents: number;
    outOfStock: boolean;
  }[];
  savedForLater: { id: string; name: string; slug: string; variantTitle: string; image: string; unitPriceCents: number }[];
  subtotalCents: number;
  discountCents: number;
  couponCode: string | null;
  couponError: string | null;
  itemCount: number;
};

export function CartView({ summary, currency }: { summary: Summary; currency: string }) {
  const router = useRouter();
  const [code, setCode] = useState(summary.couponCode || "");
  const [err, setErr] = useState(summary.couponError || "");

  async function patch(itemId: string, quantity: number, savedForLater?: boolean) {
    await fetch("/api/cart/items", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ itemId, quantity, savedForLater }),
    });
    window.dispatchEvent(new Event("nc-cart"));
    router.refresh();
  }

  if (!summary.items.length && !summary.savedForLater.length) {
    return (
      <div className="mt-8 border border-line p-10 md:p-14">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted">Cart</p>
        <p className="mt-3 font-serif text-4xl">Nothing in the bag.</p>
        <p className="mt-3 max-w-md text-sm text-muted">Guest checkout when you are ready. Stock is checked on the server, not guessed here.</p>
        <Link href="/shop" className="link-underline mt-6 inline-flex min-h-[44px] items-center text-[12px] uppercase tracking-[0.16em]">
          The shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
      <ul className="divide-y divide-line border-y border-line">
        {summary.items.map((i) => (
          <li key={i.id} className="flex gap-4 py-5">
            <Link href={`/product/${i.slug}`} className="h-28 w-24 shrink-0 bg-bone">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={i.image || "/images/fallback.jpg"} alt="" className="h-full w-full object-cover" />
            </Link>
            <div className="flex-1">
              <Link href={`/product/${i.slug}`} className="font-medium">
                {i.name}
              </Link>
              <p className="text-sm text-muted">{i.variantTitle}</p>
              {i.outOfStock ? <p className="text-sm text-sale">Out of stock — remove or save for later</p> : null}
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                <input
                  type="number"
                  min={1}
                  max={Math.max(1, i.available)}
                  defaultValue={i.quantity}
                  className="tap w-16 border border-line bg-transparent px-2"
                  onBlur={(e) => patch(i.id, Number(e.target.value))}
                />
                <button onClick={() => patch(i.id, 0)} className="tap underline">
                  Remove
                </button>
                <button onClick={() => patch(i.id, i.quantity, true)} className="tap underline">
                  Save for later
                </button>
              </div>
            </div>
            <p>{formatMoney(i.lineTotalCents, currency)}</p>
          </li>
        ))}
      </ul>
      <aside className="h-fit border border-line p-5">
        <p className="text-[11px] uppercase tracking-widest text-muted">Summary</p>
        <div className="mt-4 flex justify-between text-sm">
          <span>Subtotal</span>
          <span>{formatMoney(summary.subtotalCents, currency)}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span>Discount</span>
          <span>−{formatMoney(summary.discountCents, currency)}</span>
        </div>
        <p className="mt-2 text-xs text-muted">Shipping and tax are calculated at checkout from the server.</p>
        <form
          className="mt-4 flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const res = await fetch("/api/cart/coupon", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ code }),
            });
            const j = await res.json();
            setErr(j.error || "");
            router.refresh();
          }}
        >
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Coupon"
            className="tap flex-1 border border-line bg-transparent px-2 text-sm"
          />
          <button className="tap border border-ink px-3 text-[11px] uppercase tracking-widest">Apply</button>
        </form>
        {err ? <p className="mt-2 text-xs text-sale">{err}</p> : null}
        {summary.couponCode && !err ? <p className="mt-2 text-xs text-sage">Applied {summary.couponCode}</p> : null}
        <p className="mt-4 flex justify-between font-medium">
          <span>Estimated total</span>
          <span>{formatMoney(summary.subtotalCents - summary.discountCents, currency)}</span>
        </p>
        <Link href="/checkout" className="mt-6 block bg-ink py-3 text-center text-[12px] uppercase tracking-[0.16em] text-paper">
          Checkout as guest
        </Link>
        <p className="mt-3 text-center text-xs text-muted">No account required.</p>
      </aside>
      {summary.savedForLater.length ? (
        <div className="lg:col-span-2">
          <h2 className="font-serif text-2xl">Saved for later</h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {summary.savedForLater.map((i) => (
              <li key={i.id} className="flex items-center gap-4 py-4">
                <p className="flex-1">
                  {i.name} <span className="text-muted">{i.variantTitle}</span>
                </p>
                <button className="underline text-sm" onClick={() => patch(i.id, 1, false)}>
                  Move to cart
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
