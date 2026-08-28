import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/http";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const { id } = z.object({ id: z.string() }).parse(await req.json());
    await prisma.review.update({ where: { id }, data: { helpful: { increment: 1 } } });
    return json({ ok: true });
  } catch {
    return error("Could not record vote", 400);
  }
}
