import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin/guard";
import { audit } from "@/lib/auth";
import { json, error } from "@/lib/http";
import { z } from "zod";

export async function PATCH(req: Request) {
  const auth = await requireAdminApi("content");
  if (auth.error) return auth.error;
  try {
    const body = z.object({ id: z.string(), title: z.string().optional(), content: z.string().optional() }).parse(await req.json());
    const page = await prisma.cmsPage.update({
      where: { id: body.id },
      data: { title: body.title, content: body.content },
    });
    await audit(auth.user.id, "update", "page", page.id);
    return json(page);
  } catch {
    return error("Could not save page", 400);
  }
}
