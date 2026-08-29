import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CmsBody } from "@/lib/cms";
import { Reveal } from "@/components/store/Reveal";

const RESERVED = new Set([
  "shop",
  "product",
  "cart",
  "checkout",
  "track",
  "wishlist",
  "search",
  "faq",
  "lookbook",
  "lookbooks",
  "contact",
  "returns",
  "invoice",
  "admin",
  "api",
]);

export async function generateMetadata({ params }: { params: Promise<{ page: string }> }): Promise<Metadata> {
  const { page } = await params;
  const row = await prisma.cmsPage.findUnique({ where: { slug: page } });
  if (!row) return { title: "Not found" };
  return { title: row.seoTitle || row.title, description: row.seoDescription || undefined };
}

export default async function CmsPage({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  if (RESERVED.has(page)) notFound();
  const row = await prisma.cmsPage.findFirst({ where: { slug: page, isPublished: true } });
  if (!row) notFound();
  return (
    <article className="prose-store mx-auto max-w-2xl px-4 py-16">
      <Reveal>
        <h1 className="font-serif text-5xl">{row.title}</h1>
        <CmsBody content={row.content} />
      </Reveal>
    </article>
  );
}
