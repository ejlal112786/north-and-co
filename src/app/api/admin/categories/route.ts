import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin/guard";
import { audit } from "@/lib/auth";
import { json, error } from "@/lib/http";
import { slugify } from "@/lib/utils";
import { z } from "zod";

export async function POST(req: Request) {
  const auth = await requireAdminApi("products");
  if (auth.error) return auth.error;
  try {
    const body = z
      .object({
        name: z.string().min(2),
        slug: z.string().optional(),
        parentId: z.string().nullable().optional(),
        description: z.string().optional(),
        image: z.string().optional().nullable(),
        featured: z.boolean().optional(),
      })
      .parse(await req.json());
    const cat = await prisma.category.create({
      data: {
        name: body.name,
        slug: slugify(body.slug || body.name),
        parentId: body.parentId,
        description: body.description || "",
        image: body.image,
        featured: body.featured ?? false,
      },
    });
    await audit(auth.user.id, "create", "category", cat.id);
    return json(cat);
  } catch (e) {
    return error(e instanceof Error ? e.message : "Could not create", 400);
  }
}
