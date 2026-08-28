import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("products");
  const { id } = await params;
  const [product, categories, brands] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" } }, variants: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany(),
  ]);
  if (!product) notFound();
  return (
    <div>
      <h1 className="font-serif text-4xl">Edit {product.name}</h1>
      <ProductForm
        categories={categories}
        brands={brands}
        product={JSON.parse(JSON.stringify(product))}
      />
    </div>
  );
}
