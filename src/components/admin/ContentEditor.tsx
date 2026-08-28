"use client";

import { useState } from "react";

export function ContentEditor({
  pages,
}: {
  pages: { id: string; slug: string; title: string; content: string }[];
}) {
  const [id, setId] = useState(pages[0]?.id || "");
  const page = pages.find((p) => p.id === id);
  const [title, setTitle] = useState(page?.title || "");
  const [content, setContent] = useState(page?.content || "");
  const [msg, setMsg] = useState("");
  return (
    <div className="mt-6 grid gap-3 max-w-2xl text-sm">
      <select
        value={id}
        onChange={(e) => {
          const p = pages.find((x) => x.id === e.target.value);
          setId(e.target.value);
          setTitle(p?.title || "");
          setContent(p?.content || "");
        }}
        className="border border-line bg-paper px-2 py-2"
      >
        {pages.map((p) => (
          <option key={p.id} value={p.id}>
            /{p.slug}
          </option>
        ))}
      </select>
      <input value={title} onChange={(e) => setTitle(e.target.value)} className="border border-line px-3 py-2" />
      <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={12} className="border border-line px-3 py-2" />
      <button
        className="bg-ink py-2 text-[12px] uppercase tracking-widest text-paper"
        onClick={async () => {
          const res = await fetch("/api/admin/pages", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ id, title, content }),
          });
          setMsg(res.ok ? "Saved" : "Failed");
        }}
      >
        Save page
      </button>
      {msg ? <p>{msg}</p> : null}
    </div>
  );
}
