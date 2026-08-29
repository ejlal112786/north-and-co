/**
 * Safe content update for a live database.
 * Does NOT delete orders, carts, payments, or customers.
 * Run: npx tsx prisma/upsert-content.ts
 */
import { PrismaClient } from "@prisma/client";
import { CMS_PAGES, FAQ_SEED } from "../src/lib/pages-content";
import { CLOTHES_EXTRA, RETIRE_SLUGS, productImageUrls } from "../src/lib/clothes-extra";

const prisma = new PrismaClient();

function searchText(...parts: string[]) {
  return parts.join(" ").toLowerCase();
}

const TAGS: Record<string, string> = {
  "merino-crewneck": "merino sweater knit winter layer gender:unisex style:minimal",
  "washed-oxford-shirt": "oxford shirt cotton workwear gender:men style:workwear",
  "wide-leg-trouser": "trousers wool wide-leg tailoring gender:unisex style:tailoring",
  "heavyweight-tee": "t-shirt tee cotton basics gender:unisex style:basics",
  "field-jacket": "jacket waxed cotton outdoor field gender:unisex style:outdoor",
  "linen-overshirt": "linen overshirt layering summer gender:unisex style:layering",
  "cashmere-beanie": "beanie cashmere hat winter gender:unisex style:basics",
  "silk-scarf": "scarf silk print gender:women style:print",
  "merino-polo": "polo merino knit gender:unisex style:minimal",
  "french-terry-hoodie": "hoodie sweatshirt cotton gender:unisex style:basics",
  "wool-overcoat": "coat overcoat wool gender:unisex style:minimal",
  "cotton-chino": "chino trousers cotton khaki gender:unisex style:workwear",
  "shirt-jacket": "overshirt jacket cotton layering gender:unisex style:workwear",
  "silk-slip-dress": "dress silk slip evening gender:women style:minimal",
  "leather-loafer": "loafer shoes leather gender:unisex style:tailoring",
  "boiled-wool-scarf": "scarf wool winter gender:unisex style:minimal",
  "merino-socks": "socks merino trail pack gender:unisex style:basics",
  "leather-belt": "belt leather brass gender:unisex style:tailoring",
  sunglasses: "sunglasses acetate eyewear gender:unisex style:minimal",
};

async function ensureThreeImages(productId: string, slug: string, name: string) {
  const existing = await prisma.productImage.findMany({ where: { productId }, orderBy: { sortOrder: "asc" } });
  const urls = productImageUrls(slug);
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]!;
    if (existing.some((img) => img.url === url)) continue;
    if (existing[i] && !urls.includes(existing[i]!.url) && i < existing.length) continue;
    await prisma.productImage.create({
      data: {
        productId,
        url,
        alt: i === 0 ? name : `${name}, angle ${i + 1}`,
        sortOrder: i,
      },
    });
  }
}

async function main() {
  console.log("Upserting content (orders left intact)…");

  for (const p of CMS_PAGES) {
    await prisma.cmsPage.upsert({
      where: { slug: p.slug },
      create: { slug: p.slug, title: p.title, seoTitle: p.seoTitle || null, content: p.content },
      update: { title: p.title, seoTitle: p.seoTitle || null, content: p.content, isPublished: true },
    });
  }

  await prisma.faq.deleteMany();
  await prisma.faq.createMany({ data: FAQ_SEED });

  const lookbookNav = await prisma.navigationItem.findFirst({
    where: { location: "header", href: "/lookbook" },
  });
  if (!lookbookNav) {
    await prisma.navigationItem.create({
      data: { location: "header", label: "Lookbooks", href: "/lookbook", sortOrder: 4 },
    });
  }

  await prisma.navigationItem.updateMany({
    where: { location: "header", href: "/shop?category=home" },
    data: { label: "Dresses", href: "/shop?category=dresses" },
  });
  await prisma.navigationItem.updateMany({
    where: { location: "header", href: "/shop?category=objects" },
    data: { label: "Outerwear", href: "/shop?category=outerwear" },
  });

  const store = await prisma.setting.findUnique({ where: { key: "store" } });
  if (store) {
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(store.value) as Record<string, unknown>;
    } catch {
      parsed = {};
    }
    parsed.email = "spideyspider112786@gmail.com";
    parsed.phone = parsed.phone || "";
    parsed.address = "";
    parsed.currency = "usd";
    parsed.timezone = "Asia/Karachi";
    parsed.country = "PK";
    await prisma.setting.update({ where: { key: "store" }, data: { value: JSON.stringify(parsed) } });
  }

  const strip = await prisma.banner.findFirst({ where: { position: "home-strip" } });
  if (strip) {
    await prisma.banner.update({
      where: { id: strip.id },
      data: {
        title: "Guest checkout. Rapid or cash on delivery.",
        subtitle: "No accounts. Keep your order number.",
      },
    });
  }
  const split = await prisma.banner.findFirst({ where: { position: "home-split" } });
  if (split) {
    await prisma.banner.update({
      where: { id: split.id },
      data: {
        title: "A trench that is actually a trench",
        subtitle: "Gabardine, a belt that ties, unfinished sleeve.",
        href: "/product/trench-coat",
      },
    });
  }

  const apparel = await prisma.category.findUnique({ where: { slug: "apparel" } });
  if (apparel) {
    await prisma.category.update({ where: { id: apparel.id }, data: { featured: false } });
    await prisma.category.upsert({
      where: { slug: "coats" },
      create: {
        slug: "coats",
        name: "Coats",
        parentId: apparel.id,
        sortOrder: 5,
        featured: true,
        image: "/images/products/wool-overcoat.jpg",
      },
      update: {
        name: "Coats",
        parentId: apparel.id,
        featured: true,
        image: "/images/products/wool-overcoat.jpg",
      },
    });
    await prisma.category.upsert({
      where: { slug: "dresses" },
      create: {
        slug: "dresses",
        name: "Dresses",
        parentId: apparel.id,
        sortOrder: 6,
        featured: true,
        image: "/images/products/silk-slip-dress.jpg",
      },
      update: {
        name: "Dresses",
        parentId: apparel.id,
        featured: true,
        image: "/images/products/silk-slip-dress.jpg",
      },
    });
    await prisma.category.upsert({
      where: { slug: "skirts" },
      create: {
        slug: "skirts",
        name: "Skirts",
        parentId: apparel.id,
        sortOrder: 7,
        featured: true,
        image: "/images/products/pleated-midi-skirt.jpg",
      },
      update: {
        name: "Skirts",
        parentId: apparel.id,
        featured: true,
        image: "/images/products/pleated-midi-skirt.jpg",
      },
    });
  }

  await prisma.category.updateMany({
    where: { slug: { in: ["home", "beauty", "outdoor", "objects", "bedding", "table", "lighting"] } },
    data: { featured: false },
  });
  await prisma.category.updateMany({
    where: { slug: { in: ["knitwear", "shirts", "outerwear", "bottoms", "coats", "dresses", "skirts", "accessories"] } },
    data: { featured: true },
  });
  const catImages: Record<string, string> = {
    knitwear: "/images/products/merino-crewneck.jpg",
    shirts: "/images/products/washed-oxford-shirt.jpg",
    outerwear: "/images/products/field-jacket.jpg",
    bottoms: "/images/products/wide-leg-trouser.jpg",
    accessories: "/images/categories/accessories.jpg",
  };
  for (const [slug, image] of Object.entries(catImages)) {
    await prisma.category.updateMany({ where: { slug }, data: { image } });
  }

  for (const slug of RETIRE_SLUGS) {
    const n = await prisma.product.updateMany({ where: { slug }, data: { status: "ARCHIVED" } });
    if (n.count) console.log("Archived", slug);
  }

  for (const [slug, tags] of Object.entries(TAGS)) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      await prisma.product.update({
        where: { slug },
        data: { tags, searchText: searchText(existing.name, existing.shortDescription, existing.description, tags) },
      });
    }
  }

  const brands = Object.fromEntries((await prisma.brand.findMany()).map((b) => [b.slug, b]));
  const cats = Object.fromEntries((await prisma.category.findMany()).map((c) => [c.slug, c]));

  for (const p of CLOTHES_EXTRA) {
    const found = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (found) {
      if (found.status !== "PUBLISHED") {
        await prisma.product.update({ where: { id: found.id }, data: { status: "PUBLISHED" } });
      }
      await ensureThreeImages(found.id, p.slug, found.name);
      continue;
    }
    const category = cats[p.categorySlug];
    const brand = brands[p.brandSlug];
    if (!category || !brand) {
      console.warn(`Skip ${p.slug}: missing category ${p.categorySlug} or brand ${p.brandSlug}`);
      continue;
    }
    await prisma.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        shortDescription: p.short,
        description: p.description,
        searchText: searchText(p.name, p.short, p.description, p.tags, p.variants.map((v) => v.sku).join(" ")),
        status: "PUBLISHED",
        featured: !!p.featured,
        bestseller: !!p.bestseller,
        newArrival: !!p.newArrival,
        brandId: brand.id,
        categoryId: category.id,
        specifications: JSON.stringify(p.specs),
        tags: p.tags,
        seoTitle: `${p.name} — NORTH & CO.`,
        seoDescription: p.short,
        weightGrams: p.weight,
        images: {
          create: productImageUrls(p.slug).map((url, i) => ({
            url,
            alt: i === 0 ? p.name : `${p.name}, angle ${i + 1}`,
            sortOrder: i,
          })),
        },
        variants: {
          create: p.variants.map((v) => ({
            sku: v.sku,
            title: v.title,
            priceCents: v.price,
            compareAtCents: v.compare ?? null,
            stockQty: v.stock,
            reservedQty: 0,
            lowStockThreshold: 5,
            options: JSON.stringify(v.options),
          })),
        },
      },
    });
    console.log("Created product", p.slug);
  }

  const published = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, slug: true, name: true },
  });
  for (const p of published) {
    await ensureThreeImages(p.id, p.slug, p.name);
  }

  const bySlug = Object.fromEntries(published.map((p) => [p.slug, p.id]));
  const created = await prisma.product.findMany({ select: { id: true, slug: true } });
  for (const p of created) bySlug[p.slug] = p.id;

  const rel = async (from: string, to: string, kind: string) => {
    const a = bySlug[from];
    const b = bySlug[to];
    if (!a || !b) return;
    await prisma.productRelation.upsert({
      where: { productId_relatedId_kind: { productId: a, relatedId: b, kind } },
      create: { productId: a, relatedId: b, kind },
      update: {},
    });
  };
  await rel("merino-polo", "wide-leg-trouser", "related");
  await rel("merino-polo", "wool-overcoat", "fbt");
  await rel("wool-overcoat", "merino-crewneck", "related");
  await rel("french-terry-hoodie", "wide-leg-jean", "fbt");
  await rel("trench-coat", "wool-blazer", "related");
  await rel("trench-coat", "cashmere-turtleneck", "fbt");
  await rel("wool-blazer", "pleated-trouser", "related");
  await rel("wool-blazer", "cotton-poplin-shirt", "fbt");
  await rel("knit-midi-dress", "leather-loafer", "fbt");
  await rel("pleated-midi-skirt", "silk-blouse", "fbt");
  await rel("wide-leg-jean", "denim-jacket", "related");

  console.log("Upsert complete.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
