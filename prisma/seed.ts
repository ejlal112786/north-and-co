import { PrismaClient, CouponType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CMS_PAGES, FAQ_SEED } from "../src/lib/pages-content";
import { CLOTHES_EXTRA, RETIRE_SLUGS, productImageUrls } from "../src/lib/clothes-extra";

const prisma = new PrismaClient();

function searchText(...parts: string[]) {
  return parts.join(" ").toLowerCase();
}

async function main() {
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.orderNote.deleteMany();
  await prisma.returnRequest.deleteMany();
  await prisma.inventoryTransaction.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productRelation.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.shippingMethod.deleteMany();
  await prisma.shippingZone.deleteMany();
  await prisma.cmsPage.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.navigationItem.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.counter.deleteMany();
  await prisma.adminSession.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.adminUser.deleteMany();

  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD || "NorthAdmin!2026";
  await prisma.adminUser.create({
    data: {
      email: (process.env.ADMIN_BOOTSTRAP_EMAIL || "julia.r@example.org").toLowerCase(),
      name: process.env.ADMIN_BOOTSTRAP_NAME || "Store Owner",
      passwordHash: await bcrypt.hash(password, 12),
      role: "OWNER",
    },
  });
  await prisma.adminUser.create({
    data: {
      email: "peter.m@example.com",
      name: "Order Desk",
      passwordHash: await bcrypt.hash("Orders!2026", 12),
      role: "ORDER_MANAGER",
    },
  });

  const brands = await Promise.all(
    [
      { slug: "north-and-co", name: "NORTH & CO.", description: "Our house line. Cut, dyed, and finished to last." },
      { slug: "holm", name: "Holm", description: "Knitwear from undyed merino and cashmere." },
      { slug: "field-theory", name: "Field Theory", description: "Waxed cloth, hardware, and outdoor kit." },
      { slug: "atelier-m", name: "Atelier M", description: "Small-batch ceramics and table objects." },
      { slug: "kettle-kiln", name: "Kettle & Kiln", description: "Soap, oil, and quiet fragrance." },
    ].map((b) => prisma.brand.create({ data: b }))
  );
  const brand = Object.fromEntries(brands.map((b) => [b.slug, b]));

  const apparel = await prisma.category.create({
    data: {
      slug: "apparel",
      name: "Apparel",
      description: "Cloth that earns its keep — merino, linen, waxed cotton.",
      image: "/images/categories/apparel.jpg",
      featured: false,
      sortOrder: 1,
      seoTitle: "Apparel — NORTH & CO.",
      seoDescription: "Merino knits, washed shirts, and field jackets.",
    },
  });
  const home = await prisma.category.create({
    data: {
      slug: "home",
      name: "Home",
      description: "Linen, stoneware, and light for rooms you actually live in.",
      image: "/images/categories/home.jpg",
      featured: false,
      sortOrder: 2,
    },
  });
  const beauty = await prisma.category.create({
    data: {
      slug: "beauty",
      name: "Beauty",
      description: "Unscented soap, bergamot wash, mineral SPF.",
      image: "/images/categories/beauty.jpg",
      featured: false,
      sortOrder: 3,
    },
  });
  const accessories = await prisma.category.create({
    data: {
      slug: "accessories",
      name: "Accessories",
      description: "Leather, canvas, and silk — daily carry.",
      image: "/images/categories/accessories.jpg",
      featured: true,
      sortOrder: 4,
    },
  });
  const outdoor = await prisma.category.create({
    data: {
      slug: "outdoor",
      name: "Outdoor",
      description: "Packs, bottles, and waxed duffles.",
      image: "/images/categories/outdoor.jpg",
      featured: false,
      sortOrder: 5,
    },
  });
  const objects = await prisma.category.create({
    data: {
      slug: "objects",
      name: "Objects",
      description: "Desk tools, paper, and candles.",
      image: "/images/categories/objects.jpg",
      featured: false,
      sortOrder: 6,
    },
  });

  const knitwear = await prisma.category.create({
    data: {
      slug: "knitwear",
      name: "Knitwear",
      parentId: apparel.id,
      sortOrder: 1,
      featured: true,
      image: "/images/products/merino-crewneck.jpg",
    },
  });
  const shirts = await prisma.category.create({
    data: {
      slug: "shirts",
      name: "Shirts",
      parentId: apparel.id,
      sortOrder: 2,
      featured: true,
      image: "/images/products/washed-oxford-shirt.jpg",
    },
  });
  const outerwear = await prisma.category.create({
    data: {
      slug: "outerwear",
      name: "Outerwear",
      parentId: apparel.id,
      sortOrder: 3,
      featured: true,
      image: "/images/products/field-jacket.jpg",
    },
  });
  const bottoms = await prisma.category.create({
    data: {
      slug: "bottoms",
      name: "Bottoms",
      parentId: apparel.id,
      sortOrder: 4,
      featured: true,
      image: "/images/products/wide-leg-trouser.jpg",
    },
  });
  const bedding = await prisma.category.create({
    data: { slug: "bedding", name: "Bedding", parentId: home.id, sortOrder: 1 },
  });
  const table = await prisma.category.create({
    data: { slug: "table", name: "Table", parentId: home.id, sortOrder: 2 },
  });
  const lighting = await prisma.category.create({
    data: { slug: "lighting", name: "Lighting", parentId: home.id, sortOrder: 3 },
  });
  const coats = await prisma.category.create({
    data: {
      slug: "coats",
      name: "Coats",
      parentId: apparel.id,
      sortOrder: 5,
      featured: true,
      image: "/images/products/wool-overcoat.jpg",
    },
  });
  const dresses = await prisma.category.create({
    data: {
      slug: "dresses",
      name: "Dresses",
      parentId: apparel.id,
      sortOrder: 6,
      featured: true,
      image: "/images/products/silk-slip-dress.jpg",
    },
  });
  const skirts = await prisma.category.create({
    data: {
      slug: "skirts",
      name: "Skirts",
      parentId: apparel.id,
      sortOrder: 7,
      featured: true,
      image: "/images/products/pleated-midi-skirt.jpg",
    },
  });

  type V = {
    sku: string;
    title: string;
    price: number;
    compare?: number;
    stock: number;
    options: Record<string, string>;
  };
  type P = {
    slug: string;
    name: string;
    short: string;
    description: string;
    categoryId: string;
    brandId: string;
    featured?: boolean;
    bestseller?: boolean;
    newArrival?: boolean;
    tags: string;
    specs: { label: string; value: string }[];
    weight: number;
    videoUrl?: string;
    variants: V[];
  };

  const catalog: P[] = [
    {
      slug: "merino-crewneck",
      name: "The Merino Crewneck",
      short: "18-micron merino, washed once so it hangs like a favorite.",
      description:
        "Spun in Italy from 18-micron merino and fully fashioned — no side seams, no itch. We wash it before it ships so the first wear is already broken in. Wear it against the skin or over a shirt; it does not pill in the usual places if you don't machine-dry it.\n\nThe shoulder is set slightly forward. The rib is dense enough to hold its line after years of weekends.",
      categoryId: knitwear.id,
      brandId: brand["holm"]!.id,
      featured: true,
      bestseller: true,
      tags: "merino sweater knit winter layer gender:unisex style:minimal",
      specs: [
        { label: "Fiber", value: "100% extrafine merino, 18 micron" },
        { label: "Gauge", value: "12" },
        { label: "Origin", value: "Knitted in Italy" },
        { label: "Care", value: "Hand wash cold, dry flat" },
        { label: "Fit", value: "Regular, slight ease. Does not run small." },
        { label: "Stretch", value: "Natural merino give; not a stretch knit" },
        { label: "Model", value: "178 cm wearing M" },
        { label: "Chest (M, laid flat)", value: "54 cm" },
        { label: "Length (M)", value: "68 cm" },
      ],
      weight: 420,
      variants: [
        { sku: "HOLM-CRW-NVY-S", title: "Navy / S", price: 18500, stock: 12, options: { color: "Navy", size: "S" } },
        { sku: "HOLM-CRW-NVY-M", title: "Navy / M", price: 18500, stock: 18, options: { color: "Navy", size: "M" } },
        { sku: "HOLM-CRW-NVY-L", title: "Navy / L", price: 18500, stock: 14, options: { color: "Navy", size: "L" } },
        { sku: "HOLM-CRW-NVY-XL", title: "Navy / XL", price: 18500, stock: 8, options: { color: "Navy", size: "XL" } },
        { sku: "HOLM-CRW-OAT-S", title: "Oat / S", price: 18500, stock: 10, options: { color: "Oat", size: "S" } },
        { sku: "HOLM-CRW-OAT-M", title: "Oat / M", price: 18500, stock: 16, options: { color: "Oat", size: "M" } },
        { sku: "HOLM-CRW-OAT-L", title: "Oat / L", price: 18500, stock: 11, options: { color: "Oat", size: "L" } },
        { sku: "HOLM-CRW-BLK-M", title: "Black / M", price: 18500, compare: 22000, stock: 7, options: { color: "Black", size: "M" } },
        { sku: "HOLM-CRW-BLK-L", title: "Black / L", price: 18500, compare: 22000, stock: 6, options: { color: "Black", size: "L" } },
      ],
    },
    {
      slug: "washed-oxford-shirt",
      name: "Washed Oxford Shirt",
      short: "A two-ply oxford, enzyme-washed until the collar sits correctly.",
      description:
        "Woven in Portugal from two-ply cotton oxford, then enzyme-washed so the hand is closer to a shirt you have owned for a decade. The collar is a soft button-down; the placket is clean. It is meant to be worn open, with the sleeves pushed, or tucked into the wool trouser.",
      categoryId: shirts.id,
      brandId: brand["north-and-co"]!.id,
      featured: true,
      tags: "oxford shirt cotton workwear gender:men style:workwear",
      specs: [
        { label: "Cloth", value: "Two-ply cotton oxford, 140 gsm" },
        { label: "Fit", value: "Regular, slightly shorter tail" },
        { label: "Origin", value: "Cut and sewn in Portugal" },
      ],
      weight: 280,
      variants: ["White", "Sky", "Stripe"].flatMap((color) =>
        ["S", "M", "L", "XL"].map((size) => ({
          sku: `NC-OXF-${color.slice(0, 3).toUpperCase()}-${size}`,
          title: `${color} / ${size}`,
          price: 9800,
          stock: color === "Stripe" && size === "XL" ? 0 : 10 + size.length,
          options: { color, size },
        }))
      ),
    },
    {
      slug: "wide-leg-trouser",
      name: "Wide Leg Wool Trouser",
      short: "High rise, full leg, unfinished hem — tailor to your shoe.",
      description:
        "Cut from a mid-weight tropical wool with enough drape to fall clean and enough tooth to wear in town. The rise is high; the leg is wide without costume. We leave the hem unfinished so your tailor can set it to the shoe you actually wear.",
      categoryId: bottoms.id,
      brandId: brand["north-and-co"]!.id,
      bestseller: true,
      tags: "trousers wool wide-leg tailoring gender:unisex style:tailoring",
      specs: [
        { label: "Cloth", value: "Tropical wool, 260 gsm" },
        { label: "Rise", value: "High" },
        { label: "Hem", value: "Unfinished, 36 inch inseam" },
      ],
      weight: 520,
      variants: ["Charcoal", "Sand"].flatMap((color) =>
        ["28", "30", "32", "34", "36"].map((size) => ({
          sku: `NC-TRW-${color.slice(0, 3).toUpperCase()}-${size}`,
          title: `${color} / ${size}`,
          price: 21000,
          stock: 8,
          options: { color, size },
        }))
      ),
    },
    {
      slug: "heavyweight-tee",
      name: "Heavyweight Cotton Tee",
      short: "9 oz jersey that does not go translucent after a summer.",
      description:
        "Knit from long-staple cotton on a tight 9-ounce jersey. The collar is taped; the hem is slightly curved. It is the shirt we sell most of, because it does the unglamorous work of being worn twice a week.",
      categoryId: shirts.id,
      brandId: brand["north-and-co"]!.id,
      bestseller: true,
      newArrival: true,
      tags: "t-shirt tee cotton basics gender:unisex style:basics",
      specs: [
        { label: "Cloth", value: "9 oz combed cotton jersey" },
        { label: "Fit", value: "Relaxed, not oversized" },
      ],
      weight: 220,
      variants: ["Bone", "Ink", "Cedar", "Rust"].flatMap((color) =>
        ["S", "M", "L", "XL"].map((size) => ({
          sku: `NC-TEE-${color.slice(0, 3).toUpperCase()}-${size}`,
          title: `${color} / ${size}`,
          price: 4200,
          compare: 4800,
          stock: 22,
          options: { color, size },
        }))
      ),
    },
    {
      slug: "field-jacket",
      name: "Waxed Field Jacket",
      short: "English waxed cotton, corozo buttons, a liner you can zip out.",
      description:
        "Millerain waxed cotton, packed enough to shed a day's weather and dry without fuss. The pockets are bellowed and actually hold a book. The liner zips out so the jacket works from October through April. Do not dry-clean; reproof with wax when the sheen goes dull.",
      categoryId: outerwear.id,
      brandId: brand["field-theory"]!.id,
      featured: true,
      tags: "jacket waxed cotton outdoor field gender:unisex style:outdoor",
      specs: [
        { label: "Cloth", value: "8 oz Millerain waxed cotton" },
        { label: "Liner", value: "Removable cotton quilt" },
        { label: "Hardware", value: "Corozo and brass" },
      ],
      weight: 980,
      variants: ["Olive", "Black"].flatMap((color) =>
        ["S", "M", "L", "XL"].map((size) => ({
          sku: `FT-FLD-${color.slice(0, 3).toUpperCase()}-${size}`,
          title: `${color} / ${size}`,
          price: 34000,
          stock: size === "S" ? 3 : 9,
          options: { color, size },
        }))
      ),
    },
    {
      slug: "linen-overshirt",
      name: "Linen Overshirt",
      short: "Heavy Belgian linen, garment-dyed, meant to crease.",
      description:
        "A shirt you wear as a jacket. The linen is a heavier Belgian cloth, garment-dyed so the seams show a little lighter. Creasing is the point. Two chest pockets, a real last button.",
      categoryId: shirts.id,
      brandId: brand["north-and-co"]!.id,
      newArrival: true,
      tags: "linen overshirt layering summer gender:unisex style:layering",
      specs: [
        { label: "Cloth", value: "Belgian linen, 220 gsm" },
        { label: "Dye", value: "Garment dyed" },
      ],
      weight: 360,
      variants: ["Clay", "Sea"].flatMap((color) =>
        ["S", "M", "L", "XL"].map((size) => ({
          sku: `NC-LNO-${color.slice(0, 3).toUpperCase()}-${size}`,
          title: `${color} / ${size}`,
          price: 16500,
          stock: 11,
          options: { color, size },
        }))
      ),
    },
    {
      slug: "cashmere-beanie",
      name: "Cashmere Beanie",
      short: "Four-ply cashmere, a small brim, no logo.",
      description:
        "Knitted in four-ply cashmere so it has weight on the head. The brim is short. There is no badge. It is a winter hat, not a billboard.",
      categoryId: knitwear.id,
      brandId: brand["holm"]!.id,
      tags: "beanie cashmere hat winter gender:unisex style:basics",
      specs: [{ label: "Fiber", value: "100% cashmere" }],
      weight: 90,
      variants: [
        { sku: "HOLM-CAP-CAM", title: "Camel", price: 7800, stock: 20, options: { color: "Camel" } },
        { sku: "HOLM-CAP-FOR", title: "Forest", price: 7800, stock: 14, options: { color: "Forest" } },
        { sku: "HOLM-CAP-INK", title: "Ink", price: 7800, stock: 16, options: { color: "Ink" } },
      ],
    },
    {
      slug: "linen-duvet-set",
      name: "Stonewashed Linen Duvet",
      short: "Stonewashed European flax, a set that gets better in the laundry.",
      description:
        "European flax, woven in Lithuania, stonewashed until the hand is soft enough to sleep under in August. The set includes a duvet cover and two pillowcases. It will wrinkle. That is linen doing its job.",
      categoryId: bedding.id,
      brandId: brand["north-and-co"]!.id,
      featured: true,
      bestseller: true,
      tags: "linen bedding duvet flax",
      specs: [
        { label: "Fiber", value: "100% European flax" },
        { label: "Includes", value: "Duvet cover + 2 pillowcases" },
        { label: "Care", value: "Machine wash cold, low tumble or line dry" },
      ],
      weight: 2100,
      variants: [
        { sku: "NC-DUV-FLX-Q", title: "Flax / Queen", price: 28000, stock: 9, options: { color: "Flax", size: "Queen" } },
        { sku: "NC-DUV-FLX-K", title: "Flax / King", price: 32000, stock: 6, options: { color: "Flax", size: "King" } },
        { sku: "NC-DUV-WHI-Q", title: "White / Queen", price: 28000, stock: 7, options: { color: "White", size: "Queen" } },
        { sku: "NC-DUV-TER-Q", title: "Terracotta / Queen", price: 28000, compare: 32000, stock: 4, options: { color: "Terracotta", size: "Queen" } },
      ],
    },
    {
      slug: "stoneware-set",
      name: "Everyday Stoneware Set",
      short: "Four plates, four bowls. Speckled glaze that hides a life.",
      description:
        "Thrown and glazed in a small kiln in Portugal. The glaze is a speckled oat that does not mind a knife. Microwave and dishwasher are fine; the rim will take a mark if you stack carelessly, which we consider honest.",
      categoryId: table.id,
      brandId: brand["atelier-m"]!.id,
      featured: true,
      tags: "ceramics dinnerware stoneware table",
      specs: [
        { label: "Set", value: "4 dinner plates, 4 bowls" },
        { label: "Clay", value: "High-fire stoneware" },
      ],
      weight: 6400,
      variants: [
        { sku: "AM-STN-OAT", title: "Oat", price: 16000, stock: 12, options: { color: "Oat" } },
        { sku: "AM-STN-INK", title: "Ink", price: 16000, stock: 8, options: { color: "Ink" } },
      ],
    },
    {
      slug: "wool-throw",
      name: "Recycled Wool Throw",
      short: "Mill-end wool, a herringbone, 140 × 200 cm.",
      description:
        "Woven from mill-end wool in a herringbone that reads from across a room. It pills a little in the first weeks; shave it if you mind. 140 by 200 centimeters — a sofa, a bed foot, a picnic that got cold.",
      categoryId: home.id,
      brandId: brand["holm"]!.id,
      tags: "throw blanket wool home",
      specs: [
        { label: "Fiber", value: "Recycled wool blend" },
        { label: "Size", value: "140 × 200 cm" },
      ],
      weight: 900,
      variants: [
        { sku: "HOLM-THR-RUST", title: "Rust herringbone", price: 12000, stock: 15, options: { color: "Rust" } },
        { sku: "HOLM-THR-MOSS", title: "Moss herringbone", price: 12000, stock: 11, options: { color: "Moss" } },
      ],
    },
    {
      slug: "oak-board",
      name: "End-Grain Oak Board",
      short: "American oak, end-grain, a juice groove that actually works.",
      description:
        "End-grain American oak so the knife meets wood the right way. A juice groove deep enough for a roast. Oil it when it looks thirsty. 45 × 30 cm.",
      categoryId: table.id,
      brandId: brand["atelier-m"]!.id,
      tags: "cutting board oak kitchen wood",
      specs: [
        { label: "Wood", value: "American oak, end grain" },
        { label: "Size", value: "45 × 30 × 4 cm" },
      ],
      weight: 2800,
      variants: [{ sku: "AM-OAK-BRD", title: "Oak", price: 14000, stock: 10, options: { color: "Oak" } }],
    },
    {
      slug: "brass-lamp",
      name: "Articulating Brass Lamp",
      short: "A jointed arm, a linen shade, weight in the base.",
      description:
        "Turned brass with a joint that stays where you put it. The shade is linen; the base is heavy enough not to follow the arm. E26, 60W equivalent LED recommended. The brass will tarnish. Leave it, or polish it — both are correct.",
      categoryId: lighting.id,
      brandId: brand["north-and-co"]!.id,
      featured: true,
      newArrival: true,
      tags: "lamp lighting brass desk",
      specs: [
        { label: "Finish", value: "Unlacquered brass" },
        { label: "Shade", value: "Natural linen" },
        { label: "Socket", value: "E26" },
      ],
      weight: 3200,
      variants: [{ sku: "NC-LMP-BRS", title: "Brass", price: 24500, stock: 7, options: { color: "Brass" } }],
    },
    {
      slug: "pour-over-set",
      name: "Ceramic Pour-Over Set",
      short: "Dripper, carafe, and a lid that doubles as a cup rest.",
      description:
        "A cone dripper that sits on a 600 ml carafe, both in the same oat glaze as the dinner plates. The lid is a rest for the kettle or a cup. Paper filters, size 02.",
      categoryId: table.id,
      brandId: brand["atelier-m"]!.id,
      tags: "coffee pour-over ceramic kettle",
      specs: [
        { label: "Volume", value: "600 ml carafe" },
        { label: "Filter", value: "02 paper" },
      ],
      weight: 1100,
      variants: [
        { sku: "AM-PNR-OAT", title: "Oat", price: 7800, stock: 14, options: { color: "Oat" } },
        { sku: "AM-PNR-INK", title: "Ink", price: 7800, stock: 9, options: { color: "Ink" } },
      ],
    },
    {
      slug: "linen-napkins",
      name: "Hemmed Linen Napkins",
      short: "A set of four. They stain; they also outlast paper by a decade.",
      description:
        "Mitered hems, a weight that folds without collapsing. Four napkins, 42 cm. Wash with the duvet.",
      categoryId: table.id,
      brandId: brand["north-and-co"]!.id,
      tags: "napkins linen table",
      specs: [{ label: "Set", value: "4 napkins, 42 × 42 cm" }],
      weight: 240,
      variants: [
        { sku: "NC-NAP-FLX", title: "Flax", price: 4800, stock: 20, options: { color: "Flax" } },
        { sku: "NC-NAP-TER", title: "Terracotta", price: 4800, stock: 12, options: { color: "Terracotta" } },
      ],
    },
    {
      slug: "bergamot-wash",
      name: "Bergamot Hand Wash",
      short: "Cold-pressed bergamot, a pump that does not rattle.",
      description:
        "Castile base, cold-pressed bergamot, a little olive leaf. 350 ml in a glass bottle you will actually refill. The pump is metal.",
      categoryId: beauty.id,
      brandId: brand["kettle-kiln"]!.id,
      bestseller: true,
      tags: "soap hand wash bergamot bathroom",
      specs: [
        { label: "Volume", value: "350 ml" },
        { label: "Scent", value: "Bergamot, olive leaf" },
      ],
      weight: 520,
      variants: [{ sku: "KK-HW-BRG", title: "350 ml", price: 2800, stock: 40, options: { size: "350ml" } }],
    },
    {
      slug: "face-oil",
      name: "Restorative Face Oil",
      short: "Squalane, rosehip, a dropper that meters.",
      description:
        "A short list: squalane, rosehip, jojoba, a little vitamin E. No perfume. Use three drops on damp skin. 30 ml.",
      categoryId: beauty.id,
      brandId: brand["kettle-kiln"]!.id,
      newArrival: true,
      tags: "skincare face oil squalane",
      specs: [
        { label: "Volume", value: "30 ml" },
        { label: "Texture", value: "Dry oil" },
      ],
      weight: 90,
      variants: [{ sku: "KK-OIL-30", title: "30 ml", price: 4200, stock: 24, options: { size: "30ml" } }],
    },
    {
      slug: "soap-set",
      name: "Unscented Soap Trio",
      short: "Olive oil, no perfume, three bars in brown board.",
      description:
        "A high-olive bar that does not strip hands or sink. Unscented on purpose. Three 120 g bars.",
      categoryId: beauty.id,
      brandId: brand["kettle-kiln"]!.id,
      tags: "soap unscented olive",
      specs: [{ label: "Set", value: "3 × 120 g" }],
      weight: 400,
      variants: [{ sku: "KK-SOP-3", title: "Trio", price: 2200, stock: 30, options: {} }],
    },
    {
      slug: "daily-spf",
      name: "Daily Mineral SPF",
      short: "Zinc, no white cast on most skin, 50 ml.",
      description:
        "Non-nano zinc, a fluid that sits under the face oil or instead of it. SPF 30. 50 ml. Reapply if you are actually outside.",
      categoryId: beauty.id,
      brandId: brand["kettle-kiln"]!.id,
      tags: "spf sunscreen zinc mineral",
      specs: [
        { label: "SPF", value: "30, mineral" },
        { label: "Volume", value: "50 ml" },
      ],
      weight: 80,
      variants: [{ sku: "KK-SPF-50", title: "50 ml", price: 3200, stock: 18, options: { size: "50ml" } }],
    },
    {
      slug: "leather-belt",
      name: "Vegetable-Tanned Belt",
      short: "A single piece of hide, a solid brass buckle, no lining.",
      description:
        "Vegetable-tanned bridle, cut as a single strap. The brass buckle will dull. The leather will take your shape at the holes you actually use. 32 mm width.",
      categoryId: accessories.id,
      brandId: brand["field-theory"]!.id,
      tags: "belt leather brass",
      specs: [
        { label: "Leather", value: "Vegetable-tanned bridle" },
        { label: "Width", value: "32 mm" },
      ],
      weight: 220,
      variants: ["80", "85", "90", "95", "100", "105"].map((size) => ({
        sku: `FT-BLT-TAN-${size}`,
        title: `Tan / ${size} cm`,
        price: 9800,
        stock: 6,
        options: { color: "Tan", size: `${size}cm` },
      })),
    },
    {
      slug: "canvas-tote",
      name: "Heavy Canvas Tote",
      short: "24 oz canvas, a leather grip, a base that sits flat.",
      description:
        "Canvas heavy enough to stand. A leather grip that does not cut the hand on the walk home. Interior pocket for keys. Holds a day's groceries or a laptop and a book.",
      categoryId: accessories.id,
      brandId: brand["field-theory"]!.id,
      featured: true,
      bestseller: true,
      tags: "tote bag canvas leather carry",
      specs: [
        { label: "Cloth", value: "24 oz cotton canvas" },
        { label: "Size", value: "40 × 35 × 16 cm" },
      ],
      weight: 640,
      variants: [
        { sku: "FT-TOT-NAT", title: "Natural", price: 6800, stock: 18, options: { color: "Natural" } },
        { sku: "FT-TOT-INK", title: "Ink", price: 6800, stock: 12, options: { color: "Ink" } },
      ],
    },
    {
      slug: "card-case",
      name: "Leather Card Case",
      short: "Four cards, a note, a pocket that wears a patina.",
      description:
        "A four-card case in the same bridle as the belt. No snap. It will darken at the corners in a month.",
      categoryId: accessories.id,
      brandId: brand["field-theory"]!.id,
      tags: "wallet card case leather",
      specs: [{ label: "Capacity", value: "4 cards + folded notes" }],
      weight: 50,
      variants: [
        { sku: "FT-CRD-TAN", title: "Tan", price: 5400, stock: 16, options: { color: "Tan" } },
        { sku: "FT-CRD-BLK", title: "Black", price: 5400, stock: 10, options: { color: "Black" } },
      ],
    },
    {
      slug: "silk-scarf",
      name: "Printed Silk Scarf",
      short: "A 90 cm square, a map of the Hudson in winter.",
      description:
        "Twill silk, 90 cm, hand-rolled edges. The print is a winter chart of the Hudson — more useful as color than as navigation.",
      categoryId: accessories.id,
      brandId: brand["north-and-co"]!.id,
      newArrival: true,
      tags: "scarf silk print gender:women style:print",
      specs: [
        { label: "Cloth", value: "Silk twill" },
        { label: "Size", value: "90 × 90 cm" },
      ],
      weight: 60,
      variants: [{ sku: "NC-SCF-HUD", title: "Hudson winter", price: 12000, stock: 9, options: { color: "Hudson" } }],
    },
    {
      slug: "sunglasses",
      name: "Acetate Sunglasses",
      short: "Italian acetate, CR-39 lenses, a shape that is not this year.",
      description:
        "Mazzucchelli acetate, CR-39 lenses, UV400. A slightly square shape that does not announce a season. Case included.",
      categoryId: accessories.id,
      brandId: brand["north-and-co"]!.id,
      tags: "sunglasses acetate eyewear",
      specs: [
        { label: "Frame", value: "Italian acetate" },
        { label: "Lens", value: "CR-39, UV400" },
      ],
      weight: 40,
      variants: [
        { sku: "NC-SUN-TOR", title: "Tortoise", price: 16000, stock: 8, options: { color: "Tortoise" } },
        { sku: "NC-SUN-BLK", title: "Black", price: 16000, stock: 8, options: { color: "Black" } },
      ],
    },
    {
      slug: "daypack",
      name: "22L Daypack",
      short: "Waxed canvas, a laptop sleeve, straps that do not cut.",
      description:
        "22 liters — a day, not a move. Waxed canvas body, cotton webbing, a padded 15-inch sleeve. The top closes with a flap and a brass buckle you can work in gloves.",
      categoryId: outdoor.id,
      brandId: brand["field-theory"]!.id,
      featured: true,
      tags: "backpack daypack outdoor canvas",
      specs: [
        { label: "Volume", value: "22 liters" },
        { label: "Laptop", value: "Padded 15-inch sleeve" },
      ],
      weight: 980,
      variants: [
        { sku: "FT-DPK-OLV", title: "Olive", price: 18000, stock: 11, options: { color: "Olive" } },
        { sku: "FT-DPK-NAV", title: "Navy", price: 18000, stock: 7, options: { color: "Navy" } },
      ],
    },
    {
      slug: "insulated-bottle",
      name: "Double-Wall Bottle",
      short: "18/8 steel, 750 ml, a cap you can fill from.",
      description:
        "Double-wall 18/8, 750 ml, keeps coffee hot through a morning and water cold through an afternoon. The cap is a cup. No straw theater.",
      categoryId: outdoor.id,
      brandId: brand["field-theory"]!.id,
      bestseller: true,
      tags: "bottle steel insulated",
      specs: [
        { label: "Volume", value: "750 ml" },
        { label: "Steel", value: "18/8 double wall" },
      ],
      weight: 380,
      variants: [
        { sku: "FT-BTL-STL", title: "Steel", price: 3800, stock: 28, options: { color: "Steel" } },
        { sku: "FT-BTL-OLV", title: "Olive", price: 3800, stock: 16, options: { color: "Olive" } },
      ],
    },
    {
      slug: "waxed-duffle",
      name: "Weekend Duffle",
      short: "45 liters, a shoulder strap, a shoe pocket you will use.",
      description:
        "45 liters of waxed canvas with a zip-out shoe pocket and a strap that sits on the shoulder without sliding. Cabin-honest on most airlines if you pack like an adult.",
      categoryId: outdoor.id,
      brandId: brand["field-theory"]!.id,
      tags: "duffle bag travel weekend",
      specs: [{ label: "Volume", value: "45 liters" }],
      weight: 1400,
      variants: [
        { sku: "FT-DFL-OLV", title: "Olive", price: 22000, stock: 6, options: { color: "Olive" } },
        { sku: "FT-DFL-TAN", title: "Tan", price: 22000, stock: 5, options: { color: "Tan" } },
      ],
    },
    {
      slug: "merino-socks",
      name: "Merino Trail Socks",
      short: "A three-pack. Cushioned sole, no pageantry.",
      description:
        "Merino-nylon that does the trail and the office. Cushioned sole, stay-up cuff. Three pairs.",
      categoryId: accessories.id,
      brandId: brand["holm"]!.id,
      tags: "socks merino trail pack gender:unisex style:basics",
      specs: [{ label: "Pack", value: "3 pairs" }],
      weight: 180,
      variants: ["S", "M", "L"].map((size) => ({
        sku: `HOLM-SOX-${size}`,
        title: size,
        price: 3600,
        stock: 20,
        options: { size },
      })),
    },
    {
      slug: "desk-clock",
      name: "Analog Desk Clock",
      short: "A quiet quartz, a brass case, no alarm.",
      description:
        "Quartz, deliberately quiet. A small brass case that tarnishes with the lamp. No alarm — that is what the kitchen is for.",
      categoryId: objects.id,
      brandId: brand["north-and-co"]!.id,
      featured: true,
      tags: "clock desk brass analog",
      specs: [
        { label: "Movement", value: "Quiet quartz" },
        { label: "Case", value: "Brass" },
      ],
      weight: 320,
      variants: [{ sku: "NC-CLK-BRS", title: "Brass", price: 8900, stock: 10, options: { color: "Brass" } }],
    },
    {
      slug: "fountain-pen",
      name: "Brass Fountain Pen",
      short: "A cartridge/converter, a steel nib that is not scratchy.",
      description:
        "Turned brass, a steel fine nib, cartridge or converter. It will patina in the pocket. Ink not included; start with a blue-black.",
      categoryId: objects.id,
      brandId: brand["north-and-co"]!.id,
      newArrival: true,
      tags: "pen fountain brass writing",
      specs: [
        { label: "Nib", value: "Steel, fine" },
        { label: "Fill", value: "Cartridge / converter" },
      ],
      weight: 40,
      variants: [{ sku: "NC-PEN-BRS", title: "Brass / Fine", price: 6400, stock: 14, options: { color: "Brass" } }],
    },
    {
      slug: "linen-notebook",
      name: "Clothbound Notebook",
      short: "A5, 120 gsm, a linen cover the color of the duvet.",
      description:
        "A5, 192 pages, 120 gsm cream, a linen cover in flax. Lies reasonably flat. Numbered contents page, nothing else printed.",
      categoryId: objects.id,
      brandId: brand["north-and-co"]!.id,
      tags: "notebook paper linen journal",
      specs: [
        { label: "Size", value: "A5" },
        { label: "Paper", value: "120 gsm cream" },
      ],
      weight: 280,
      variants: [
        { sku: "NC-NTB-FLX", title: "Flax", price: 2400, stock: 30, options: { color: "Flax" } },
        { sku: "NC-NTB-INK", title: "Ink", price: 2400, stock: 22, options: { color: "Ink" } },
      ],
    },
    {
      slug: "charger-tray",
      name: "Valet Charging Tray",
      short: "Oak tray, a hidden 15W coil, a place for keys.",
      description:
        "An oak valet with a 15W Qi coil under the well. Keys, a phone, a card case. Cable out the back. Not a gadget that looks like a gadget.",
      categoryId: objects.id,
      brandId: brand["north-and-co"]!.id,
      tags: "charger valet oak desk qi",
      specs: [
        { label: "Charge", value: "15W Qi" },
        { label: "Wood", value: "Oak" },
      ],
      weight: 600,
      variants: [{ sku: "NC-VLT-OAK", title: "Oak", price: 9800, stock: 9, options: { color: "Oak" } }],
    },
    {
      slug: "cedar-candle",
      name: "Cedar & Smoke Candle",
      short: "Soy wax, a 55-hour burn, a scent that does not announce itself.",
      description:
        "Soy wax in a brown glass. Cedar, a little smoke, a little vetiver. 55 hours if you trim the wick. When it is gone, the glass is a tumbler.",
      categoryId: objects.id,
      brandId: brand["kettle-kiln"]!.id,
      bestseller: true,
      tags: "candle cedar soy home scent",
      specs: [
        { label: "Wax", value: "Soy" },
        { label: "Burn", value: "≈ 55 hours" },
      ],
      weight: 420,
      variants: [{ sku: "KK-CND-CDR", title: "220 g", price: 3600, stock: 26, options: { size: "220g" } }],
    },
    {
      slug: "merino-polo",
      name: "Fine Merino Polo",
      short: "18-micron polo, a collar that sits, no logo.",
      description:
        "The same extrafine merino as the crewneck, with a short placket and a collar that does not collapse after a wash.",
      categoryId: knitwear.id,
      brandId: brand["holm"]!.id,
      featured: true,
      newArrival: true,
      tags: "polo merino knit gender:unisex style:minimal",
      specs: [
        { label: "Fiber", value: "100% extrafine merino, 18 micron" },
        { label: "Fit", value: "Regular. True to size." },
        { label: "Stretch", value: "Natural merino give" },
        { label: "Model", value: "178 cm wearing M" },
        { label: "Chest (M, laid flat)", value: "52 cm" },
        { label: "Length (M)", value: "70 cm" },
      ],
      weight: 280,
      variants: ["Oat", "Navy", "Ink"].flatMap((color) =>
        ["S", "M", "L", "XL"].map((size) => ({
          sku: `HOLM-PLO-${color.slice(0, 3).toUpperCase()}-${size}`,
          title: `${color} / ${size}`,
          price: 16500,
          stock: 10,
          options: { color, size },
        }))
      ),
    },
    {
      slug: "french-terry-hoodie",
      name: "Heavy French Terry Hoodie",
      short: "Loopback terry that does not bag at the pocket.",
      description:
        "A hoodie with weight. Cotton french terry, a kangaroo pocket that holds a book, rib that recovers.",
      categoryId: shirts.id,
      brandId: brand["north-and-co"]!.id,
      newArrival: true,
      tags: "hoodie sweatshirt cotton gender:unisex style:basics",
      specs: [
        { label: "Cloth", value: "Cotton french terry, 420 gsm" },
        { label: "Fit", value: "Relaxed, not oversized. Size down if you want trim." },
        { label: "Stretch", value: "Rib only" },
        { label: "Model", value: "178 cm wearing M" },
        { label: "Chest (M, laid flat)", value: "58 cm" },
      ],
      weight: 640,
      variants: ["Ink", "Oat"].flatMap((color) =>
        ["S", "M", "L", "XL"].map((size) => ({
          sku: `NC-HDY-${color.slice(0, 3).toUpperCase()}-${size}`,
          title: `${color} / ${size}`,
          price: 12800,
          stock: 14,
          options: { color, size },
        }))
      ),
    },
    {
      slug: "wool-overcoat",
      name: "Charcoal Wool Overcoat",
      short: "A proper coat. Horn buttons, a throat latch, unfinished sleeve.",
      description:
        "Mid-weight wool, a clean chest, enough shoulder to sit over a knit. We leave the sleeve unfinished so your tailor can set it.",
      categoryId: coats.id,
      brandId: brand["north-and-co"]!.id,
      featured: true,
      newArrival: true,
      tags: "coat overcoat wool gender:unisex style:minimal",
      specs: [
        { label: "Cloth", value: "Wool, 480 gsm" },
        { label: "Fit", value: "Regular over a knit. Size up over a jacket." },
        { label: "Stretch", value: "None" },
        { label: "Model", value: "178 cm wearing M" },
        { label: "Chest (M, laid flat)", value: "56 cm" },
        { label: "Length (M)", value: "108 cm" },
      ],
      weight: 1400,
      variants: ["Charcoal", "Navy"].flatMap((color) =>
        ["S", "M", "L", "XL"].map((size) => ({
          sku: `NC-OVC-${color.slice(0, 3).toUpperCase()}-${size}`,
          title: `${color} / ${size}`,
          price: 42000,
          stock: 6,
          options: { color, size },
        }))
      ),
    },
    {
      slug: "cotton-chino",
      name: "Cotton Twill Chino",
      short: "A khaki that is actually khaki. Unfinished hem.",
      description:
        "Mid-weight cotton twill, a clean front, enough room to sit. We leave the hem unfinished so your tailor can set it to the loafer or the trainer.",
      categoryId: bottoms.id,
      brandId: brand["north-and-co"]!.id,
      newArrival: true,
      tags: "chino trousers cotton khaki gender:unisex style:workwear",
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
      categoryId: shirts.id,
      brandId: brand["north-and-co"]!.id,
      featured: true,
      newArrival: true,
      tags: "overshirt jacket cotton layering gender:unisex style:workwear",
      specs: [
        { label: "Cloth", value: "Cotton canvas, 340 gsm" },
        { label: "Fit", value: "Regular over a tee. Size up over a knit." },
        { label: "Stretch", value: "None" },
        { label: "Model", value: "178 cm wearing M" },
        { label: "Chest (M, laid flat)", value: "57 cm" },
      ],
      weight: 720,
      variants: ["Oat", "Ink"].flatMap((color) =>
        ["S", "M", "L", "XL"].map((size) => ({
          sku: `NC-SHJ-${color.slice(0, 3).toUpperCase()}-${size}`,
          title: `${color} / ${size}`,
          price: 18500,
          stock: 8,
          options: { color, size },
        }))
      ),
    },
    {
      slug: "silk-slip-dress",
      name: "Bias Silk Slip Dress",
      short: "Charmeuse that hangs. Thin straps, a bias cut, no lining theater.",
      description:
        "Silk charmeuse, cut on the bias so it follows the body without a zipper fight. Wear it alone or under the overcoat. Hand wash cold.",
      categoryId: dresses.id,
      brandId: brand["north-and-co"]!.id,
      featured: true,
      newArrival: true,
      tags: "dress silk slip evening gender:women style:minimal",
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
      categoryId: accessories.id,
      brandId: brand["field-theory"]!.id,
      newArrival: true,
      tags: "loafer shoes leather gender:unisex style:tailoring",
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
      description:
        "Boiled wool that does not itch at the neck. Charcoal or oat. Long enough to wrap once. No logo.",
      categoryId: accessories.id,
      brandId: brand["holm"]!.id,
      tags: "scarf wool winter gender:unisex style:minimal",
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

  const createdProducts = [];
  const retire = new Set<string>(RETIRE_SLUGS);
  for (const p of catalog) {
    if (retire.has(p.slug)) continue;
    const prod = await prisma.product.create({
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
        brandId: p.brandId,
        categoryId: p.categoryId,
        videoUrl: p.videoUrl,
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
    createdProducts.push(prod);
  }

  const catBySlug: Record<string, string> = {
    knitwear: knitwear.id,
    shirts: shirts.id,
    outerwear: outerwear.id,
    bottoms: bottoms.id,
    coats: coats.id,
    dresses: dresses.id,
    skirts: skirts.id,
    accessories: accessories.id,
  };
  for (const p of CLOTHES_EXTRA) {
    const categoryId = catBySlug[p.categorySlug];
    const brandId = brand[p.brandSlug]?.id;
    if (!categoryId || !brandId) continue;
    const prod = await prisma.product.create({
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
        brandId,
        categoryId,
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
    createdProducts.push(prod);
  }

  const bySlug = Object.fromEntries(createdProducts.map((p) => [p.slug, p]));
  const rel = async (from: string, to: string, kind: string) => {
    if (bySlug[from] && bySlug[to]) {
      await prisma.productRelation.create({
        data: { productId: bySlug[from]!.id, relatedId: bySlug[to]!.id, kind },
      });
    }
  };
  await rel("merino-crewneck", "wide-leg-trouser", "related");
  await rel("merino-crewneck", "washed-oxford-shirt", "related");
  await rel("merino-crewneck", "cashmere-beanie", "fbt");
  await rel("heavyweight-tee", "wide-leg-trouser", "related");
  await rel("heavyweight-tee", "wide-leg-jean", "fbt");
  await rel("field-jacket", "denim-jacket", "related");
  await rel("field-jacket", "merino-socks", "fbt");
  await rel("trench-coat", "wool-blazer", "related");
  await rel("trench-coat", "cashmere-turtleneck", "fbt");
  await rel("wool-blazer", "pleated-trouser", "related");
  await rel("wool-blazer", "cotton-poplin-shirt", "fbt");
  await rel("knit-midi-dress", "leather-loafer", "fbt");
  await rel("pleated-midi-skirt", "silk-blouse", "fbt");
  await rel("wide-leg-jean", "denim-jacket", "related");
  await rel("cable-cardigan", "cotton-chino", "related");
  await rel("merino-polo", "wide-leg-trouser", "related");
  await rel("merino-polo", "wool-overcoat", "fbt");
  await rel("wool-overcoat", "merino-crewneck", "related");
  await rel("french-terry-hoodie", "wide-leg-jean", "fbt");
  await rel("cotton-chino", "merino-polo", "related");
  await rel("shirt-jacket", "cotton-chino", "fbt");
  await rel("silk-slip-dress", "boiled-wool-scarf", "fbt");
  await rel("leather-loafer", "wide-leg-trouser", "related");
  await rel("silk-slip-dress", "wool-overcoat", "related");

  const reviewers = [
    { name: "Amira K.", email: "amira.k@example.com", rating: 5, title: "The sweater I wear on purpose", body: "Bought the oat crewneck in M. It does not itch, which is the whole review. Washed once, dried flat, still looks new." },
    { name: "James P.", email: "james.p@example.com", rating: 4, title: "Jacket that actually sheds rain", body: "Wore the olive field jacket through a wet week in Glasgow. Sleeves a touch long on me; otherwise the real thing." },
    { name: "Sana R.", email: "sana.r@example.com", rating: 5, title: "The trench that sheds", body: "Stone trench in M. Belt sits. Wore it through a wet week. Not costume." },
    { name: "Owen L.", email: "owen.l@example.com", rating: 5, title: "Jean replaced two cheaper pairs", body: "Wide leg, high rise. Unfinished hem to the loafer. Indigo already fading at the thigh." },
    { name: "Hina M.", email: "hina.m@example.com", rating: 4, title: "Blazer over a knit", body: "Navy unstructured. Shoulder does not fight the crewneck. Sleeve to the tailor." },
    { name: "Theo B.", email: "theo.b@example.com", rating: 5, title: "Oxford after two washes", body: "Sky color, size L. Collar sits. This is the shirt I should have owned ten years ago." },
  ];

  const reviewTargets = [
    "merino-crewneck",
    "field-jacket",
    "trench-coat",
    "wide-leg-jean",
    "wool-blazer",
    "washed-oxford-shirt",
    "heavyweight-tee",
    "cashmere-turtleneck",
    "pleated-midi-skirt",
    "denim-jacket",
  ];
  let ri = 0;
  for (const slug of reviewTargets) {
    const p = bySlug[slug];
    if (!p) continue;
    const r = reviewers[ri % reviewers.length]!;
    await prisma.review.create({
      data: {
        productId: p.id,
        authorName: r.name,
        authorEmail: r.email,
        rating: r.rating,
        title: r.title,
        body: r.body,
        status: "APPROVED",
        verified: true,
        helpful: 3 + (ri % 8),
      },
    });
    ri++;
  }

  await prisma.coupon.createMany({
    data: [
      {
        code: "WELCOME10",
        type: CouponType.PERCENT,
        value: 10,
        minOrderCents: 0,
        firstOrderOnly: true,
        usageLimit: 5000,
        isActive: true,
      },
      {
        code: "FREESHIP",
        type: CouponType.FREE_SHIPPING,
        value: 0,
        minOrderCents: 7500,
        isActive: true,
      },
      {
        code: "SAVE25",
        type: CouponType.FIXED,
        value: 2500,
        minOrderCents: 15000,
        isActive: true,
      },
      {
        code: "KNIT15",
        type: CouponType.CATEGORY,
        value: 15,
        categoryIds: JSON.stringify([knitwear.id, dresses.id]),
        isActive: true,
      },
      {
        code: "TEE3",
        type: CouponType.BUY_X_GET_Y,
        value: 0,
        buyX: 2,
        getY: 1,
        productIds: JSON.stringify([bySlug["heavyweight-tee"]!.id]),
        isActive: true,
      },
    ],
  });

  const us = await prisma.shippingZone.create({
    data: { name: "United States", countries: JSON.stringify(["US"]) },
  });
  const ca = await prisma.shippingZone.create({
    data: { name: "Canada", countries: JSON.stringify(["CA"]) },
  });
  const pk = await prisma.shippingZone.create({
    data: { name: "Pakistan", countries: JSON.stringify(["PK"]) },
  });
  const world = await prisma.shippingZone.create({
    data: { name: "Rest of world", countries: JSON.stringify(["*"]) },
  });

  await prisma.shippingMethod.createMany({
    data: [
      { zoneId: us.id, name: "Standard (5–7 days)", code: "standard", rateCents: 800, freeAboveCents: 7500, minDays: 5, maxDays: 8 },
      { zoneId: us.id, name: "Express (2–3 days)", code: "express", rateCents: 1800, minDays: 2, maxDays: 3 },
      { zoneId: us.id, name: "Local pickup", code: "pickup", rateCents: 0, minDays: 1, maxDays: 2 },
      { zoneId: ca.id, name: "Tracked parcel", code: "standard", rateCents: 1600, freeAboveCents: 15000, minDays: 6, maxDays: 10 },
      { zoneId: pk.id, name: "Tracked international", code: "standard", rateCents: 2200, minDays: 8, maxDays: 14 },
      { zoneId: pk.id, name: "Karachi local delivery", code: "local", rateCents: 400, minDays: 2, maxDays: 4 },
      { zoneId: world.id, name: "International tracked", code: "standard", rateCents: 2800, minDays: 8, maxDays: 16 },
    ],
  });

  await prisma.cmsPage.createMany({
    data: CMS_PAGES.map((p) => ({
      slug: p.slug,
      title: p.title,
      seoTitle: p.seoTitle || null,
      content: p.content,
    })),
  });

  await prisma.faq.createMany({
    data: FAQ_SEED,
  });

  await prisma.banner.createMany({
    data: [
      {
        title: "Fall cloth is in.",
        subtitle: "Merino, waxed cotton, unfinished hems.",
        href: "/shop?category=apparel",
        position: "home-hero",
        image: "/images/banners/hero.jpg",
        sortOrder: 0,
      },
      {
        title: "A trench that is actually a trench",
        subtitle: "Gabardine, a belt that ties, unfinished sleeve.",
        href: "/product/trench-coat",
        position: "home-split",
        image: "/images/banners/linen.jpg",
        sortOrder: 1,
      },
      {
        title: "Guest checkout. Rapid or cash on delivery.",
        subtitle: "No accounts. Keep your order number.",
        href: "/shop",
        position: "home-strip",
        sortOrder: 2,
      },
    ],
  });

  await prisma.navigationItem.createMany({
    data: [
      { location: "header", label: "Shop", href: "/shop", sortOrder: 1 },
      { location: "header", label: "Apparel", href: "/shop?category=apparel", sortOrder: 2 },
      { location: "header", label: "Dresses", href: "/shop?category=dresses", sortOrder: 3 },
      { location: "header", label: "Lookbooks", href: "/lookbook", sortOrder: 4 },
      { location: "header", label: "Outerwear", href: "/shop?category=outerwear", sortOrder: 5 },
      { location: "footer", label: "About", href: "/about", sortOrder: 1 },
      { location: "footer", label: "Shipping", href: "/shipping", sortOrder: 2 },
      { location: "footer", label: "Returns", href: "/returns", sortOrder: 3 },
      { location: "footer", label: "Privacy", href: "/privacy", sortOrder: 4 },
      { location: "footer", label: "Terms", href: "/terms", sortOrder: 5 },
      { location: "footer", label: "Contact", href: "/contact", sortOrder: 6 },
      { location: "footer", label: "Track order", href: "/track", sortOrder: 7 },
      { location: "footer", label: "FAQs", href: "/faq", sortOrder: 8 },
    ],
  });

  await prisma.setting.createMany({
    data: [
      {
        key: "store",
        value: JSON.stringify({
          name: "NORTH & CO.",
          tagline: "Cloth for a considered life",
          email: "spideyspider112786@gmail.com",
          phone: "",
          address: "",
          currency: "usd",
          timezone: "Asia/Karachi",
          country: "PK",
          logo: "",
        }),
      },
      { key: "payments", value: JSON.stringify({ rapidEnabled: true, codEnabled: true }) },
      { key: "tax", value: JSON.stringify({ rateBps: 0 }) },
      {
        key: "seo",
        value: JSON.stringify({
          title: "NORTH & CO. — Cloth for a considered life",
          description:
            "Apparel cut to last. Guest checkout. No customer accounts.",
          ogImage: "/images/og.jpg",
        }),
      },
      { key: "returns", value: JSON.stringify({ windowDays: 30 }) },
    ],
  });

  await prisma.counter.create({ data: { key: "order", value: 1040 } });

  console.log(`Seeded ${createdProducts.length} products.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
