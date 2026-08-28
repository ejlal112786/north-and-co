import { prisma } from "@/lib/prisma";
import { error, json } from "@/lib/http";
import { getSettings } from "@/lib/settings";

export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug") || "";
  if (!slug) return error("Missing slug", 400);
  const p = await prisma.product.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: { where: { isActive: true } },
    },
  });
  if (!p) return error("Not found", 404);
  const settings = await getSettings();
  return json({
    slug: p.slug,
    name: p.name,
    image: p.images[0]?.url || "/images/fallback.jpg",
    currency: settings.store.currency,
    variants: p.variants.map((v) => ({
      id: v.id,
      title: v.title,
      priceCents: v.priceCents,
      stockQty: v.stockQty,
      reservedQty: v.reservedQty,
      options: v.options,
    })),
  });
}
