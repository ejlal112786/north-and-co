import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Reveal } from "@/components/store/Reveal";

export const metadata = { title: "FAQs" };

export default async function FaqPage() {
  const faqs = await prisma.faq.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Reveal>
        <h1 className="font-serif text-5xl">FAQs</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-[#3f3a34]">
          Guest checkout only — no customer accounts. Prices are PKR. Rapid payments (cards, JazzCash, easypaisa,
          Raast) are marked paid after Rapid confirms the amount. Cash on delivery stays unpaid until the desk records
          cash. Answers below come from the desk database. Longer policy lives on{" "}
          <Link href="/about" className="underline">
            About
          </Link>
          ,{" "}
          <Link href="/shipping" className="underline">
            Shipping
          </Link>
          ,{" "}
          <Link href="/returns" className="underline">
            Returns
          </Link>
          ,{" "}
          <Link href="/privacy" className="underline">
            Privacy
          </Link>
          , and{" "}
          <Link href="/terms" className="underline">
            Terms
          </Link>
          .
        </p>
      </Reveal>
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
