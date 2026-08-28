/**
 * Safe content update for a live database.
 * Does NOT delete orders, carts, payments, or customers.
 * Run: npx tsx prisma/upsert-content.ts
 */
import { PrismaClient } from "@prisma/client";
import { CMS_PAGES, FAQ_SEED } from "../src/lib/pages-content";

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
};

type Extra = {
  slug: string;
  name: string;
  short: string;
  description: string;
  categorySlug: string;
  brandSlug: string;
  featured?: boolean;
  newArrival?: boolean;
  tags: string;
  specs: { label: string; value: string }[];
  weight: number;
  variants: { sku: string; title: string; price: number; stock: number; options: Record<string, string> }[];
};

function sized(colors: string[], skuBase: string, price: number, stock: number): Extra["variants"] {
  return colors.flatMap((color) =>
    ["S", "M", "L", "XL"].map((size) => ({
      sku: `${skuBase}-${color.slice(0, 3).toUpperCase()}-${size}`,
      title: `${color} / ${size}`,
      price,
      stock,
      options: { color, size },
    }))
  );
}

const EXTRA: Extra[] = [
  {
    slug: "merino-polo",
    name: "Fine Merino Polo",
    short: "18-micron polo, a collar that sits, no logo.",
    description:
      "The same extrafine merino as the crewneck, with a short placket and a collar that does not collapse after a wash.",
    categorySlug: "knitwear",
    brandSlug: "holm",
    featured: true,
    newArrival: true,
    tags: TAGS["merino-polo"]!,
    specs: [
      { label: "Fiber", value: "100% extrafine merino, 18 micron" },
      { label: "Fit", value: "Regular. True to size." },
      { label: "Stretch", value: "Natural merino give" },
      { label: "Model", value: "178 cm wearing M" },
      { label: "Chest (M, laid flat)", value: "52 cm" },
      { label: "Length (M)", value: "70 cm" },
    ],
    weight: 280,
    variants: sized(["Oat", "Navy", "Ink"], "HOLM-PLO", 16500, 10),
  },
  {
    slug: "french-terry-hoodie",
    name: "Heavy French Terry Hoodie",
    short: "Loopback terry that does not bag at the pocket.",
    description: "A hoodie with weight. Cotton french terry, a kangaroo pocket that holds a book, rib that recovers.",
    categorySlug: "shirts",
    brandSlug: "north-and-co",
    newArrival: true,
    tags: TAGS["french-terry-hoodie"]!,
    specs: [
      { label: "Cloth", value: "Cotton french terry, 420 gsm" },
      { label: "Fit", value: "Relaxed, not oversized. Size down if you want trim." },
      { label: "Stretch", value: "Rib only" },
      { label: "Model", value: "178 cm wearing M" },
      { label: "Chest (M, laid flat)", value: "58 cm" },
    ],
    weight: 640,
    variants: sized(["Ink", "Oat"], "NC-HDY", 12800, 14),
  },
  {
    slug: "wool-overcoat",
    name: "Charcoal Wool Overcoat",
    short: "A proper coat. Horn buttons, a throat latch, unfinished sleeve.",
    description:
      "Mid-weight wool, a clean chest, enough shoulder to sit over a knit. We leave the sleeve unfinished so your tailor can set it.",
    categorySlug: "coats",
    brandSlug: "north-and-co",
    featured: true,
    newArrival: true,
    tags: TAGS["wool-overcoat"]!,
    specs: [
      { label: "Cloth", value: "Wool, 480 gsm" },
      { label: "Fit", value: "Regular over a knit. Size up over a jacket." },
      { label: "Stretch", value: "None" },
      { label: "Model", value: "178 cm wearing M" },
      { label: "Chest (M, laid flat)", value: "56 cm" },
      { label: "Length (M)", value: "108 cm" },
    ],
    weight: 1400,
    variants: sized(["Charcoal", "Navy"], "NC-OVC", 42000, 6),
  },
  {
    slug: "cotton-chino",
    name: "Cotton Twill Chino",
    short: "A khaki that is actually khaki. Unfinished hem.",
    description:
      "Mid-weight cotton twill, a clean front, enough room to sit. We leave the hem unfinished so your tailor can set it to the loafer or the trainer.",
    categorySlug: "bottoms",
    brandSlug: "north-and-co",
    newArrival: true,
    tags: TAGS["cotton-chino"]!,
    specs: [
      { label: "Cloth", value: "Cotton twill, 280 gsm" },
      { label: "Fit", value: "Regular, slight taper. True to waist." },
      { label: "Stretch", value: "None" },
      { label: "Model", value: "178 cm wearing 32" },
      { label: "Rise", value: "Mid" },
      { label: "Hem", value: "Unfinished, 34 inch inseam" },
    ],
    weight: 480,
    variants: ["Khaki", "Navy"].flatMap((color) =>
      ["28", "30", "32", "34", "36"].map((size) => ({
        sku: `NC-CHN-${color.slice(0, 3).toUpperCase()}-${size}`,
        title: `${color} / ${size}`,
        price: 14500,
        stock: 9,
        options: { color, size },
      }))
    ),
  },
  {
    slug: "shirt-jacket",
    name: "Heavy Cotton Shirt-Jacket",
    short: "An overshirt with enough cloth to be a jacket.",
    description:
      "Oat cotton canvas, two chest pockets, corozo buttons. Wear it open over the polo or closed as the outer layer on a mild day.",
    categorySlug: "shirts",
    brandSlug: "north-and-co",
    featured: true,
    newArrival: true,
    tags: TAGS["shirt-jacket"]!,
    specs: [
      { label: "Cloth", value: "Cotton canvas, 340 gsm" },
      { label: "Fit", value: "Regular over a tee. Size up over a knit." },
      { label: "Stretch", value: "None" },
      { label: "Model", value: "178 cm wearing M" },
      { label: "Chest (M, laid flat)", value: "57 cm" },
    ],
    weight: 720,
    variants: sized(["Oat", "Ink"], "NC-SHJ", 18500, 8),
  },
  {
    slug: "silk-slip-dress",
    name: "Bias Silk Slip Dress",
    short: "Charmeuse that hangs. Thin straps, a bias cut, no lining theater.",
    description:
      "Silk charmeuse, cut on the bias so it follows the body without a zipper fight. Wear it alone or under the overcoat. Hand wash cold.",
    categorySlug: "dresses",
    brandSlug: "north-and-co",
    featured: true,
    newArrival: true,
    tags: TAGS["silk-slip-dress"]!,
    specs: [
      { label: "Cloth", value: "Silk charmeuse" },
      { label: "Fit", value: "Bias. If between sizes, take the larger." },
      { label: "Stretch", value: "None — the bias is the give" },
      { label: "Model", value: "175 cm wearing S" },
      { label: "Length (S)", value: "118 cm" },
    ],
    weight: 180,
    variants: ["Ink", "Oat"].flatMap((color) =>
      ["XS", "S", "M", "L"].map((size) => ({
        sku: `NC-SLP-${color.slice(0, 3).toUpperCase()}-${size}`,
        title: `${color} / ${size}`,
        price: 22000,
        stock: 7,
        options: { color, size },
      }))
    ),
  },
  {
    slug: "leather-loafer",
    name: "Vegetable-Tanned Penny Loafer",
    short: "A penny loafer that will take a crease. Leather sole.",
    description:
      "Vegetable-tanned calf, a penny slot, a leather sole you can resole. They are stiff the first week. That is the hide doing its job.",
    categorySlug: "accessories",
    brandSlug: "field-theory",
    newArrival: true,
    tags: TAGS["leather-loafer"]!,
    specs: [
      { label: "Leather", value: "Vegetable-tanned calf" },
      { label: "Sole", value: "Leather, resoleable" },
      { label: "Fit", value: "True to size. If between, size up." },
      { label: "Last", value: "Slightly round toe" },
    ],
    weight: 780,
    variants: ["Tan", "Black"].flatMap((color) =>
      ["40", "41", "42", "43", "44", "45"].map((size) => ({
        sku: `FT-LFR-${color.slice(0, 3).toUpperCase()}-${size}`,
        title: `${color} / EU ${size}`,
        price: 16800,
        stock: 5,
        options: { color, size },
      }))
    ),
  },
  {
    slug: "boiled-wool-scarf",
    name: "Boiled Wool Scarf",
    short: "Dense, quiet, 180 × 30 cm. No fringe costume.",
    description: "Boiled wool that does not itch at the neck. Charcoal or oat. Long enough to wrap once. No logo.",
    categorySlug: "accessories",
    brandSlug: "holm",
    tags: TAGS["boiled-wool-scarf"]!,
    specs: [
      { label: "Fiber", value: "Boiled wool" },
      { label: "Size", value: "180 × 30 cm" },
    ],
    weight: 220,
    variants: [
      { sku: "HOLM-SCF-CHA", title: "Charcoal", price: 7200, stock: 14, options: { color: "Charcoal" } },
      { sku: "HOLM-SCF-OAT", title: "Oat", price: 7200, stock: 12, options: { color: "Oat" } },
    ],
  },
];

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
    parsed.currency = "pkr";
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

  const apparel = await prisma.category.findUnique({ where: { slug: "apparel" } });
  if (apparel) {
    await prisma.category.upsert({
      where: { slug: "coats" },
      create: { slug: "coats", name: "Coats", parentId: apparel.id, sortOrder: 5 },
      update: { name: "Coats", parentId: apparel.id },
    });
    await prisma.category.upsert({
      where: { slug: "dresses" },
      create: { slug: "dresses", name: "Dresses", parentId: apparel.id, sortOrder: 6 },
      update: { name: "Dresses", parentId: apparel.id },
    });
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

  for (const p of EXTRA) {
    const found = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (found) continue;
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
        newArrival: !!p.newArrival,
        brandId: brand.id,
        categoryId: category.id,
        specifications: JSON.stringify(p.specs),
        tags: p.tags,
        seoTitle: `${p.name} — NORTH & CO.`,
        seoDescription: p.short,
        weightGrams: p.weight,
        images: {
          create: [
            { url: `/images/products/${p.slug}.jpg`, alt: p.name, sortOrder: 0 },
            { url: `/images/products/${p.slug}-2.jpg`, alt: `${p.name} detail`, sortOrder: 1 },
          ],
        },
        variants: {
          create: p.variants.map((v) => ({
            sku: v.sku,
            title: v.title,
            priceCents: v.price,
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

  const bySlug = Object.fromEntries((await prisma.product.findMany({ select: { id: true, slug: true } })).map((p) => [p.slug, p.id]));
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
  await rel("french-terry-hoodie", "canvas-tote", "fbt");

  console.log("Upsert complete.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
