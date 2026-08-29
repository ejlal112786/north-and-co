export type LookbookPiece = { slug: string; note: string };

export type Lookbook = {
  slug: string;
  title: string;
  subtitle: string;
  kicker: string;
  image: string;
  essay: string;
  pieces: LookbookPiece[];
};

export const LOOKBOOKS: Lookbook[] = [
  {
    slug: "fall-cloth",
    title: "Fall cloth",
    kicker: "Look 01 · Town, October",
    subtitle: "Merino against the skin. A wool coat. Unfinished hems to the loafer you actually wear.",
    image: "/images/banners/lookbook.jpg",
    essay: `A week of town does not ask for a costume. It asks for a crewneck that does not itch, a trouser with enough cloth to sit, and a coat that closes over both.

We start with extrafine merino, washed once so the first wear is already broken in. The wide-leg wool is left unhemmed — your tailor sets it to the shoe, not to a lookbook. The overcoat is charcoal, a throat latch, an unfinished sleeve. The belt is a single strap of hide. There is no logo to take off later.

This is the look we wear to the desk and to dinner that is still in the same clothes. Guest checkout. Keep the order number.`,
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
    kicker: "Look 02 · Saturday",
    subtitle: "A heavy tee, a waxed jacket, a jean that stacks. Nothing you have to think about twice.",
    image: "/images/banners/hero.jpg",
    essay: `Saturday is not a different person. It is the same body in a heavier jersey, a jacket that sheds a little weather, and a jean cut wide enough to forget.

The tee is nine ounces so it does not go translucent. The field jacket is English waxed cotton; reproof it when the sheen goes dull, do not dry-clean it into a board. The jean is high-rise, unfinished at the hem, indigo that will fade where you live. Socks are merino because cotton gives up at the heel.

Every piece is a live SKU. If a size is gone, the site will say so. We would rather show you an empty grid than a lie.`,
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
    kicker: "Look 03 · The office that is not costume",
    subtitle: "An unstructured blazer, a double pleat, a poplin that tucks. Soft shoulder, unfinished hem.",
    image: "/images/banners/linen.jpg",
    essay: `Tailoring, here, is not a uniform. The blazer has no pad in the shoulder. The trouser has two pleats that actually function and a hem we have not touched. The shirt is two-ply poplin, a soft point collar, a slightly shorter tail so it stays tucked without a lot of cloth in the belt.

The loafer is vegetable-tanned. It will take a crease in the first week. That is the hide doing its job.

Wear it to a meeting or to a lunch that runs long. There is no customer account waiting on the other side of checkout. You are a person in a jacket, not a member.`,
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
    kicker: "Look 04 · After six",
    subtitle: "A bias silk slip, the same wool coat, a boiled scarf. No lining theater.",
    image: "/images/banners/support.jpg",
    essay: `Evening, for us, is not a different closet. It is the slip you already own, the coat from Fall cloth, and a scarf dense enough to be the only jewelry.

The dress is silk charmeuse, cut on the bias so it follows without a zipper fight. The overcoat is the charcoal you wore at noon. The boiled wool scarf does not itch. The loafer is the same pair.

If you want the set, add it. If you want one piece, open that SKU. Stock is checked on the server either way.`,
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

export function wornWith(slug: string) {
  const out: LookbookPiece[] = [];
  for (const lb of LOOKBOOKS) {
    if (!lb.pieces.some((p) => p.slug === slug)) continue;
    for (const p of lb.pieces) {
      if (p.slug === slug) continue;
      if (!out.some((o) => o.slug === p.slug)) out.push(p);
    }
  }
  return out.slice(0, 4);
}
