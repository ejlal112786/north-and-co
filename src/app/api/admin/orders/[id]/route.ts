import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin/guard";
import { audit } from "@/lib/auth";
import { error, json } from "@/lib/http";
import { restoreStock, releaseReservation } from "@/lib/inventory";
import { mailStatus, mailRefund, orderToEmail } from "@/lib/mail";
import { refundRapid, rapidEnabled } from "@/lib/rapid";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { z } from "zod";

const STATUSES = Object.values(OrderStatus);

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi("orders");
  if (auth.error) return auth.error;
  const { id } = await params;
  const body = z
    .object({
      status: z.enum(OrderStatus).optional(),
      paymentStatus: z.enum(PaymentStatus).optional(),
      trackingNumber: z.string().optional(),
      carrier: z.string().optional(),
      note: z.string().optional(),
      refundCents: z.number().int().positive().optional(),
      refundReason: z.string().optional(),
    })
    .parse(await req.json());

  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return error("Not found", 404);

  const data: Record<string, unknown> = {};
  if (body.status) data.status = body.status;
  if (body.paymentStatus) data.paymentStatus = body.paymentStatus;
  if (body.trackingNumber != null) data.trackingNumber = body.trackingNumber;
  if (body.carrier != null) data.carrier = body.carrier;

  if (body.status === "CANCELLED" && order.status !== "CANCELLED") {
    if (order.paymentStatus !== "PAID") await releaseReservation(order.id);
    else await restoreStock(order.id, "Cancelled after payment — restock");
  }

  if (body.trackingNumber && body.status === "SHIPPED") {
    await prisma.shipment.create({
      data: {
        orderId: order.id,
        carrier: body.carrier || "",
        trackingNumber: body.trackingNumber,
        status: "SHIPPED",
        shippedAt: new Date(),
      },
    });
  }

  const updated = await prisma.order.update({ where: { id }, data, include: { items: true } });

  if (body.note) {
    await prisma.orderNote.create({
      data: { orderId: id, body: body.note, internal: true },
    });
  }

  if (body.status && body.status !== order.status) {
    const map: Record<string, [string, string]> = {
      PROCESSING: ["Order processing", "order_processing"],
      SHIPPED: ["Order shipped", "order_shipped"],
      OUT_FOR_DELIVERY: ["Out for delivery", "out_for_delivery"],
      DELIVERED: ["Order delivered", "order_delivered"],
      CANCELLED: ["Order cancelled", "order_cancellation"],
    };
    const m = map[body.status];
    if (m) await mailStatus(orderToEmail(updated), m[0], m[1]);
  }

  if (body.refundCents) {
    if (order.paymentMethod === "RAPID" && (order.rapidAccessCode || order.rapidTransactionId) && rapidEnabled()) {
      const refund = await refundRapid(
        order.rapidAccessCode || order.rapidTransactionId!,
        body.refundCents,
        body.refundReason || "Refund"
      );
      await prisma.refund.create({
        data: {
          orderId: order.id,
          amountCents: body.refundCents,
          reason: body.refundReason || "",
          providerRef: refund.TransactionID != null ? String(refund.TransactionID) : order.rapidTransactionId,
        },
      });
    } else {
      await prisma.refund.create({
        data: { orderId: order.id, amountCents: body.refundCents, reason: body.refundReason || "manual" },
      });
    }
    const totalRefunded = (await prisma.refund.aggregate({ where: { orderId: order.id }, _sum: { amountCents: true } }))
      ._sum.amountCents || 0;
    const payStatus = totalRefunded >= order.totalCents ? "REFUNDED" : "PARTIALLY_REFUNDED";
    await prisma.order.update({
      where: { id },
      data: {
        paymentStatus: payStatus,
        status: payStatus === "REFUNDED" ? "REFUNDED" : "PARTIALLY_REFUNDED",
      },
    });
    if (payStatus === "REFUNDED") await restoreStock(order.id, "Full refund restock");
    await mailRefund(orderToEmail(updated), body.refundCents);
  }

  await audit(null, "update", "order", id, body);
  void STATUSES;
  return json({ ok: true });
}
