import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin/guard";
import { audit } from "@/lib/auth";
import { json } from "@/lib/http";
import { z } from "zod";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi("reviews");
  if (auth.error) return auth.error;
  const { id } = await params;
  const body = z.object({ status: z.enum(["PENDING", "APPROVED", "REJECTED"]) }).parse(await req.json());
  await prisma.review.update({ where: { id }, data: { status: body.status } });
  await audit(auth.user.id, "moderate", "review", id, body);
  return json({ ok: true });
}
