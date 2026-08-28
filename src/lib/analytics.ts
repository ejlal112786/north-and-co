import { prisma } from "./prisma";

export async function track(type: string, meta: Record<string, unknown> = {}, sessionId = "", path = "") {
  try {
    await prisma.analyticsEvent.create({
      data: { type, meta: JSON.stringify(meta), sessionId, path },
    });
  } catch {
    /* analytics must never break commerce */
  }
}

export async function rangeStats(from: Date, to: Date) {
  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: from, lte: to },
      status: { notIn: ["CANCELLED"] },
    },
    include: { items: true },
  });
  const paid = orders.filter((o) => o.paymentStatus === "PAID" || o.paymentMethod === "COD");
  const revenue = paid
    .filter((o) => o.paymentStatus === "PAID" || o.status === "DELIVERED")
    .reduce((s, o) => s + o.totalCents, 0);
  const recorded = paid.reduce((s, o) => s + o.totalCents, 0);
  return { orders, paid, revenue, recorded };
}
