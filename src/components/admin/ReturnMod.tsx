"use client";

import { useRouter } from "next/navigation";

export function ReturnMod({
  rows,
}: {
  rows: { id: string; reason: string; status: string; email: string; order: { orderNumber: string } }[];
}) {
  const router = useRouter();
  return (
    <ul className="mt-6 space-y-3 text-sm">
      {rows.map((r) => (
        <li key={r.id} className="border border-line bg-paper p-4">
          <p>
            {r.order.orderNumber} · {r.email} · {r.status}
          </p>
          <p className="text-muted">{r.reason}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {["APPROVED", "REJECTED", "RECEIVED", "REFUNDED", "EXCHANGED"].map((s) => (
              <button
                key={s}
                className="border border-line px-2 py-1 text-xs"
                onClick={async () => {
                  await fetch(`/api/admin/returns/${r.id}`, {
                    method: "PATCH",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ status: s }),
                  });
                  router.refresh();
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
