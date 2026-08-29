"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  return (
    <form
      className="mt-6 flex max-w-sm gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        const res = await fetch("/api/newsletter", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const j = await res.json();
        setMsg(j.message || j.error || "Saved.");
        if (res.ok) setEmail("");
      }}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email for restocks"
        className="tap flex-1 border border-line bg-paper px-3 text-sm outline-none focus:border-ink"
      />
      <button className="tap bg-ink px-4 text-[11px] uppercase tracking-widest text-paper">Join</button>
      {msg ? <span className="sr-only">{msg}</span> : null}
    </form>
  );
}
