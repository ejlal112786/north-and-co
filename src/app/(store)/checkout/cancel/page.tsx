import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { failRapidOrder } from "@/lib/orders";

export const metadata = { title: "Payment cancelled" };

export default async function CancelPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (token) {
    const order = await prisma.order.findUnique({ where: { accessToken: token } });
    if (order && order.paymentStatus !== "PAID") {
      await failRapidOrder(order.id);
    }
  }
  return (
    <div className="mx-auto max-w-xl px-4 py-20">
      <h1 className="font-serif text-4xl">Payment cancelled</h1>
      <p className="mt-4 text-sm text-muted">
        Nothing was charged. Reserved stock has been released. Your cart items were already snapshotted into the cancelled
        order — add them again from the shop if you still want them.
      </p>
      <div className="mt-6 flex gap-4">
        <Link href="/cart" className="underline">
          Cart
        </Link>
        <Link href="/shop" className="underline">
          Shop
        </Link>
      </div>
    </div>
  );
}
