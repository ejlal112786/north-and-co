"use client";

import { useState } from "react";
import Link from "next/link";
import { Reveal } from "@/components/store/Reveal";

export default function ContactPage() {
  const [msg, setMsg] = useState("");
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <Reveal>
        <h1 className="font-serif text-5xl">Contact</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-[#3f3a34]">
          Every message is stored for the desk. When SMTP is set on the server, a copy is emailed to{" "}
          <strong>spideyspider112786@gmail.com</strong>. That is the inbox. There is no phone number and no street
          address to visit. We do not run live chat.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-[#3f3a34]">
          If this is about an order, include the order number. To see status, payment, and tracking without writing
          us, use Track — we will not ask for a password. To send something back, start on Returns so the desk gets a
          record they can approve.
        </p>
        <p className="mt-3 text-sm">
          <Link href="/track" className="underline">
            Track an order
          </Link>
          {" · "}
          <Link href="/returns" className="underline">
            Start a return
          </Link>
          {" · "}
          <Link href="/faq" className="underline">
            FAQs
          </Link>
          {" · "}
          <Link href="/shipping" className="underline">
            Shipping
          </Link>
        </p>
      </Reveal>
      <form
        className="mt-10 grid gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const res = await fetch("/api/contact", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              name: fd.get("name"),
              email: fd.get("email"),
              phone: fd.get("phone"),
              message: fd.get("message"),
            }),
          });
          const j = await res.json();
          setMsg(j.message || j.error);
          if (res.ok) e.currentTarget.reset();
        }}
      >
        <input name="name" required placeholder="Name" className="border border-line bg-transparent px-3 py-2" />
        <input name="email" type="email" required placeholder="Email" className="border border-line bg-transparent px-3 py-2" />
        <input name="phone" placeholder="Phone (optional)" className="border border-line bg-transparent px-3 py-2" />
        <textarea name="message" required rows={6} placeholder="Message — include the order number if you have one" className="border border-line bg-transparent px-3 py-2" />
        <button className="bg-ink py-3 text-[12px] uppercase tracking-widest text-paper">Send</button>
        {msg ? <p className="text-sm">{msg}</p> : null}
      </form>
      <p className="mt-8 text-xs leading-relaxed text-muted">
        The desk reads mail on business days, Pakistan time. SMTP empty means the message is still in Admin → Messages
        even if Gmail does not arrive yet.
      </p>
    </div>
  );
}
