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
    subtitle: "Heavy tee, waxed jacket, a tote that stands.",
    image: "/images/banners/hero.jpg",
    pieces: [
      { slug: "heavyweight-tee", note: "The shirt" },
      { slug: "field-jacket", note: "The jacket" },
      { slug: "canvas-tote", note: "Carry" },
      { slug: "merino-socks", note: "Under" },
    ],
  },
  {
    slug: "linen-rooms",
    title: "Linen rooms",
    subtitle: "Bed, table, a napkin that outlasts paper.",
    image: "/images/banners/linen.jpg",
    pieces: [
      { slug: "linen-duvet-set", note: "The bed" },
      { slug: "wool-throw", note: "The throw" },
      { slug: "linen-napkins", note: "The table" },
      { slug: "cedar-candle", note: "The room" },
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
