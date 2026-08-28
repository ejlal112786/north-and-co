import { cartSummary } from "@/lib/cart";
import { getSettings } from "@/lib/settings";
import { CheckoutForm } from "@/components/store/CheckoutForm";
import { rapidEnabled } from "@/lib/rapid";
import { redirect } from "next/navigation";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const [summary, settings] = await Promise.all([cartSummary(), getSettings()]);
  if (!summary.items.length) redirect("/cart");
  return (
    <div className="mx-auto max-w-catalog px-4 py-10">
      <h1 className="font-serif text-5xl">Guest checkout</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        We do not create accounts. You will receive an order number and a private tracking link by email.
      </p>
      <CheckoutForm
        summary={JSON.parse(JSON.stringify(summary))}
        currency={settings.store.currency}
        rapidOn={settings.payments.rapidEnabled && rapidEnabled()}
        codOn={settings.payments.codEnabled}
      />
    </div>
  );
}
