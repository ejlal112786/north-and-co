import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin/guard";
import { audit } from "@/lib/auth";
import { error, json } from "@/lib/http";
import { z } from "zod";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi("products");
  if (auth.error) return auth.error;
  const { id } = await params;
  try {
    const body = z.record(z.string(), z.unknown()).parse(await req.json());
    const data: Record<string, unknown> = {};
    const copy = [
      "name",
      "slug",
      "shortDescription",
      "description",
      "status",
      "featured",
      "bestseller",
      "newArrival",
      "brandId",
      "categoryId",
      "tags",
      "specifications",
      "videoUrl",
      "seoTitle",
      "seoDescription",
    ];
    for (const k of copy) if (k in body) data[k] = body[k];
    if (typeof body.name === "string" || typeof body.tags === "string") {
      const p = await prisma.product.findUniqueOrThrow({ where: { id } });
      data.searchText = [String(data.name ?? p.name), p.shortDescription, p.description, String(data.tags ?? p.tags)]
        .join(" ")
        .toLowerCase();
    }
    const product = await prisma.product.update({ where: { id }, data });
    if (Array.isArray(body.images)) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      await prisma.productImage.createMany({
        data: (body.images as string[]).map((url, i) => ({ productId: id, url, alt: product.name, sortOrder: i })),
      });
    }
    if (Array.isArray(body.variants)) {
      for (const v of body.variants as { id?: string; sku: string; title: string; priceCents: number; compareAtCents?: number | null; stockQty: number; options?: string; isActive?: boolean }[]) {
        if (v.id) {
          await prisma.productVariant.update({
            where: { id: v.id },
            data: {
              sku: v.sku,
              title: v.title,
              priceCents: v.priceCents,
              compareAtCents: v.compareAtCents,
              stockQty: v.stockQty,
              options: v.options || "{}",
              isActive: v.isActive ?? true,
            },
          });
        } else {
          await prisma.productVariant.create({
            data: {
              productId: id,
              sku: v.sku,
              title: v.title,
              priceCents: v.priceCents,
              compareAtCents: v.compareAtCents,
              stockQty: v.stockQty,
              options: v.options || "{}",
            },
          });
        }
      }
    }
    await audit(auth.user.id, "update", "product", id, body);
    return json(product);
  } catch (e) {
    return error(e instanceof Error ? e.message : "Could not update", 400);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi("products");
  if (auth.error) return auth.error;
  const { id } = await params;
  const used = await prisma.orderItem.count({ where: { variant: { productId: id } } });
  if (used) {
    await prisma.product.update({ where: { id }, data: { status: "ARCHIVED" } });
    await audit(auth.user.id, "archive", "product", id);
    return json({ archived: true });
  }
  await prisma.product.delete({ where: { id } });
  await audit(auth.user.id, "delete", "product", id);
  return json({ deleted: true });
}
