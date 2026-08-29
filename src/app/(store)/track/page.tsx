"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Reveal } from "@/components/store/Reveal";

export default function TrackPage() {
  const [err, setErr] = useState("");
  const router = useRouter();
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Reveal>
        <h1 className="font-serif text-4xl">Track an order</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-[#3f3a34]">
          Enter the order number and the email used at checkout. We only show that order. You will see the status the
          desk has recorded, whether Rapid or COD is paid, and a tracking number if we have added a carrier. We do not
          invent GPS, a map, or a fake scan.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          No account and no password. If the pair does not match, we show nothing — not a list of other people’s
          parcels. Lost the number? Look in the confirmation email or write{" "}
          <Link href="/contact" className="underline">
            Contact
          </Link>{" "}
          from the same address.
        </p>
      </Reveal>
      <form
        className="mt-10 grid gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const res = await fetch("/api/orders/track", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ orderNumber: fd.get("orderNumber"), email: fd.get("email") }),
          });
          const j = await res.json();
          if (!res.ok) setErr(j.error || "Not found");
          else router.push(`/track/${j.token}`);
        }}
      >
        <input name="orderNumber" required placeholder="NC-1041" className="border border-line bg-transparent px-3 py-2" />
        <input name="email" type="email" required placeholder="Email on the order" className="border border-line bg-transparent px-3 py-2" />
        <button className="bg-ink py-3 text-[12px] uppercase tracking-widest text-paper">View order</button>
        {err ? <p className="text-sm text-sale">{err}</p> : null}
      </form>
      <p className="mt-8 text-sm text-muted">
        Need a return?{" "}
        <Link href="/returns" className="underline">
          Start here
        </Link>
        . Policy:{" "}
        <Link href="/shipping" className="underline">
          Shipping
        </Link>
        .
      </p>
    </div>
  );
}
