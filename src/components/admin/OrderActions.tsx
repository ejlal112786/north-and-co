"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUSES = [
  "PENDING",
  "PAYMENT_PENDING",
  "PAID",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
];

export function OrderActions({
  order,
}: {
  order: {
    id: string;
    status: string;
    paymentStatus: string;
    trackingNumber?: string | null;
    carrier?: string | null;
    totalCents: number;
  };
}) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  async function send(body: Record<string, unknown>) {
    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await res.json();
    setMsg(res.ok ? "Saved" : j.error);
    router.refresh();
  }
  return (
    <form
      className="mt-8 grid gap-3 border border-line bg-paper p-4 text-sm"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        await send({
          status: fd.get("status"),
          paymentStatus: fd.get("paymentStatus"),
          trackingNumber: fd.get("trackingNumber"),
          carrier: fd.get("carrier"),
          note: fd.get("note"),
          refundCents: fd.get("refundCents") ? Math.round(Number(fd.get("refundCents")) * 100) : undefined,
          refundReason: fd.get("refundReason"),
        });
      }}
    >
      <p className="text-[11px] uppercase tracking-widest text-muted">Update</p>
      <label>
        Status
        <select name="status" defaultValue={order.status} className="mt-1 w-full border border-line bg-paper px-2 py-2">
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <label>
        Payment status
        <select name="paymentStatus" defaultValue={order.paymentStatus} className="mt-1 w-full border border-line bg-paper px-2 py-2">
          {["PENDING", "PAID", "FAILED", "CANCELLED", "REFUNDED", "PARTIALLY_REFUNDED"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <input name="carrier" defaultValue={order.carrier || ""} placeholder="Carrier" className="border border-line px-2 py-2" />
      <input name="trackingNumber" defaultValue={order.trackingNumber || ""} placeholder="Tracking number" className="border border-line px-2 py-2" />
      <textarea name="note" placeholder="Internal note" className="border border-line px-2 py-2" />
      <div className="grid grid-cols-2 gap-2">
        <input name="refundCents" type="number" step="0.01" placeholder="Refund amount" className="border border-line px-2 py-2" />
        <input name="refundReason" placeholder="Refund reason" className="border border-line px-2 py-2" />
      </div>
      <button className="bg-ink py-2 text-[12px] uppercase tracking-widest text-paper">Save</button>
      {msg ? <p>{msg}</p> : null}
    </form>
  );
}
