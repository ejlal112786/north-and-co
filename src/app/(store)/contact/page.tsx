"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [msg, setMsg] = useState("");
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-serif text-5xl">Contact</h1>
      <p className="mt-3 text-sm text-muted">
        The form is stored for the desk and emailed to spideyspider112786@gmail.com when SMTP is set. Include your
        order number if you have one. We do not run live chat.
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
      </p>
      <form
        className="mt-8 grid gap-3"
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
        <input name="phone" placeholder="Phone" className="border border-line bg-transparent px-3 py-2" />
        <textarea name="message" required rows={5} placeholder="Message" className="border border-line bg-transparent px-3 py-2" />
        <button className="bg-ink py-3 text-[12px] uppercase tracking-widest text-paper">Send</button>
        {msg ? <p className="text-sm">{msg}</p> : null}
      </form>
    </div>
  );
}
