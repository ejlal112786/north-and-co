"use client";

import { useEffect, useMemo, useState } from "react";
import { formatMoney } from "@/lib/money";

type Quote = { id: string; name: string; rateCents: number; estimate: string; code: string };
type Summary = {
  items: {
    id: string;
    name: string;
    variantTitle: string;
    quantity: number;
    unitPriceCents: number;
    lineTotalCents: number;
    outOfStock: boolean;
    image: string;
  }[];
  subtotalCents: number;
  discountCents: number;
  couponCode: string | null;
  freeShipping: boolean;
};

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "PK", name: "Pakistan" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "IN", name: "India" },
];

export function CheckoutForm({
  summary,
  currency,
  rapidOn,
  codOn,
}: {
  summary: Summary;
  currency: string;
  rapidOn: boolean;
  codOn: boolean;
}) {
  const [country, setCountry] = useState("PK");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [shipId, setShipId] = useState("");
  const [pay, setPay] = useState<"COD" | "RAPID">(codOn && !rapidOn ? "COD" : rapidOn ? "RAPID" : "COD");
  const [billingSame, setBillingSame] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/shipping/quote", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ country, subtotal: summary.subtotalCents - summary.discountCents }),
    })
      .then((r) => r.json())
      .then((j) => {
        setQuotes(j.quotes || []);
        setShipId(j.quotes?.[0]?.id || "");
      });
    fetch("/api/analytics", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "checkout_start" }),
    }).catch(() => null);
  }, [country, summary.subtotalCents, summary.discountCents]);

  const ship = quotes.find((q) => q.id === shipId);
  const shippingCents = summary.freeShipping ? 0 : ship?.rateCents ?? 0;
  const total = summary.subtotalCents - summary.discountCents + shippingCents;

  const field = "border border-line bg-transparent px-3 py-2 text-sm w-full";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const fd = new FormData(e.currentTarget);
    const shipping = {
      country: String(fd.get("country")),
      state: String(fd.get("state")),
      city: String(fd.get("city")),
      address: String(fd.get("address")),
      postal: String(fd.get("postal")),
      instructions: String(fd.get("instructions") || ""),
    };
    const billing = billingSame
      ? shipping
      : {
          country: String(fd.get("b_country")),
          state: String(fd.get("b_state")),
          city: String(fd.get("b_city")),
          address: String(fd.get("b_address")),
          postal: String(fd.get("b_postal")),
        };
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          shipping,
          billingSame,
          billing,
          shippingMethodId: shipId,
          paymentMethod: pay,
          couponCode: summary.couponCode || undefined,
        }),
      });
      const j = await res.json();
      if (!res.ok) {
        setErr(j.error || "Checkout failed");
        return;
      }
      window.location.href = j.redirectUrl;
    } catch {
      setErr("Network failure. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const payOptions = useMemo(() => {
    const o: { id: "RAPID" | "COD"; label: string; note: string }[] = [];
    if (rapidOn)
      o.push({
        id: "RAPID",
        label: "Pay online (Rapid Gateway)",
        note: "Cards, JazzCash, easypaisa, and Raast on Rapid Gateway’s hosted page. Paid only after Rapid confirms the PKR amount.",
      });
    if (codOn) o.push({ id: "COD", label: "Cash on delivery", note: "Order is confirmed unpaid. Pay the courier. Not marked paid until we receive it." });
    return o;
  }, [rapidOn, codOn]);

  return (
    <form onSubmit={onSubmit} className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
      <div className="space-y-8">
        <section>
          <h2 className="font-serif text-2xl">Your details</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input name="name" required placeholder="Full name" className={`${field} sm:col-span-2`} />
            <input name="email" type="email" required placeholder="Email" className={field} />
            <input name="phone" required placeholder="Phone (+92…)" className={field} />
          </div>
        </section>
        <section>
          <h2 className="font-serif text-2xl">Shipping</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <select name="country" className={field} value={country} onChange={(e) => setCountry(e.target.value)}>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
            <input name="state" required placeholder="State / province" className={field} />
            <input name="city" required placeholder="City" className={field} />
            <input name="postal" required placeholder="Postal / ZIP" className={field} />
            <input name="address" required placeholder="Street address" className={`${field} sm:col-span-2`} />
            <input name="instructions" placeholder="Delivery instructions (optional)" className={`${field} sm:col-span-2`} />
          </div>
          <div className="mt-4 space-y-2">
            {quotes.map((q) => (
              <label key={q.id} className="flex cursor-pointer items-start gap-3 border border-line p-3">
                <input type="radio" name="ship" checked={shipId === q.id} onChange={() => setShipId(q.id)} />
                <span className="flex-1 text-sm">
                  {q.name}
                  <span className="block text-xs text-muted">Est. {q.estimate}</span>
                </span>
                <span className="text-sm">{summary.freeShipping ? "Free" : formatMoney(q.rateCents, currency)}</span>
              </label>
            ))}
            {!quotes.length ? <p className="text-sm text-muted">No shipping methods for that country.</p> : null}
          </div>
        </section>
        <section>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={billingSame} onChange={(e) => setBillingSame(e.target.checked)} />
            Billing address same as shipping
          </label>
          {!billingSame ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <select name="b_country" className={field} defaultValue="PK">
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input name="b_state" placeholder="State" className={field} />
              <input name="b_city" placeholder="City" className={field} />
              <input name="b_postal" placeholder="Postal" className={field} />
              <input name="b_address" placeholder="Street address" className={`${field} sm:col-span-2`} />
            </div>
          ) : null}
        </section>
        <section>
          <h2 className="font-serif text-2xl">Payment</h2>
          <div className="mt-4 space-y-2">
            {payOptions.map((p) => (
              <label key={p.id} className="flex cursor-pointer items-start gap-3 border border-line p-3">
                <input type="radio" name="pay" checked={pay === p.id} onChange={() => setPay(p.id)} />
                <span className="text-sm">
                  {p.label}
                  <span className="block text-xs text-muted">{p.note}</span>
                </span>
              </label>
            ))}
            {!payOptions.length ? (
              <p className="text-sale text-sm">No payment methods enabled. Ask the shop to configure Rapid or COD.</p>
            ) : null}
          </div>
        </section>
      </div>
      <aside className="h-fit border border-line p-5">
        <p className="text-[11px] uppercase tracking-widest text-muted">Order</p>
        <ul className="mt-4 divide-y divide-line text-sm">
          {summary.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-3 py-2">
              <span>
                {i.name}
                <span className="block text-xs text-muted">
                  {i.variantTitle} × {i.quantity}
                </span>
              </span>
              <span>{formatMoney(i.lineTotalCents, currency)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 text-sm">
          <p className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatMoney(summary.subtotalCents, currency)}</span>
          </p>
          <p className="flex justify-between">
            <span>Discount {summary.couponCode ? `(${summary.couponCode})` : ""}</span>
            <span>−{formatMoney(summary.discountCents, currency)}</span>
          </p>
          <p className="flex justify-between">
            <span>Shipping</span>
            <span>{formatMoney(shippingCents, currency)}</span>
          </p>
          <p className="flex justify-between font-medium">
            <span>Total</span>
            <span>{formatMoney(total, currency)}</span>
          </p>
        </div>
        <p className="mt-3 text-xs text-muted">Final total is calculated and charged by the server. Browser amounts are a preview.</p>
        {err ? <p className="mt-3 text-sm text-sale">{err}</p> : null}
        <button
          disabled={busy || !shipId || !payOptions.length || summary.items.some((i) => i.outOfStock)}
          className="mt-5 w-full bg-ink py-3 text-[12px] uppercase tracking-[0.16em] text-paper disabled:opacity-40"
        >
          {busy ? "Placing order…" : pay === "RAPID" ? "Pay with Rapid Gateway" : "Place COD order"}
        </button>
      </aside>
    </form>
  );
}
