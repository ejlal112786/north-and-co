import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ReturnMod } from "@/components/admin/ReturnMod";

export default async function ReturnsAdmin() {
  await requireAdmin("returns");
  const rows = await prisma.returnRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { order: true },
  });
  return (
    <div>
      <h1 className="font-serif text-4xl">Returns</h1>
      <ReturnMod rows={JSON.parse(JSON.stringify(rows))} />
    </div>
  );
}
