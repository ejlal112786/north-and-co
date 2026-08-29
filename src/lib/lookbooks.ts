export type LookbookPiece = { slug: string; note: string };

export type Lookbook = {
  slug: string;
  title: string;
  subtitle: string;
  image: string;
  pieces: LookbookPiece[];
};

export const LOOKBOOKS: Lookbook[] = [
  {
    slug: "fall-cloth",
    title: "Fall cloth",
    subtitle: "Merino, wool coat, unfinished hems — a week of town.",
    image: "/images/banners/lookbook.jpg",
    pieces: [
      { slug: "merino-crewneck", note: "Against the skin" },
      { slug: "wide-leg-trouser", note: "The trouser" },
      { slug: "wool-overcoat", note: "Over everything" },
      { slug: "leather-belt", note: "The belt" },
    ],
  },
  {
    slug: "weekend-kit",
    title: "Weekend kit",
    subtitle: "Heavy tee, waxed jacket, a jean that stacks.",
    image: "/images/banners/hero.jpg",
    pieces: [
      { slug: "heavyweight-tee", note: "The shirt" },
      { slug: "field-jacket", note: "The jacket" },
      { slug: "wide-leg-jean", note: "The jean" },
      { slug: "merino-socks", note: "Under" },
    ],
  },
  {
    slug: "town-tailoring",
    title: "Town tailoring",
    subtitle: "Blazer, pleat, a poplin that tucks.",
    image: "/images/banners/linen.jpg",
    pieces: [
      { slug: "wool-blazer", note: "The jacket" },
      { slug: "pleated-trouser", note: "The trouser" },
      { slug: "cotton-poplin-shirt", note: "The shirt" },
      { slug: "leather-loafer", note: "The shoe" },
    ],
  },
  {
    slug: "evening-cloth",
    title: "Evening cloth",
    subtitle: "Silk slip, wool coat, a boiled scarf.",
    image: "/images/banners/lookbook.jpg",
    pieces: [
      { slug: "silk-slip-dress", note: "The dress" },
      { slug: "wool-overcoat", note: "Over" },
      { slug: "boiled-wool-scarf", note: "The neck" },
      { slug: "leather-loafer", note: "The shoe" },
    ],
  },
];

export function getLookbook(slug: string) {
  return LOOKBOOKS.find((l) => l.slug === slug);
}
