import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { AnalyticsBeacon } from "@/components/store/AnalyticsBeacon";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <AnalyticsBeacon />
    </>
  );
}
