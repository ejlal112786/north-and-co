"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Variant = {
  id?: string;
  sku: string;
  title: string;
  priceCents: number;
  compareAtCents?: number | null;
  stockQty: number;
  options?: string;
  isActive?: boolean;
};

export function ProductForm({
  categories,
  brands,
  product,
}: {
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  product?: {
    id: string;
    name: string;
    slug: string;
    shortDescription: string;
    description: string;
    status: string;
    featured: boolean;
    bestseller: boolean;
    newArrival: boolean;
    brandId: string | null;
    categoryId: string | null;
    tags: string;
    specifications: string;
    videoUrl: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    images: { url: string }[];
    variants: Variant[];
  };
}) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [images, setImages] = useState(product?.images.map((i) => i.url).join("\n") || "");
  const [variants, setVariants] = useState<Variant[]>(
    product?.variants?.length
      ? product.variants
      : [{ sku: "", title: "Default", priceCents: 0, stockQty: 0, options: "{}" }]
  );

  async function upload(file: File) {
    const fd = new FormData();
    fd.set("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const j = await res.json();
    if (j.url) setImages((s) => (s ? s + "\n" + j.url : j.url));
  }

  return (
    <form
      className="mt-6 grid max-w-3xl gap-3 text-sm"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const payload = {
          name: fd.get("name"),
          slug: fd.get("slug"),
          shortDescription: fd.get("shortDescription"),
          description: fd.get("description"),
          status: fd.get("status"),
          featured: fd.get("featured") === "on",
          bestseller: fd.get("bestseller") === "on",
          newArrival: fd.get("newArrival") === "on",
          brandId: fd.get("brandId") || null,
          categoryId: fd.get("categoryId") || null,
          tags: fd.get("tags"),
          specifications: fd.get("specifications"),
          videoUrl: fd.get("videoUrl") || null,
          seoTitle: fd.get("seoTitle"),
          seoDescription: fd.get("seoDescription"),
          images: images.split("\n").map((s) => s.trim()).filter(Boolean),
          variants: variants.map((v) => ({
            ...v,
            priceCents: Number(v.priceCents),
            stockQty: Number(v.stockQty),
            compareAtCents: v.compareAtCents ? Number(v.compareAtCents) : null,
          })),
        };
        const url = product ? `/api/admin/products/${product.id}` : "/api/admin/products";
        const res = await fetch(url, {
          method: product ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        const j = await res.json();
        if (!res.ok) setMsg(j.error || "Failed");
        else router.push("/admin/products");
      }}
    >
      <input name="name" required defaultValue={product?.name} placeholder="Name" className="border border-line px-3 py-2" />
      <input name="slug" defaultValue={product?.slug} placeholder="slug" className="border border-line px-3 py-2" />
      <textarea name="shortDescription" defaultValue={product?.shortDescription} placeholder="Short" className="border border-line px-3 py-2" />
      <textarea name="description" rows={6} defaultValue={product?.description} placeholder="Description" className="border border-line px-3 py-2" />
      <div className="grid grid-cols-2 gap-2">
        <select name="status" defaultValue={product?.status || "DRAFT"} className="border border-line bg-paper px-2 py-2">
          <option>DRAFT</option>
          <option>PUBLISHED</option>
          <option>ARCHIVED</option>
        </select>
        <select name="categoryId" defaultValue={product?.categoryId || ""} className="border border-line bg-paper px-2 py-2">
          <option value="">No category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select name="brandId" defaultValue={product?.brandId || ""} className="border border-line bg-paper px-2 py-2">
          <option value="">No brand</option>
          {brands.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input name="tags" defaultValue={product?.tags} placeholder="tags" className="border border-line px-3 py-2" />
      </div>
      <label className="flex gap-2">
        <input type="checkbox" name="featured" defaultChecked={product?.featured} /> Featured
      </label>
      <label className="flex gap-2">
        <input type="checkbox" name="bestseller" defaultChecked={product?.bestseller} /> Bestseller
      </label>
      <label className="flex gap-2">
        <input type="checkbox" name="newArrival" defaultChecked={product?.newArrival} /> New arrival
      </label>
      <input name="videoUrl" defaultValue={product?.videoUrl || ""} placeholder="Video URL" className="border border-line px-3 py-2" />
      <input name="seoTitle" defaultValue={product?.seoTitle || ""} placeholder="SEO title" className="border border-line px-3 py-2" />
      <textarea name="seoDescription" defaultValue={product?.seoDescription || ""} placeholder="SEO description" className="border border-line px-3 py-2" />
      <textarea name="specifications" defaultValue={product?.specifications || "[]"} placeholder='Specs JSON [{"label":"Fiber","value":"..."}]' className="border border-line px-3 py-2 font-mono text-xs" />
      <div>
        <p className="text-xs text-muted">Images (one URL per line) or upload</p>
        <textarea value={images} onChange={(e) => setImages(e.target.value)} rows={3} className="mt-1 w-full border border-line px-3 py-2 font-mono text-xs" />
        <input type="file" accept="image/*,video/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      </div>
      <div>
        <p className="text-xs text-muted">Variants</p>
        {variants.map((v, i) => (
          <div key={i} className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-5">
            <input placeholder="SKU" value={v.sku} onChange={(e) => setVariants(vs => vs.map((x, n) => n === i ? { ...x, sku: e.target.value } : x))} className="border border-line px-2 py-1" />
            <input placeholder="Title" value={v.title} onChange={(e) => setVariants(vs => vs.map((x, n) => n === i ? { ...x, title: e.target.value } : x))} className="border border-line px-2 py-1" />
            <input type="number" placeholder="Price cents" value={v.priceCents} onChange={(e) => setVariants(vs => vs.map((x, n) => n === i ? { ...x, priceCents: Number(e.target.value) } : x))} className="border border-line px-2 py-1" />
            <input type="number" placeholder="Stock" value={v.stockQty} onChange={(e) => setVariants(vs => vs.map((x, n) => n === i ? { ...x, stockQty: Number(e.target.value) } : x))} className="border border-line px-2 py-1" />
            <input placeholder='{"size":"M"}' value={v.options || "{}"} onChange={(e) => setVariants(vs => vs.map((x, n) => n === i ? { ...x, options: e.target.value } : x))} className="border border-line px-2 py-1" />
          </div>
        ))}
        <button type="button" className="mt-2 underline" onClick={() => setVariants((v) => [...v, { sku: "", title: "", priceCents: 0, stockQty: 0, options: "{}" }])}>
          Add variant
        </button>
      </div>
      <button className="bg-ink py-3 text-[12px] uppercase tracking-widest text-paper">Save</button>
      {msg ? <p className="text-sale">{msg}</p> : null}
    </form>
  );
}
