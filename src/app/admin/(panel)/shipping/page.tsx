import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatMoney } from "@/lib/money";

export default async function ShippingAdmin() {
  await requireAdmin("shipping");
  const zones = await prisma.shippingZone.findMany({ include: { methods: true } });
  return (
    <div>
      <h1 className="font-serif text-4xl">Shipping</h1>
      {zones.map((z) => (
        <section key={z.id} className="mt-6">
          <h2 className="font-serif text-2xl">{z.name}</h2>
          <ul className="mt-2 text-sm">
            {z.methods.map((m) => (
              <li key={m.id} className="border-b border-line py-2">
                {m.name} · {formatMoney(m.rateCents)}
                {m.freeAboveCents ? ` · free over ${formatMoney(m.freeAboveCents)}` : ""} · {m.minDays}–{m.maxDays} days
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
