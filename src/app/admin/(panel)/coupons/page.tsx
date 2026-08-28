import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { CouponForm } from "@/components/admin/CouponForm";

export default async function CouponsPage() {
  await requireAdmin("coupons");
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="font-serif text-4xl">Discounts</h1>
      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="border-b border-ink text-left">
            <th className="py-2">Code</th>
            <th>Type</th>
            <th>Value</th>
            <th>Used</th>
            <th>Active</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((c) => (
            <tr key={c.id} className="border-b border-line">
              <td className="py-2 font-mono">{c.code}</td>
              <td>{c.type}</td>
              <td>{c.value}</td>
              <td>
                {c.usageCount}
                {c.usageLimit ? ` / ${c.usageLimit}` : ""}
              </td>
              <td>{c.isActive ? "yes" : "no"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <CouponForm />
    </div>
  );
}
