"use client";

import type { StoreSettings } from "@/lib/settings";
import { useState } from "react";

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const [msg, setMsg] = useState("");
  return (
    <form
      className="mt-6 grid max-w-lg gap-3 text-sm"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const res = await fetch("/api/admin/settings", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            store: {
              name: fd.get("name"),
              tagline: fd.get("tagline"),
              email: fd.get("email"),
              phone: fd.get("phone"),
              address: fd.get("address"),
              currency: fd.get("currency"),
              timezone: fd.get("timezone"),
              country: fd.get("country"),
            },
            payments: {
              rapidEnabled: fd.get("rapidEnabled") === "on",
              codEnabled: fd.get("codEnabled") === "on",
            },
            tax: { rateBps: Math.round(Number(fd.get("tax") || 0) * 100) },
            seo: { title: fd.get("seoTitle"), description: fd.get("seoDescription"), ogImage: "/images/og.jpg" },
            returns: { windowDays: Number(fd.get("returns") || 30) },
          }),
        });
        setMsg(res.ok ? "Saved" : "Failed");
      }}
    >
      <input name="name" defaultValue={settings.store.name} className="border border-line px-3 py-2" />
      <input name="tagline" defaultValue={settings.store.tagline} className="border border-line px-3 py-2" />
      <input name="email" defaultValue={settings.store.email} className="border border-line px-3 py-2" />
      <input name="phone" defaultValue={settings.store.phone} className="border border-line px-3 py-2" />
      <input name="address" defaultValue={settings.store.address} className="border border-line px-3 py-2" />
      <input name="currency" defaultValue={settings.store.currency} className="border border-line px-3 py-2" />
      <input name="timezone" defaultValue={settings.store.timezone} className="border border-line px-3 py-2" />
      <input name="country" defaultValue={settings.store.country} className="border border-line px-3 py-2" />
      <label className="flex gap-2">
        <input type="checkbox" name="codEnabled" defaultChecked={settings.payments.codEnabled} /> Cash on delivery
      </label>
      <label className="flex gap-2">
        <input type="checkbox" name="rapidEnabled" defaultChecked={settings.payments.rapidEnabled} /> Rapid Gateway (cards, JazzCash, easypaisa, Raast — requires Merchant ID + Secret Key)
      </label>
      <label>
        Tax %
        <input name="tax" type="number" step="0.01" defaultValue={settings.tax.rateBps / 100} className="ml-2 border border-line px-2 py-1" />
      </label>
      <label>
        Return window (days)
        <input name="returns" type="number" defaultValue={settings.returns.windowDays} className="ml-2 border border-line px-2 py-1" />
      </label>
      <input name="seoTitle" defaultValue={settings.seo.title} className="border border-line px-3 py-2" />
      <textarea name="seoDescription" defaultValue={settings.seo.description} className="border border-line px-3 py-2" />
      <button className="bg-ink py-2 text-[12px] uppercase tracking-widest text-paper">Save</button>
      {msg ? <p>{msg}</p> : null}
    </form>
  );
}
