"use client";

import { useRouter } from "next/navigation";

export function ReviewMod({
  reviews,
}: {
  reviews: {
    id: string;
    authorName: string;
    rating: number;
    title: string;
    body: string;
    status: string;
    verified: boolean;
    product: { name: string };
  }[];
}) {
  const router = useRouter();
  return (
    <ul className="mt-6 space-y-4 text-sm">
      {reviews.map((r) => (
        <li key={r.id} className="border border-line bg-paper p-4">
          <p>
            {r.rating}★ {r.product.name} · {r.authorName} {r.verified ? "· verified" : ""} · {r.status}
          </p>
          <p className="mt-1 font-medium">{r.title}</p>
          <p className="text-muted">{r.body}</p>
          <div className="mt-2 flex gap-2">
            {["APPROVED", "REJECTED", "PENDING"].map((s) => (
              <button
                key={s}
                className="border border-line px-2 py-1 text-xs"
                onClick={async () => {
                  await fetch(`/api/admin/reviews/${r.id}`, {
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
