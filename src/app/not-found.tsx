import Link from "next/link";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="relative min-h-[70vh] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/banners/lookbook.jpg" alt="" className="photo-grade absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="relative mx-auto max-w-2xl px-6 py-28">
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted">404</p>
          <h1 className="mt-4 font-serif text-[clamp(2.8rem,8vw,5.5rem)] leading-[0.92]">This page is not in the catalog.</h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted">
            It may have been archived, or the link is wrong. The shop, the lookbooks, and order tracking are still here.
          </p>
          <div className="mt-10 flex flex-wrap gap-6 text-[12px] uppercase tracking-[0.16em]">
            <Link href="/" className="link-underline">
              Home
            </Link>
            <Link href="/shop" className="link-underline">
              Shop
            </Link>
            <Link href="/lookbook" className="link-underline">
              Lookbooks
            </Link>
            <Link href="/track" className="link-underline">
              Track order
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
