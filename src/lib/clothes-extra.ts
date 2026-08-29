/** Clothing that replaces home, beauty, outdoor, and object SKUs. */

export const RETIRE_SLUGS = [
  "linen-duvet-set",
  "stoneware-set",
  "wool-throw",
  "oak-board",
  "brass-lamp",
  "pour-over-set",
  "linen-napkins",
  "bergamot-wash",
  "face-oil",
  "soap-set",
  "daily-spf",
  "canvas-tote",
  "card-case",
  "daypack",
  "insulated-bottle",
  "waxed-duffle",
  "desk-clock",
  "fountain-pen",
  "linen-notebook",
  "charger-tray",
  "cedar-candle",
] as const;

export type ExtraVariant = {
  sku: string;
  title: string;
  price: number;
  compare?: number;
  stock: number;
  options: Record<string, string>;
};

export type ExtraProduct = {
  slug: string;
  name: string;
  short: string;
  description: string;
  categorySlug: string;
  brandSlug: string;
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  tags: string;
  specs: { label: string; value: string }[];
  weight: number;
  variants: ExtraVariant[];
};

export function sized(colors: string[], skuBase: string, price: number, stock: number, compare?: number): ExtraVariant[] {
  return colors.flatMap((color) =>
    ["S", "M", "L", "XL"].map((size) => ({
      sku: `${skuBase}-${color.slice(0, 3).toUpperCase()}-${size}`,
      title: `${color} / ${size}`,
      price,
      compare,
      stock,
      options: { color, size },
    }))
  );
}

function waists(colors: string[], skuBase: string, price: number, stock: number, sizes = ["28", "30", "32", "34", "36"]): ExtraVariant[] {
  return colors.flatMap((color) =>
    sizes.map((size) => ({
      sku: `${skuBase}-${color.slice(0, 3).toUpperCase()}-${size}`,
      title: `${color} / ${size}`,
      price,
      stock,
      options: { color, size },
    }))
  );
}

function dresses(colors: string[], skuBase: string, price: number, stock: number): ExtraVariant[] {
  return colors.flatMap((color) =>
    ["XS", "S", "M", "L"].map((size) => ({
      sku: `${skuBase}-${color.slice(0, 3).toUpperCase()}-${size}`,
      title: `${color} / ${size}`,
      price,
      stock,
      options: { color, size },
    }))
  );
}

export const CLOTHES_EXTRA: ExtraProduct[] = [
  {
    slug: "cashmere-turtleneck",
    name: "Four-Ply Cashmere Turtleneck",
    short: "A quiet roll neck. Four-ply, no logo, no itch.",
    description:
      "Spun in four-ply cashmere so the roll sits without collapsing. Wear it alone or under the overcoat. Hand wash cold, dry flat. It is a winter knit, not a costume.",
    categorySlug: "knitwear",
    brandSlug: "holm",
    featured: true,
    tags: "turtleneck cashmere knit winter gender:unisex style:minimal",
    specs: [
      { label: "Fiber", value: "100% cashmere, four-ply" },
      { label: "Fit", value: "Regular. True to size." },
      { label: "Care", value: "Hand wash cold, dry flat" },
      { label: "Model", value: "178 cm wearing M" },
    ],
    weight: 380,
    variants: sized(["Oat", "Navy", "Black"], "HOLM-TTL", 24500, 8),
  },
  {
    slug: "wool-blazer",
    name: "Unstructured Wool Blazer",
    short: "Soft shoulder, two buttons, a chest that does not fight you.",
    description:
      "Mid-weight wool, an unpadded shoulder, a two-button front. Cut to wear over a knit without looking borrowed. We leave the sleeve unfinished so your tailor can set it.",
    categorySlug: "outerwear",
    brandSlug: "north-and-co",
    featured: true,
    tags: "blazer jacket wool tailoring gender:unisex style:tailoring",
    specs: [
      { label: "Cloth", value: "Wool, 280 gsm" },
      { label: "Fit", value: "Regular over a shirt. Size up over a knit." },
      { label: "Shoulder", value: "Unstructured" },
    ],
    weight: 720,
    variants: sized(["Navy", "Charcoal"], "NC-BLZ", 38500, 6),
  },
  {
    slug: "cable-cardigan",
    name: "Cable Knit Cardigan",
    short: "A five-button cardigan with a cable that actually holds.",
    description:
      "Lambswool cable, a shawl-less crew neck, corozo buttons. Wear it closed as a sweater or open over the oxford. It is dense enough for October.",
    categorySlug: "knitwear",
    brandSlug: "holm",
    bestseller: true,
    tags: "cardigan cable knit lambswool gender:unisex style:minimal",
    specs: [
      { label: "Fiber", value: "Lambswool" },
      { label: "Fit", value: "Regular. Size up for layering." },
    ],
    weight: 540,
    variants: sized(["Oat", "Forest", "Navy"], "HOLM-CDG", 19500, 9),
  },
  {
    slug: "linen-shirt-dress",
    name: "Linen Shirt Dress",
    short: "A dress that is also a shirt. Belted, garment-dyed, meant to crease.",
    description:
      "Belgian linen, a hidden button placket, a belt you can lose. Wear it alone or over the ribbed tank. Creasing is the point. Machine wash cold.",
    categorySlug: "dresses",
    brandSlug: "north-and-co",
    newArrival: true,
    tags: "dress linen shirt-dress summer gender:women style:minimal",
    specs: [
      { label: "Cloth", value: "Belgian linen, 180 gsm" },
      { label: "Fit", value: "Relaxed. Belt to shape." },
      { label: "Length (S)", value: "110 cm" },
    ],
    weight: 320,
    variants: dresses(["Clay", "White", "Ink"], "NC-LSD", 16800, 8),
  },
  {
    slug: "trench-coat",
    name: "Cotton Gabardine Trench",
    short: "A proper trench. Storm flap, gun flap, a belt that ties.",
    description:
      "Cotton gabardine that sheds a day's weather. Double-breasted, a storm flap, a belt you can knot or buckle. Lined through the body. Do not dry-clean into oblivion — hang it.",
    categorySlug: "coats",
    brandSlug: "field-theory",
    featured: true,
    newArrival: true,
    tags: "trench coat gabardine rain gender:unisex style:tailoring",
    specs: [
      { label: "Cloth", value: "Cotton gabardine" },
      { label: "Fit", value: "Regular over a blazer. Size up over a knit." },
      { label: "Length (M)", value: "112 cm" },
    ],
    weight: 1100,
    variants: sized(["Stone", "Navy"], "FT-TRN", 42000, 5),
  },
  {
    slug: "silk-blouse",
    name: "Charmeuse Silk Blouse",
    short: "A hidden placket, a soft collar, silk that hangs.",
    description:
      "Silk charmeuse, a collar that sits without starch, a placket that does not gape. Tucked into the pleated trouser or worn loose over the skirt. Hand wash cold.",
    categorySlug: "shirts",
    brandSlug: "north-and-co",
    tags: "blouse silk shirt gender:women style:minimal",
    specs: [
      { label: "Cloth", value: "Silk charmeuse" },
      { label: "Fit", value: "Regular. True to size." },
    ],
    weight: 140,
    variants: sized(["Ivory", "Ink", "Rust"], "NC-SLB", 17500, 7),
  },
  {
    slug: "ribbed-tank",
    name: "Fine Rib Tank",
    short: "A tank with enough rib to hold its line.",
    description:
      "Fine-gauge cotton rib, a square-enough neck, straps that do not twist. Wear it under the overshirt or alone in heat. It is a layer, not a slogan.",
    categorySlug: "shirts",
    brandSlug: "north-and-co",
    bestseller: true,
    tags: "tank top rib cotton basics gender:unisex style:basics",
    specs: [
      { label: "Cloth", value: "Cotton rib, 180 gsm" },
      { label: "Fit", value: "Close but not compressed." },
    ],
    weight: 90,
    variants: sized(["Bone", "Ink", "Oat"], "NC-TNK", 4800, 18),
  },
  {
    slug: "pleated-midi-skirt",
    name: "Pleated Midi Skirt",
    short: "Knife pleats, a midi length, a waist that sits.",
    description:
      "Pressed pleats in a mid-weight viscose-wool that moves without clinging. Midi — not costume long, not office short. Side zip. Wear it with the turtleneck or the tank.",
    categorySlug: "skirts",
    brandSlug: "north-and-co",
    featured: true,
    newArrival: true,
    tags: "skirt pleated midi tailoring gender:women style:tailoring",
    specs: [
      { label: "Cloth", value: "Viscose-wool" },
      { label: "Length (S)", value: "78 cm" },
      { label: "Closure", value: "Side zip" },
    ],
    weight: 380,
    variants: dresses(["Charcoal", "Sand", "Navy"], "NC-PSK", 14500, 8),
  },
  {
    slug: "wide-leg-jean",
    name: "Wide Leg Jean",
    short: "A high rise, a full leg, indigo that will fade.",
    description:
      "Organic cotton denim, a high rise, a wide leg that stacks on the loafer. Unfinished hem. They will fade where you live. That is denim doing its job.",
    categorySlug: "bottoms",
    brandSlug: "north-and-co",
    bestseller: true,
    tags: "jeans denim wide-leg gender:unisex style:workwear",
    specs: [
      { label: "Cloth", value: "Organic cotton denim, 13 oz" },
      { label: "Rise", value: "High" },
      { label: "Hem", value: "Unfinished, 34 inch inseam" },
    ],
    weight: 680,
    variants: waists(["Indigo", "Washed"], "NC-JNS", 15800, 10),
  },
  {
    slug: "cotton-poplin-shirt",
    name: "Cotton Poplin Shirt",
    short: "A clean poplin. Soft collar, a placket that lies flat.",
    description:
      "Two-ply cotton poplin, a soft point collar, a slightly shorter tail. Tucked into the pleated trouser or worn open over the tank. It is the white shirt you actually wear.",
    categorySlug: "shirts",
    brandSlug: "north-and-co",
    tags: "shirt poplin cotton gender:unisex style:tailoring",
    specs: [
      { label: "Cloth", value: "Two-ply cotton poplin, 120 gsm" },
      { label: "Fit", value: "Regular, slightly shorter tail" },
    ],
    weight: 220,
    variants: sized(["White", "Sky", "Stripe"], "NC-POP", 9800, 12),
  },
  {
    slug: "seersucker-short",
    name: "Seersucker Short",
    short: "A short with a pucker. 7-inch inseam, unfinished if you ask.",
    description:
      "Cotton seersucker, a 7-inch inseam, a clean front. Heat is the point. Wear it with the oxford or the tank. Machine wash; the pucker comes back.",
    categorySlug: "bottoms",
    brandSlug: "north-and-co",
    newArrival: true,
    tags: "shorts seersucker summer gender:unisex style:basics",
    specs: [
      { label: "Cloth", value: "Cotton seersucker" },
      { label: "Inseam", value: "7 inch" },
    ],
    weight: 220,
    variants: waists(["Sky", "White"], "NC-SSK", 8800, 11, ["28", "30", "32", "34", "36"]),
  },
  {
    slug: "knit-midi-dress",
    name: "Merino Knit Midi Dress",
    short: "A dress that is a sweater. Fine merino, a midi, no zipper fight.",
    description:
      "Extrafine merino, fully fashioned, a midi that skims. Wear it with the loafer or the boot. It does not cling if you take your size. Hand wash, dry flat.",
    categorySlug: "dresses",
    brandSlug: "holm",
    featured: true,
    tags: "dress knit merino midi gender:women style:minimal",
    specs: [
      { label: "Fiber", value: "100% extrafine merino" },
      { label: "Fit", value: "Skims. If between, take the larger." },
      { label: "Length (S)", value: "118 cm" },
    ],
    weight: 360,
    variants: dresses(["Oat", "Navy", "Black"], "HOLM-KMD", 21000, 7),
  },
  {
    slug: "denim-jacket",
    name: "Broken-In Denim Jacket",
    short: "A trucker that already looks owned. 12 oz, copper hardware.",
    description:
      "Washed 12-ounce denim, copper buttons, a collar that sits. Wear it over the tee or under the overcoat. It will fade at the creases you actually make.",
    categorySlug: "outerwear",
    brandSlug: "field-theory",
    tags: "jacket denim trucker gender:unisex style:workwear",
    specs: [
      { label: "Cloth", value: "12 oz cotton denim" },
      { label: "Fit", value: "Regular over a tee. Size up over a knit." },
    ],
    weight: 780,
    variants: sized(["Indigo", "Washed"], "FT-DNM", 18800, 9),
  },
  {
    slug: "merino-sweater-vest",
    name: "Merino Sweater Vest",
    short: "A V-neck vest. Wear it over the oxford; ignore the costume jokes.",
    description:
      "Extrafine merino, a V that shows a collar, fully fashioned. Layer it over the poplin or the tee. It is warmth without sleeves, not a punchline.",
    categorySlug: "knitwear",
    brandSlug: "holm",
    newArrival: true,
    tags: "vest sweater merino knit gender:unisex style:tailoring",
    specs: [
      { label: "Fiber", value: "100% extrafine merino" },
      { label: "Fit", value: "Regular over a shirt." },
    ],
    weight: 240,
    variants: sized(["Navy", "Oat", "Charcoal"], "HOLM-VST", 14500, 10),
  },
  {
    slug: "rugby-shirt",
    name: "Heavy Cotton Rugby",
    short: "A rugby with a real collar. Heavy jersey, rubber buttons.",
    description:
      "Cotton jersey heavy enough to be a layer. A knit collar, rubber buttons, a slight crop so it sits over the chino. Wear it on purpose, not ironically.",
    categorySlug: "shirts",
    brandSlug: "north-and-co",
    tags: "rugby shirt cotton gender:unisex style:workwear",
    specs: [
      { label: "Cloth", value: "Cotton jersey, 320 gsm" },
      { label: "Fit", value: "Regular, slightly shorter." },
    ],
    weight: 480,
    variants: sized(["Navy", "Stripe", "Ink"], "NC-RGB", 11800, 10),
  },
  {
    slug: "drawstring-trouser",
    name: "Wool Drawstring Trouser",
    short: "A trouser with a drawstring. Full leg, no elastic costume.",
    description:
      "Tropical wool, a drawstring that actually ties, a full leg. Wear it with the polo or the tee. It is ease without looking like pajamas. Unfinished hem.",
    categorySlug: "bottoms",
    brandSlug: "north-and-co",
    tags: "trousers wool drawstring gender:unisex style:minimal",
    specs: [
      { label: "Cloth", value: "Tropical wool, 240 gsm" },
      { label: "Rise", value: "Mid" },
      { label: "Hem", value: "Unfinished, 34 inch inseam" },
    ],
    weight: 440,
    variants: waists(["Charcoal", "Sand"], "NC-DRW", 13500, 9),
  },
  {
    slug: "wrap-coat",
    name: "Wool Wrap Coat",
    short: "A coat you wrap. No buttons to lose, a belt that holds.",
    description:
      "Mid-weight wool, a clean wrap, a self-belt. Wear it over the slip dress or the knit. The sleeve is unfinished. It is a coat, not a robe.",
    categorySlug: "coats",
    brandSlug: "north-and-co",
    featured: true,
    tags: "coat wrap wool gender:women style:minimal",
    specs: [
      { label: "Cloth", value: "Wool, 420 gsm" },
      { label: "Fit", value: "Wrap. If between, take the larger." },
      { label: "Length (S)", value: "115 cm" },
    ],
    weight: 1200,
    variants: dresses(["Camel", "Black", "Charcoal"], "NC-WRP", 36500, 5),
  },
  {
    slug: "tailored-short",
    name: "Tailored Wool Short",
    short: "A short with a crease. 8-inch inseam, unfinished if you ask.",
    description:
      "Tropical wool, a clean front, an 8-inch inseam that is not costume. Wear it with the poplin and the loafer when heat arrives. Dry clean or hang after a steam.",
    categorySlug: "bottoms",
    brandSlug: "north-and-co",
    tags: "shorts wool tailoring gender:unisex style:tailoring",
    specs: [
      { label: "Cloth", value: "Tropical wool" },
      { label: "Inseam", value: "8 inch" },
    ],
    weight: 260,
    variants: waists(["Charcoal", "Sand", "Navy"], "NC-TSH", 9500, 8),
  },
  {
    slug: "chambray-work-shirt",
    name: "Chambray Work Shirt",
    short: "A work shirt that is not costume. Two pockets, a real last button.",
    description:
      "Indigo chambray, two chest pockets, a collar that sits open. Wear it over the tee or closed as the shirt. It will fade at the collar. That is the cloth.",
    categorySlug: "shirts",
    brandSlug: "field-theory",
    tags: "shirt chambray workwear gender:unisex style:workwear",
    specs: [
      { label: "Cloth", value: "Cotton chambray" },
      { label: "Fit", value: "Regular over a tee. Size up over a knit." },
    ],
    weight: 340,
    variants: sized(["Indigo", "Washed"], "FT-CHM", 12800, 11),
  },
  {
    slug: "pleated-trouser",
    name: "Double Pleat Trouser",
    short: "Double pleats, a full leg, an unfinished hem.",
    description:
      "Tropical wool, two pleats that actually function, a full leg. High enough to sit. We leave the hem unfinished so your tailor can set it to the loafer.",
    categorySlug: "bottoms",
    brandSlug: "north-and-co",
    featured: true,
    tags: "trousers wool pleated tailoring gender:unisex style:tailoring",
    specs: [
      { label: "Cloth", value: "Tropical wool, 260 gsm" },
      { label: "Rise", value: "High" },
      { label: "Hem", value: "Unfinished, 36 inch inseam" },
    ],
    weight: 500,
    variants: waists(["Charcoal", "Navy", "Sand"], "NC-PLT", 18800, 8),
  },
  {
    slug: "suede-overshirt",
    name: "Suede Overshirt",
    short: "An overshirt in suede. Two pockets, a weight you feel.",
    description:
      "Goat suede, a shirt cut with enough cloth to be a jacket. Wear it open over the merino or closed on a mild day. Brush it; do not soak it.",
    categorySlug: "outerwear",
    brandSlug: "field-theory",
    newArrival: true,
    tags: "overshirt suede leather jacket gender:unisex style:outdoor",
    specs: [
      { label: "Leather", value: "Goat suede" },
      { label: "Fit", value: "Regular over a tee. Size up over a knit." },
    ],
    weight: 680,
    variants: sized(["Sand", "Ink"], "FT-SUD", 24500, 6),
  },
];

export const KEEP_SLUGS = [
  "merino-crewneck",
  "washed-oxford-shirt",
  "wide-leg-trouser",
  "heavyweight-tee",
  "field-jacket",
  "linen-overshirt",
  "cashmere-beanie",
  "silk-scarf",
  "merino-polo",
  "french-terry-hoodie",
  "wool-overcoat",
  "cotton-chino",
  "shirt-jacket",
  "silk-slip-dress",
  "leather-loafer",
  "boiled-wool-scarf",
  "merino-socks",
  "leather-belt",
  "sunglasses",
] as const;

export function productImageUrls(slug: string) {
  return [
    `/images/products/${slug}.jpg`,
    `/images/products/${slug}-2.jpg`,
    `/images/products/${slug}-3.jpg`,
  ];
}
