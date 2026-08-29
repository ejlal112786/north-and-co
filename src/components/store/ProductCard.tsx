import Link from "next/link";
import { formatMoney, discountPercent } from "@/lib/money";
import { Stars } from "./Stars";
import { WishlistButton } from "./WishlistButton";
import { QuickAdd } from "./QuickAdd";
import { QuickViewButton } from "./QuickView";

export type CardProduct = {
  slug: string;
  name: string;
  minPrice: number;
  maxPrice?: number;
  compareAt?: number | null;
  image: string;
  imageHover?: string | null;
  avgRating?: number;
  reviewCount?: number;
  available?: number;
  bestseller?: boolean;
  newArrival?: boolean;
  variantId?: string;
};

export function ProductCard({
  product,
  currency = "usd",
  index = 0,
  large = false,
}: {
  product: CardProduct;
  currency?: string;
  index?: number;
  large?: boolean;
}) {
  const sale = discountPercent(product.minPrice, product.compareAt);
  const hover = product.imageHover && product.imageHover !== product.image ? product.imageHover : null;
  return (
    <article className="card-rise group relative" style={{ ["--i" as string]: Math.min(index, 12) }}>
      <Link href={`/product/${product.slug}`} className="block">
        <div className={`relative overflow-hidden bg-bone ${large ? "aspect-[4/5] md:aspect-[4/5]" : "aspect-[4/5]"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image || "/images/fallback.jpg"}
            alt={product.name}
            className="photo-grade card-ken h-full w-full object-cover"
            loading="lazy"
          />
          {hover ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={hover} alt="" className="card-img-b photo-grade" loading="lazy" />
          ) : null}
          <div className="absolute left-3 top-3 flex flex-col gap-1">
            {sale ? <span className="badge">Sale −{sale}%</span> : null}
            {product.newArrival && !sale ? <span className="badge">New</span> : null}
            {product.available === 0 ? <span className="badge">Out of stock</span> : null}
          </div>
        </div>
        <div className={`flex items-start justify-between gap-3 ${large ? "px-5 py-4 sm:px-0 sm:pt-4" : "mt-3 px-5 sm:px-0"}`}>
          <div>
            <h3 className={`leading-snug ${large ? "font-serif text-2xl md:text-3xl" : "text-[15px]"}`}>{product.name}</h3>
            <p className="mt-1 text-sm text-muted">
              {formatMoney(product.minPrice, currency)}
              {product.compareAt && product.compareAt > product.minPrice ? (
                <span className="ml-2 text-muted line-through">{formatMoney(product.compareAt, currency)}</span>
              ) : null}
            </p>
            {product.bestseller ? (
              <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted">Best seller</p>
            ) : null}
            {product.reviewCount ? (
              <div className="mt-1">
                <Stars value={product.avgRating ?? 0} count={product.reviewCount} small />
              </div>
            ) : null}
          </div>
        </div>
      </Link>
      <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-100 transition-opacity duration-500 sm:opacity-0 sm:group-hover:opacity-100">
        <WishlistButton slug={product.slug} />
        <QuickViewButton slug={product.slug} />
        {product.variantId && (product.available ?? 1) > 0 ? <QuickAdd variantId={product.variantId} /> : null}
      </div>
    </article>
  );
}
