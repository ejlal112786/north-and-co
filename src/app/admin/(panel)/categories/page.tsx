import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { CategoryForm } from "@/components/admin/CategoryForm";

export default async function CategoriesPage() {
  await requireAdmin("products");
  const cats = await prisma.category.findMany({ include: { parent: true }, orderBy: { sortOrder: "asc" } });
  return (
    <div>
      <h1 className="font-serif text-4xl">Categories</h1>
      <ul className="mt-4 text-sm">
        {cats.map((c) => (
          <li key={c.id} className="border-b border-line py-2">
            {c.parent ? `${c.parent.name} / ` : ""}
            {c.name} <span className="text-muted">/{c.slug}</span>
          </li>
        ))}
      </ul>
      <CategoryForm parents={cats.filter((c) => !c.parentId).map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}
