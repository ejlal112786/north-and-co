import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ContentEditor } from "@/components/admin/ContentEditor";

export default async function ContentPage() {
  await requireAdmin("content");
  const pages = await prisma.cmsPage.findMany({ orderBy: { slug: "asc" } });
  const banners = await prisma.banner.findMany({ orderBy: { sortOrder: "asc" } });
  const faqs = await prisma.faq.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <div>
      <h1 className="font-serif text-4xl">Content</h1>
      <ContentEditor pages={JSON.parse(JSON.stringify(pages))} />
      <h2 className="mt-10 font-serif text-2xl">Banners</h2>
      <ul className="mt-3 text-sm">
        {banners.map((b) => (
          <li key={b.id} className="border-b border-line py-2">
            {b.position}: {b.title}
          </li>
        ))}
      </ul>
      <h2 className="mt-8 font-serif text-2xl">FAQs</h2>
      <ul className="mt-3 text-sm">
        {faqs.map((f) => (
          <li key={f.id} className="border-b border-line py-2">
            {f.question}
          </li>
        ))}
      </ul>
    </div>
  );
}
