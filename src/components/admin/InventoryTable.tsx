"use client";

import { useRouter } from "next/navigation";

export function InventoryTable({
  variants,
}: {
  variants: {
    id: string;
    sku: string;
    title: string;
    stockQty: number;
    reservedQty: number;
    lowStockThreshold: number;
    product: { name: string };
  }[];
}) {
  const router = useRouter();
  return (
    <table className="mt-6 w-full text-sm">
      <thead>
        <tr className="border-b border-ink text-left">
          <th className="py-2">SKU</th>
          <th>Product</th>
          <th>On hand</th>
          <th>Reserved</th>
          <th>Avail</th>
          <th>Adjust</th>
        </tr>
      </thead>
      <tbody>
        {variants.map((v) => {
          const avail = v.stockQty - v.reservedQty;
          return (
            <tr key={v.id} className={`border-b border-line ${avail <= v.lowStockThreshold ? "bg-bone" : ""}`}>
              <td className="py-2 font-mono text-xs">{v.sku}</td>
              <td>
                {v.product.name}
                <div className="text-xs text-muted">{v.title}</div>
              </td>
              <td>{v.stockQty}</td>
              <td>{v.reservedQty}</td>
              <td>{avail}</td>
              <td>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    await fetch("/api/admin/inventory", {
                      method: "POST",
                      headers: { "content-type": "application/json" },
                      body: JSON.stringify({
                        variantId: v.id,
                        stockQty: Number(fd.get("stockQty")),
                        reason: fd.get("reason"),
                      }),
                    });
                    router.refresh();
                  }}
                  className="flex gap-1"
                >
                  <input name="stockQty" type="number" defaultValue={v.stockQty} className="w-20 border border-line px-1 py-1" />
                  <input name="reason" placeholder="reason" className="w-28 border border-line px-1 py-1" />
                  <button className="border border-ink px-2">Set</button>
                </form>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
