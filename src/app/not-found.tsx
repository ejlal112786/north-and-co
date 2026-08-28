import Link from "next/link";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-xl px-4 py-24">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted">404</p>
        <h1 className="mt-2 font-serif text-5xl">This page is not in the catalog.</h1>
        <p className="mt-4 text-sm text-muted">It may have been archived, or the link is wrong.</p>
        <div className="mt-8 flex gap-4 text-sm">
          <Link href="/" className="underline">
            Home
          </Link>
          <Link href="/shop" className="underline">
            Shop
          </Link>
          <Link href="/track" className="underline">
            Track order
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
