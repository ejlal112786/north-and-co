"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { parseJson } from "@/lib/utils";

type Detail = {
  slug: string;
  name: string;
  image: string;
  currency?: string;
  variants: {
    id: string;
    title: string;
    priceCents: number;
    stockQty: number;
    reservedQty: number;
    options: string;
  }[];
};

export function QuickViewButton({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="grid h-8 w-8 place-items-center bg-paper/95 text-[10px] uppercase tracking-widest"
        aria-label="Quick view"
      >
        View
      </button>
      {open ? <QuickViewModal slug={slug} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function QuickViewModal({ slug, onClose }: { slug: string; onClose: () => void }) {
  const [data, setData] = useState<Detail | null>(null);
  const [err, setErr] = useState("");
  const [vid, setVid] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch(`/api/products/detail?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.error) setErr(j.error);
        else {
          setData(j);
          setVid(j.variants?.[0]?.id || "");
        }
      })
      .catch(() => setErr("Could not load"));
  }, [slug]);

  const v = data?.variants.find((x) => x.id === vid) || data?.variants[0];
  const avail = v ? Math.max(0, v.stockQty - v.reservedQty) : 0;

  async function add() {
    if (!v) return;
    const res = await fetch("/api/cart/items", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ variantId: v.id, quantity: 1 }),
    });
    const j = await res.json();
    if (!res.ok) {
      setMsg(j.error || "Could not add");
      return;
    }
    window.dispatchEvent(new Event("nc-cart"));
    setMsg("Added to cart.");
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4" onClick={onClose}>
      <div
        className="grid max-h-[90vh] w-full max-w-2xl overflow-auto border border-line bg-paper md:grid-cols-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="aspect-[4/5] bg-bone md:aspect-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data?.image || "/images/fallback.jpg"} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="p-5">
          <p className="font-serif text-2xl">{data?.name || "…"}</p>
          {v ? <p className="mt-2">{formatMoney(v.priceCents, data?.currency || "pkr")}</p> : null}
          {err ? <p className="mt-2 text-sm text-sale">{err}</p> : null}
          {data?.variants.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {data.variants.map((vr) => {
                const o = parseJson<{ size?: string; color?: string }>(vr.options, {});
                const label = [o.color, o.size].filter(Boolean).join(" / ") || vr.title;
                const a = Math.max(0, vr.stockQty - vr.reservedQty);
                return (
                  <button
                    key={vr.id}
                    type="button"
                    disabled={a <= 0}
                    onClick={() => setVid(vr.id)}
                    className={`border px-2 py-1 text-xs disabled:opacity-30 ${vr.id === vid ? "border-ink bg-ink text-paper" : "border-line"}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          ) : null}
          <p className="mt-3 text-xs text-muted">{avail <= 0 ? "Out of stock" : `${avail} in stock`}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!v || avail <= 0}
              onClick={add}
              className="bg-ink px-4 py-2 text-[11px] uppercase tracking-widest text-paper disabled:opacity-40"
            >
              Add to cart
            </button>
            <Link href={`/product/${slug}`} className="border border-ink px-4 py-2 text-[11px] uppercase tracking-widest" onClick={onClose}>
              Full details
            </Link>
          </div>
          {msg ? <p className="mt-3 text-sm">{msg}</p> : null}
          <button type="button" className="mt-6 text-[11px] uppercase tracking-widest underline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
