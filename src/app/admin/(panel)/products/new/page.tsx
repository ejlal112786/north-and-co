import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProduct() {
  await requireAdmin("products");
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany(),
  ]);
  return (
    <div>
      <h1 className="font-serif text-4xl">New product</h1>
      <ProductForm categories={categories} brands={brands} />
    </div>
  );
}
