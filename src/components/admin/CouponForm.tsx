"use client";

import { useRouter } from "next/navigation";

export function CouponForm() {
  const router = useRouter();
  return (
    <form
      className="mt-8 grid max-w-md gap-2 text-sm"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        await fetch("/api/admin/coupons", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            code: fd.get("code"),
            type: fd.get("type"),
            value: Number(fd.get("value")),
            minOrderCents: Math.round(Number(fd.get("min") || 0) * 100),
            firstOrderOnly: fd.get("first") === "on",
            endsAt: fd.get("endsAt") || null,
          }),
        });
        router.refresh();
      }}
    >
      <h2 className="font-serif text-2xl">New code</h2>
      <input name="code" required placeholder="CODE" className="border border-line px-3 py-2" />
      <select name="type" className="border border-line bg-paper px-2 py-2">
        <option>PERCENT</option>
        <option>FIXED</option>
        <option>FREE_SHIPPING</option>
        <option>PRODUCT</option>
        <option>CATEGORY</option>
        <option>BUY_X_GET_Y</option>
      </select>
      <input name="value" type="number" defaultValue={10} className="border border-line px-3 py-2" />
      <input name="min" type="number" step="0.01" placeholder="Min order $" className="border border-line px-3 py-2" />
      <input name="endsAt" type="date" className="border border-line px-3 py-2" />
      <label className="flex gap-2">
        <input type="checkbox" name="first" /> First order only
      </label>
      <button className="bg-ink py-2 text-[12px] uppercase tracking-widest text-paper">Create</button>
    </form>
  );
}
