"use client";

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="no-print mt-8 border border-ink px-4 py-2 text-sm">
      Print / save PDF
    </button>
  );
}
