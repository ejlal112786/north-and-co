import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin/guard";
import { audit } from "@/lib/auth";
import { json } from "@/lib/http";
import { mailReturnUpdate, orderToEmail } from "@/lib/mail";
import { z } from "zod";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi("returns");
  if (auth.error) return auth.error;
  const { id } = await params;
  const body = z
    .object({
      status: z.enum(["REQUESTED", "APPROVED", "REJECTED", "RECEIVED", "REFUNDED", "EXCHANGED", "CANCELLED"]),
      adminNote: z.string().optional(),
    })
    .parse(await req.json());
  const row = await prisma.returnRequest.update({
    where: { id },
    data: { status: body.status, adminNote: body.adminNote || "" },
    include: { order: { include: { items: true } } },
  });
  await mailReturnUpdate(orderToEmail(row.order), body.status, body.adminNote || "");
  await audit(auth.user.id, "update", "return", id, body);
  return json({ ok: true });
}
