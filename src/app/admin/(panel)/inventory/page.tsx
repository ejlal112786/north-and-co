import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { InventoryTable } from "@/components/admin/InventoryTable";

export default async function InventoryPage() {
  await requireAdmin("inventory");
  const variants = await prisma.productVariant.findMany({
    where: { isActive: true },
    include: { product: true },
    orderBy: { stockQty: "asc" },
  });
  const tx = await prisma.inventoryTransaction.findMany({
    orderBy: { createdAt: "desc" },
    take: 40,
    include: { variant: { include: { product: true } } },
  });
  return (
    <div>
      <h1 className="font-serif text-4xl">Inventory</h1>
      <p className="mt-2 text-sm text-muted">Available = stock − reserved. Low threshold is per SKU.</p>
      <InventoryTable variants={JSON.parse(JSON.stringify(variants))} />
      <h2 className="mt-10 font-serif text-2xl">Recent movements</h2>
      <ul className="mt-3 text-sm">
        {tx.map((t) => (
          <li key={t.id} className="border-b border-line py-2">
            {t.type} {t.quantity} · {t.variant.product.name} {t.variant.sku} · {t.reason}
          </li>
        ))}
      </ul>
    </div>
  );
}
