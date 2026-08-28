"use client";

import { useRouter } from "next/navigation";

export function CategoryForm({ parents }: { parents: { id: string; name: string }[] }) {
  const router = useRouter();
  return (
    <form
      className="mt-8 grid max-w-md gap-2 text-sm"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: fd.get("name"),
            parentId: fd.get("parentId") || null,
            description: fd.get("description"),
            featured: fd.get("featured") === "on",
          }),
        });
        router.refresh();
        e.currentTarget.reset();
      }}
    >
      <h2 className="font-serif text-2xl">New category</h2>
      <input name="name" required placeholder="Name" className="border border-line px-3 py-2" />
      <select name="parentId" className="border border-line bg-paper px-2 py-2">
        <option value="">Top level</option>
        {parents.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <textarea name="description" placeholder="Description" className="border border-line px-3 py-2" />
      <label className="flex gap-2">
        <input type="checkbox" name="featured" /> Featured
      </label>
      <button className="bg-ink py-2 text-[12px] uppercase tracking-widest text-paper">Create</button>
    </form>
  );
}
