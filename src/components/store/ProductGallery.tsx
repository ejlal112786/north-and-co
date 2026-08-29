"use client";

import { useEffect, useRef, useState } from "react";

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
  const strip = useRef<HTMLDivElement>(null);
  const list = images.length ? images : [{ url: "/images/fallback.jpg", alt: name }];
  const current = list[i] || list[0]!;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "Escape") setZoom(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.length, i]);

  function go(delta: number) {
    setI((n) => {
      const next = (n + delta + list.length) % list.length;
      const el = strip.current;
      if (el) el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
      return next;
    });
  }

  function select(idx: number) {
    setI(idx);
    const el = strip.current;
    if (el) el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div>
      <div className="relative md:hidden">
        <div
          ref={strip}
          className="film-strip bg-bone"
          onScroll={(e) => {
            const el = e.currentTarget;
            const n = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
            if (n !== i && n >= 0 && n < list.length) setI(n);
          }}
        >
          {list.map((img, idx) => (
            <button
              key={img.url + idx}
              type="button"
              className="relative aspect-[4/5] w-full shrink-0"
              onClick={() => setZoom(true)}
              aria-label={`Zoom ${name}, angle ${idx + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={idx === i ? img.alt || name : ""} className="photo-grade h-full w-full object-cover" />
            </button>
          ))}
        </div>
        <div className="pointer-events-none absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {list.map((_, idx) => (
            <span key={idx} className={`h-1.5 w-1.5 rounded-full ${idx === i ? "bg-paper" : "bg-paper/40"}`} />
          ))}
        </div>
      </div>

      <button
        type="button"
        className="relative hidden aspect-[4/5] w-full overflow-hidden bg-bone md:block"
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
            className={`gallery-fade photo-grade ${idx === i ? "is-on" : ""}`}
            style={idx === i ? { transformOrigin: `${pos.x}% ${pos.y}%` } : undefined}
          />
        ))}
        <span className="pointer-events-none absolute bottom-3 right-3 bg-paper/90 px-2 py-1 text-[10px] uppercase tracking-widest">
          {i + 1} / {list.length} · Zoom
        </span>
      </button>

      <div className="mt-3 flex gap-2 overflow-x-auto px-4 md:px-0">
        {list.map((img, idx) => (
          <button
            key={img.url + idx}
            type="button"
            onClick={() => select(idx)}
            className={`tap h-20 w-16 shrink-0 overflow-hidden border transition duration-300 ${
              idx === i ? "border-ink thumb-on" : "border-transparent opacity-70 hover:opacity-100"
            }`}
            aria-label={`Angle ${idx + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt="" className="photo-grade h-full w-full object-cover" />
          </button>
        ))}
        {videoUrl ? (
          <a
            href={videoUrl}
            target="_blank"
            rel="noreferrer"
            className="tap grid h-20 w-16 place-items-center border border-line text-[10px] uppercase"
          >
            Video
          </a>
        ) : null}
      </div>
      <p className="mt-2 hidden px-4 text-[11px] uppercase tracking-[0.16em] text-muted md:block md:px-0">
        {list.length} angles · fade between them, or swipe on a phone
      </p>

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
