"use client";

import { useEffect, useState } from "react";

const KEY = "nc_fit";

type Fit = { heightCm: string; usual: string };

function read(): Fit {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Fit;
  } catch {
    /* ignore */
  }
  return { heightCm: "", usual: "" };
}

export function SizeGuide({ sizes }: { sizes: string[] }) {
  const [open, setOpen] = useState(false);
  const [fit, setFit] = useState<Fit>({ heightCm: "", usual: "" });
  useEffect(() => setFit(read()), []);

  function save(next: Fit) {
    setFit(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  const hint =
    fit.usual && sizes.includes(fit.usual)
      ? `Your saved usual size is ${fit.usual}.`
      : fit.usual
        ? `You usually wear ${fit.usual}. Check the garment measurements below.`
        : "Saved on this browser only — we do not keep body profiles.";

  return (
    <div className="mt-4">
      <button type="button" className="tap text-[11px] uppercase tracking-widest underline" onClick={() => setOpen((v) => !v)}>
        {open ? "Hide size helper" : "Size helper"}
      </button>
      {open ? (
        <div className="mt-3 border border-line bg-mist p-4 text-sm">
          <p className="text-xs text-muted">{hint}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <label className="text-[11px] uppercase tracking-widest text-muted">
              Height (cm)
              <input
                value={fit.heightCm}
                onChange={(e) => save({ ...fit, heightCm: e.target.value })}
                className="tap mt-1 w-full border border-line bg-paper px-2 text-sm text-ink"
                inputMode="numeric"
                placeholder="178"
              />
            </label>
            <label className="text-[11px] uppercase tracking-widest text-muted">
              Usual size
              <input
                value={fit.usual}
                onChange={(e) => save({ ...fit, usual: e.target.value })}
                className="tap mt-1 w-full border border-line bg-paper px-2 text-sm text-ink"
                placeholder="M"
              />
            </label>
          </div>
        </div>
      ) : null}
    </div>
  );
}
