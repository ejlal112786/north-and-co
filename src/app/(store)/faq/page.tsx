import { prisma } from "@/lib/prisma";

export const metadata = { title: "FAQs" };

export default async function FaqPage() {
  const faqs = await prisma.faq.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-serif text-5xl">FAQs</h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
        Guest checkout only. Prices are PKR. Rapid payments are marked paid after Rapid confirms; cash on delivery
        stays unpaid until the desk records cash. Answers below come from the desk database, not a static file.
      </p>
      <dl className="mt-10 divide-y divide-line border-y border-line">
        {faqs.map((f) => (
          <div key={f.id} className="py-6">
            <dt className="font-medium">{f.question}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-muted">{f.answer}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
