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
  avgRating?: number;
  reviewCount?: number;
  available?: number;
  bestseller?: boolean;
  newArrival?: boolean;
  variantId?: string;
};

export function ProductCard({ product, currency = "usd" }: { product: CardProduct; currency?: string }) {
  const sale = discountPercent(product.minPrice, product.compareAt);
  return (
    <article className="group relative">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-bone">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image || "/images/fallback.jpg"}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {sale ? (
              <span className="bg-sale px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-white">
                −{sale}%
              </span>
            ) : null}
            {product.newArrival ? (
              <span className="bg-ink px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-paper">
                New
              </span>
            ) : null}
            {product.bestseller ? (
              <span className="bg-sage px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-paper">
                Best seller
              </span>
            ) : null}
            {product.available === 0 ? (
              <span className="bg-paper/90 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-ink">
                Out of stock
              </span>
            ) : null}
          </div>
        </div>
        <div className="mt-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[15px] leading-snug">{product.name}</h3>
            <p className="mt-1 text-sm text-muted">
              {formatMoney(product.minPrice, currency)}
              {product.compareAt && product.compareAt > product.minPrice ? (
                <span className="ml-2 text-muted line-through">{formatMoney(product.compareAt, currency)}</span>
              ) : null}
            </p>
            {product.reviewCount ? (
              <div className="mt-1">
                <Stars value={product.avgRating ?? 0} count={product.reviewCount} small />
              </div>
            ) : null}
          </div>
        </div>
      </Link>
      <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
        <WishlistButton slug={product.slug} />
        <QuickViewButton slug={product.slug} />
        {product.variantId && (product.available ?? 1) > 0 ? <QuickAdd variantId={product.variantId} /> : null}
      </div>
    </article>
  );
}
