import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

export type ProductFilters = {
  q?: string;
  category?: string;
  brand?: string;
  min?: number;
  max?: number;
  inStock?: boolean;
  rating?: number;
  size?: string;
  color?: string;
  gender?: string;
  style?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
};

export async function searchProducts(filters: ProductFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(48, Math.max(12, filters.pageSize ?? 24));

  const where: Prisma.ProductWhereInput = {
    status: "PUBLISHED",
  };

  if (filters.category) {
    const cat = await prisma.category.findUnique({
      where: { slug: filters.category },
      include: { children: true },
    });
    if (cat) {
      const ids = [cat.id, ...cat.children.map((c) => c.id)];
      where.categoryId = { in: ids };
    } else {
      where.categoryId = "__none__";
    }
  }
  if (filters.brand) {
    const brand = await prisma.brand.findUnique({ where: { slug: filters.brand } });
    where.brandId = brand?.id ?? "__none__";
  }
  const and: Prisma.ProductWhereInput[] = [];
  if (filters.q) {
    const q = filters.q.trim().toLowerCase();
    const tokens = q.split(/\s+/).filter((t) => t.length >= 1);
    and.push(...tokens.map((t) => ({ searchText: { contains: t } })));
  }
  if (filters.gender) and.push({ tags: { contains: `gender:${filters.gender}` } });
  if (filters.style) and.push({ tags: { contains: `style:${filters.style}` } });
  if (and.length) where.AND = and;
  if (filters.featured) where.featured = true;
  if (filters.bestseller) where.bestseller = true;
  if (filters.newArrival) where.newArrival = true;

  const variantWhere: Prisma.ProductVariantWhereInput = { isActive: true };
  if (filters.min != null) variantWhere.priceCents = { ...(variantWhere.priceCents as object), gte: filters.min };
  if (filters.max != null)
    variantWhere.priceCents = {
      ...(typeof variantWhere.priceCents === "object" ? variantWhere.priceCents : {}),
      lte: filters.max,
    } as Prisma.IntFilter;
  if (filters.inStock) {
    // available = stock - reserved > 0 approximated as stockQty > 0; refined in map
    variantWhere.stockQty = { gt: 0 };
  }
  if (filters.size) variantWhere.options = { contains: `"size":"${filters.size}"` };
  if (filters.color) variantWhere.options = { contains: `"color":"${filters.color}"` };

  where.variants = { some: variantWhere };

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  switch (filters.sort) {
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
    case "price_asc":
    case "price_desc":
    case "bestselling":
    case "rating":
    case "relevance":
    default:
      orderBy = filters.q ? { featured: "desc" } : { createdAt: "desc" };
  }

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { where: { isActive: true } },
        brand: true,
        category: true,
        reviews: { where: { status: "APPROVED" }, select: { rating: true } },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  let mapped = products.map((p) => {
    const ratings = p.reviews.map((r) => r.rating);
    const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    const prices = p.variants.map((v) => v.priceCents);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const available = p.variants.reduce((s, v) => s + Math.max(0, v.stockQty - v.reservedQty), 0);
    const soldProxy = p.variants.reduce((s, v) => s + Math.max(0, 80 - v.stockQty), 0);
    return { ...p, avgRating: avg, reviewCount: ratings.length, minPrice, maxPrice, available, soldProxy };
  });

  if (filters.rating) mapped = mapped.filter((p) => p.avgRating >= filters.rating!);
  if (filters.inStock) mapped = mapped.filter((p) => p.available > 0);

  if (filters.sort === "price_asc") mapped.sort((a, b) => a.minPrice - b.minPrice);
  if (filters.sort === "price_desc") mapped.sort((a, b) => b.minPrice - a.minPrice);
  if (filters.sort === "bestselling") mapped.sort((a, b) => Number(b.bestseller) - Number(a.bestseller) || b.soldProxy - a.soldProxy);
  if (filters.sort === "rating") mapped.sort((a, b) => b.avgRating - a.avgRating);

  return { products: mapped, total, page, pageSize, pages: Math.ceil(total / pageSize) };
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { where: { isActive: true } },
      brand: true,
      category: { include: { parent: true } },
      reviews: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
      },
      relationsFrom: {
        include: {
          related: {
            include: {
              images: { orderBy: { sortOrder: "asc" }, take: 1 },
              variants: { where: { isActive: true }, take: 1 },
            },
          },
        },
      },
    },
  });
}

export function variantOptions(variants: { options: string }[]) {
  const sizes = new Set<string>();
  const colors = new Set<string>();
  for (const v of variants) {
    try {
      const o = JSON.parse(v.options) as { size?: string; color?: string };
      if (o.size) sizes.add(o.size);
      if (o.color) colors.add(o.color);
    } catch {
      /* ignore */
    }
  }
  return { sizes: [...sizes], colors: [...colors] };
}

export async function suggestSearch(q: string) {
  const query = q.trim().toLowerCase();
  if (query.length < 2) return { products: [], categories: [] };
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { status: "PUBLISHED", searchText: { contains: query } },
      select: {
        name: true,
        slug: true,
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        variants: { where: { isActive: true }, take: 1, select: { priceCents: true } },
      },
      take: 6,
    }),
    prisma.category.findMany({
      where: { isActive: true, name: { contains: q.trim() } },
      take: 4,
    }),
  ]);
  return { products, categories };
}

export function levenshtein(a: string, b: string) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i]![0] = i;
  for (let j = 0; j <= n; j++) dp[0]![j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i]![j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1]![j - 1]!
          : 1 + Math.min(dp[i - 1]![j]!, dp[i]![j - 1]!, dp[i - 1]![j - 1]!);
    }
  }
  return dp[m]![n]!;
}

export function toCard(p: {
  slug: string;
  name: string;
  minPrice?: number;
  avgRating?: number;
  reviewCount?: number;
  available?: number;
  bestseller?: boolean;
  newArrival?: boolean;
  images: { url: string }[];
  variants: { id: string; priceCents: number; compareAtCents: number | null; stockQty: number; reservedQty: number }[];
}) {
  const prices = p.variants.map((v) => v.priceCents);
  const minPrice = p.minPrice ?? (prices.length ? Math.min(...prices) : 0);
  const compareAt = p.variants.map((v) => v.compareAtCents).find((c) => c && c > minPrice) ?? null;
  const available =
    p.available ?? p.variants.reduce((s, v) => s + Math.max(0, v.stockQty - v.reservedQty), 0);
  return {
    slug: p.slug,
    name: p.name,
    minPrice,
    compareAt,
    image: p.images[0]?.url || "/images/fallback.jpg",
    avgRating: p.avgRating,
    reviewCount: p.reviewCount,
    available,
    bestseller: p.bestseller,
    newArrival: p.newArrival,
    variantId: p.variants.length === 1 ? p.variants[0]!.id : undefined,
  };
}

export async function fuzzyRescue(q: string) {
  const names = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    select: { name: true, slug: true },
    take: 200,
  });
  const query = q.toLowerCase();
  const scored = names
    .map((p) => ({ ...p, d: levenshtein(query, p.name.toLowerCase().slice(0, query.length + 4)) }))
    .filter((p) => p.d <= 3)
    .sort((a, b) => a.d - b.d)
    .slice(0, 6);
  return scored;
}
