"use client";

import { useState } from "react";

export default function ReturnsPage() {
  const [msg, setMsg] = useState("");
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-serif text-5xl">Returns</h1>
      <p className="mt-3 text-sm text-muted">
        30 days from delivery, unused, tags on. We approve or write back within two business days — we do not
        auto-refund outside policy. Rapid refunds go to the original payment; COD refunds are arranged by the desk.
      </p>
      <form
        className="mt-8 grid gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const res = await fetch("/api/returns", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              orderNumber: fd.get("orderNumber"),
              email: fd.get("email"),
              reason: fd.get("reason"),
            }),
          });
          const j = await res.json();
          setMsg(j.message || j.error);
        }}
      >
        <input name="orderNumber" required placeholder="Order number" className="border border-line bg-transparent px-3 py-2" />
        <input name="email" type="email" required placeholder="Email on the order" className="border border-line bg-transparent px-3 py-2" />
        <textarea name="reason" required minLength={8} rows={4} placeholder="Reason" className="border border-line bg-transparent px-3 py-2" />
        <button className="bg-ink py-3 text-[12px] uppercase tracking-widest text-paper">Request return</button>
        {msg ? <p className="text-sm">{msg}</p> : null}
      </form>
    </div>
  );
}
