import { cartSummary } from "@/lib/cart";
import { CartView } from "@/components/store/CartView";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Cart" };

export default async function CartPage() {
  const [summary, settings] = await Promise.all([cartSummary(), getSettings()]);
  return (
    <div className="mx-auto max-w-catalog px-4 py-10">
      <h1 className="font-serif text-5xl">Cart</h1>
      <CartView summary={JSON.parse(JSON.stringify(summary))} currency={settings.store.currency} />
    </div>
  );
}
