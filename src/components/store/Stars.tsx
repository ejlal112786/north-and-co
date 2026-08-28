export function Stars({
  value,
  count,
  small,
}: {
  value: number;
  count?: number;
  small?: boolean;
}) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span className={`inline-flex items-center gap-1 ${small ? "text-[11px]" : "text-sm"}`} aria-label={`${value.toFixed(1)} of 5`}>
      <span className="tracking-[0.2em] text-ink" aria-hidden>
        {"★★★★★".split("").map((s, i) => (
          <span key={i} className={i < Math.round(rounded) ? "text-ink" : "text-line"}>
            {s}
          </span>
        ))}
      </span>
      {count != null ? <span className="text-muted">({count})</span> : null}
    </span>
  );
}
