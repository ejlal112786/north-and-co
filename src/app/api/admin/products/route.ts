import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin/guard";
import { audit } from "@/lib/auth";
import { error, json } from "@/lib/http";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  shortDescription: z.string().optional().default(""),
  description: z.string().optional().default(""),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  featured: z.boolean().optional(),
  bestseller: z.boolean().optional(),
  newArrival: z.boolean().optional(),
  brandId: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  tags: z.string().optional().default(""),
  specifications: z.string().optional(),
  videoUrl: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  images: z.array(z.string()).optional(),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        sku: z.string(),
        title: z.string(),
        priceCents: z.number().int().min(0),
        compareAtCents: z.number().int().nullable().optional(),
        stockQty: z.number().int().min(0),
        options: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .optional(),
});

export async function POST(req: Request) {
  const auth = await requireAdminApi("products");
  if (auth.error) return auth.error;
  try {
    const body = schema.parse(await req.json());
    const slug = slugify(body.slug || body.name);
    const searchText = [body.name, body.shortDescription, body.description, body.tags].join(" ").toLowerCase();
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug,
        shortDescription: body.shortDescription,
        description: body.description,
        searchText,
        status: body.status || "DRAFT",
        featured: body.featured ?? false,
        bestseller: body.bestseller ?? false,
        newArrival: body.newArrival ?? false,
        brandId: body.brandId,
        categoryId: body.categoryId,
        tags: body.tags,
        specifications: body.specifications || "[]",
        videoUrl: body.videoUrl,
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
        images: body.images?.length
          ? { create: body.images.map((url, i) => ({ url, alt: body.name, sortOrder: i })) }
          : undefined,
        variants: body.variants?.length
          ? {
              create: body.variants.map((v) => ({
                sku: v.sku,
                title: v.title,
                priceCents: v.priceCents,
                compareAtCents: v.compareAtCents,
                stockQty: v.stockQty,
                options: v.options || "{}",
                isActive: v.isActive ?? true,
              })),
            }
          : undefined,
      },
    });
    await audit(auth.user.id, "create", "product", product.id, { name: product.name });
    return json(product);
  } catch (e) {
    return error(e instanceof Error ? e.message : "Could not create", 400);
  }
}
