"use client";

import { useState } from "react";

export default function ReturnsPage() {
  const [msg, setMsg] = useState("");
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-serif text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.92]">Returns</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-[#3f3a34]">
        30 days from delivery. Unused, unwashed, tags on, original packing. Sale pieces marked final sale cannot be
        returned except for faults. We approve or write back within two business days — submitting this form is not an
        automatic refund.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Rapid / card refunds go to the original payment when Rapid accepts them. COD refunds are arranged by the desk
        (bank transfer or credit) after we have the goods. You need the order number and the checkout email — no
        account. More:{" "}
        <a href="/shipping" className="underline">
          Shipping
        </a>
        ,{" "}
        <a href="/faq" className="underline">
          FAQs
        </a>
        ,{" "}
        <a href="/contact" className="underline">
          Contact
        </a>
        .
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
        <input name="orderNumber" required placeholder="Order number" className="tap border border-line bg-transparent px-3" />
        <input name="email" type="email" required placeholder="Email on the order" className="tap border border-line bg-transparent px-3" />
        <textarea name="reason" required minLength={8} rows={4} placeholder="Reason" className="border border-line bg-transparent px-3 py-3" />
        <button className="tap bg-ink text-[12px] uppercase tracking-widest text-paper">Request return</button>
        {msg ? <p className="text-sm">{msg}</p> : null}
      </form>
    </div>
  );
}
