import { prisma } from "@/lib/prisma";
import { toCard } from "@/lib/catalog";
import { json } from "@/lib/http";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slugs = (url.searchParams.get("slugs") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 24);
  if (!slugs.length) return json({ products: [] });
  const products = await prisma.product.findMany({
    where: { slug: { in: slugs }, status: "PUBLISHED" },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 2 },
      variants: { where: { isActive: true } },
    },
  });
  const order = new Map(slugs.map((s, i) => [s, i]));
  products.sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0));
  return json({ products: products.map(toCard) });
}
