import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin/guard";
import { audit } from "@/lib/auth";
import { json, error } from "@/lib/http";
import { z } from "zod";

export async function POST(req: Request) {
  const auth = await requireAdminApi("inventory");
  if (auth.error) return auth.error;
  try {
    const body = z
      .object({ variantId: z.string(), stockQty: z.number().int().min(0), reason: z.string().optional() })
      .parse(await req.json());
    const before = await prisma.productVariant.findUniqueOrThrow({ where: { id: body.variantId } });
    await prisma.productVariant.update({ where: { id: body.variantId }, data: { stockQty: body.stockQty } });
    await prisma.inventoryTransaction.create({
      data: {
        variantId: body.variantId,
        type: "ADJUST",
        quantity: body.stockQty - before.stockQty,
        reason: body.reason || "Manual adjust",
      },
    });
    await audit(auth.user.id, "adjust", "inventory", body.variantId, body);
    return json({ ok: true });
  } catch {
    return error("Could not adjust stock", 400);
  }
}
