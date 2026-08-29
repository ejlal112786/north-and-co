"use client";

import { useEffect, useState } from "react";

export function ProductGallery({
  images,
  videoUrl,
  name,
}: {
  images: { url: string; alt: string }[];
  videoUrl?: string | null;
  name: string;
}) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const list = images.length ? images : [{ url: "/images/fallback.jpg", alt: name }];
  const current = list[i] || list[0]!;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setI((n) => (n + 1) % list.length);
      if (e.key === "ArrowLeft") setI((n) => (n - 1 + list.length) % list.length);
      if (e.key === "Escape") setZoom(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [list.length]);

  return (
    <div>
      <button
        type="button"
        className="relative aspect-[4/5] w-full overflow-hidden bg-bone"
        onClick={() => setZoom(true)}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setPos({
            x: ((e.clientX - r.left) / r.width) * 100,
            y: ((e.clientY - r.top) / r.height) * 100,
          });
        }}
        aria-label="Zoom image"
      >
        {list.map((img, idx) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={img.url + idx}
            src={img.url}
            alt={idx === i ? img.alt || name : ""}
            className={`gallery-fade ${idx === i ? "is-on" : ""}`}
            style={idx === i ? { transformOrigin: `${pos.x}% ${pos.y}%` } : undefined}
          />
        ))}
        <span className="pointer-events-none absolute bottom-3 right-3 bg-paper/90 px-2 py-1 text-[10px] uppercase tracking-widest">
          {i + 1} / {list.length} · Zoom
        </span>
      </button>
      <div className="mt-3 flex gap-2 overflow-x-auto">
        {list.map((img, idx) => (
          <button
            key={img.url + idx}
            type="button"
            onClick={() => setI(idx)}
            className={`h-20 w-16 shrink-0 overflow-hidden border transition duration-300 ${
              idx === i ? "border-ink thumb-on" : "border-transparent opacity-70 hover:opacity-100"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
        {videoUrl ? (
          <a
            href={videoUrl}
            target="_blank"
            rel="noreferrer"
            className="grid h-20 w-16 place-items-center border border-line text-[10px] uppercase"
          >
            Video
          </a>
        ) : null}
      </div>
      {zoom ? (
        <div
          className="overlay-in fixed inset-0 z-50 grid place-items-center bg-ink/80 p-4"
          onClick={() => setZoom(false)}
          role="dialog"
          aria-label="Zoomed product image"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.url} alt={name} className="panel-in max-h-[92vh] max-w-[92vw] object-contain" />
        </div>
      ) : null}
    </div>
  );
}
