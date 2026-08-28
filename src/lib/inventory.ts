import { prisma } from "./prisma";
import { InventoryTxnType } from "@prisma/client";

export function availableQty(stockQty: number, reservedQty: number) {
  return Math.max(0, stockQty - reservedQty);
}

export async function reserveStock(variantId: string, quantity: number, orderId?: string) {
  const rows = await prisma.$executeRaw`
    UPDATE ProductVariant
    SET reservedQty = reservedQty + ${quantity}
    WHERE id = ${variantId}
      AND isActive = 1
      AND (stockQty - reservedQty) >= ${quantity}
  `;
  if (rows === 0) {
    throw new Error("INSUFFICIENT_STOCK");
  }
  await prisma.inventoryTransaction.create({
    data: {
      variantId,
      orderId,
      type: InventoryTxnType.RESERVE,
      quantity,
      reason: "Checkout reservation",
    },
  });
}

export async function commitReservation(orderId: string) {
  const items = await prisma.orderItem.findMany({ where: { orderId } });
  await prisma.$transaction(async (tx) => {
    for (const item of items) {
      if (!item.variantId) continue;
      await tx.$executeRaw`
        UPDATE ProductVariant
        SET stockQty = stockQty - ${item.quantity},
            reservedQty = reservedQty - ${item.quantity}
        WHERE id = ${item.variantId} AND reservedQty >= ${item.quantity}
      `;
      await tx.inventoryTransaction.create({
        data: {
          variantId: item.variantId,
          orderId,
          type: InventoryTxnType.COMMIT,
          quantity: item.quantity,
          reason: "Order paid / confirmed",
        },
      });
    }
  });
}

export async function releaseReservation(orderId: string) {
  const items = await prisma.orderItem.findMany({ where: { orderId } });
  await prisma.$transaction(async (tx) => {
    for (const item of items) {
      if (!item.variantId) continue;
      await tx.$executeRaw`
        UPDATE ProductVariant
        SET reservedQty = CASE
          WHEN reservedQty >= ${item.quantity} THEN reservedQty - ${item.quantity}
          ELSE 0 END
        WHERE id = ${item.variantId}
      `;
      await tx.inventoryTransaction.create({
        data: {
          variantId: item.variantId,
          orderId,
          type: InventoryTxnType.RELEASE,
          quantity: item.quantity,
          reason: "Order cancelled or payment failed",
        },
      });
    }
  });
}

export async function restoreStock(orderId: string, reason = "Refund / return") {
  const items = await prisma.orderItem.findMany({ where: { orderId } });
  await prisma.$transaction(async (tx) => {
    for (const item of items) {
      if (!item.variantId) continue;
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stockQty: { increment: item.quantity } },
      });
      await tx.inventoryTransaction.create({
        data: {
          variantId: item.variantId,
          orderId,
          type: InventoryTxnType.RESTORE,
          quantity: item.quantity,
          reason,
        },
      });
    }
  });
}

export async function expireStaleReservations() {
  const cutoff = new Date(Date.now() - 45 * 60 * 1000);
  const stale = await prisma.order.findMany({
    where: {
      paymentStatus: "PENDING",
      paymentMethod: "RAPID",
      createdAt: { lt: cutoff },
      status: { in: ["PENDING", "PAYMENT_PENDING"] },
    },
  });
  for (const order of stale) {
    await releaseReservation(order.id);
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED", paymentStatus: "CANCELLED" },
    });
  }
}
