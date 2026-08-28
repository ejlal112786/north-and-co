"use client";

import { useState } from "react";
import { Stars } from "./Stars";
import { formatDate } from "@/lib/utils";

type Review = {
  id: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  helpful: number;
  createdAt: Date | string;
};

export function ProductReviews({
  slug,
  reviews,
  avg,
  breakdown,
}: {
  slug: string;
  reviews: Review[];
  avg: number;
  breakdown: { n: number; c: number }[];
}) {
  const [list, setList] = useState(reviews);
  const [msg, setMsg] = useState("");

  return (
    <section id="reviews" className="mt-20 border-t border-line pt-10">
      <h2 className="font-serif text-3xl">Reviews</h2>
      <div className="mt-4 flex flex-wrap items-center gap-6">
        <p className="font-serif text-5xl">{avg ? avg.toFixed(1) : "—"}</p>
        <div>
          <Stars value={avg} count={list.length} />
          <div className="mt-2 space-y-1 text-xs text-muted">
            {breakdown.map((b) => (
              <div key={b.n} className="flex items-center gap-2">
                <span className="w-8">{b.n}★</span>
                <span className="h-1 w-32 bg-line">
                  <span
                    className="block h-1 bg-ink"
                    style={{ width: `${list.length ? (b.c / list.length) * 100 : 0}%` }}
                  />
                </span>
                <span>{b.c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ul className="mt-8 divide-y divide-line border-y border-line">
        {list.map((r) => (
          <li key={r.id} className="py-5">
            <div className="flex flex-wrap items-center gap-3">
              <Stars value={r.rating} />
              {r.verified ? (
                <span className="text-[10px] uppercase tracking-widest text-sage">Verified purchase</span>
              ) : null}
              <span className="text-xs text-muted">{formatDate(r.createdAt)}</span>
            </div>
            <p className="mt-2 font-medium">{r.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-[#3f3a34]">{r.body}</p>
            <p className="mt-2 text-xs text-muted">{r.authorName}</p>
            <button
              className="mt-2 text-[11px] uppercase tracking-widest text-muted"
              onClick={async () => {
                await fetch("/api/reviews/helpful", {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({ id: r.id }),
                });
                setList((cur) => cur.map((x) => (x.id === r.id ? { ...x, helpful: x.helpful + 1 } : x)));
              }}
            >
              Helpful ({r.helpful})
            </button>
          </li>
        ))}
      </ul>

      <form
        className="mt-8 grid max-w-lg gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const res = await fetch("/api/reviews", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              productSlug: slug,
              authorName: fd.get("authorName"),
              authorEmail: fd.get("authorEmail"),
              rating: Number(fd.get("rating")),
              title: fd.get("title"),
              body: fd.get("body"),
              orderNumber: fd.get("orderNumber"),
            }),
          });
          const j = await res.json();
          setMsg(j.message || j.error);
          if (res.ok) e.currentTarget.reset();
        }}
      >
        <h3 className="font-serif text-2xl">Write a review</h3>
        <p className="text-xs text-muted">Published after moderation. Include an order number for a verified badge.</p>
        <input name="authorName" required placeholder="Name" className="border border-line bg-transparent px-3 py-2" />
        <input name="authorEmail" type="email" required placeholder="Email" className="border border-line bg-transparent px-3 py-2" />
        <input name="orderNumber" placeholder="Order number (optional)" className="border border-line bg-transparent px-3 py-2" />
        <select name="rating" className="border border-line bg-paper px-3 py-2" defaultValue="5">
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} stars
            </option>
          ))}
        </select>
        <input name="title" placeholder="Title" className="border border-line bg-transparent px-3 py-2" />
        <textarea name="body" required minLength={10} rows={4} placeholder="How did it wear / hold up?" className="border border-line bg-transparent px-3 py-2" />
        <button className="justify-self-start bg-ink px-5 py-2 text-[12px] uppercase tracking-widest text-paper">
          Submit
        </button>
        {msg ? <p className="text-sm">{msg}</p> : null}
      </form>
    </section>
  );
}
