"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-xl px-4 py-24">
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted">500</p>
      <h1 className="mt-2 font-serif text-5xl">Something failed on our side.</h1>
      <p className="mt-4 text-sm text-muted">Try again. If you were checking out, look at Track order before placing a second payment.</p>
      <div className="mt-8 flex gap-4 text-sm">
        <button onClick={reset} className="underline">
          Retry
        </button>
        <Link href="/" className="underline">
          Home
        </Link>
      </div>
    </main>
  );
}
