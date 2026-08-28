import Link from "next/link";

const LINKS: { href: string; label: string }[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/coupons", label: "Discounts" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/returns", label: "Returns" },
  { href: "/admin/customers", label: "Buyers" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/shipping", label: "Shipping" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/emails", label: "Messages" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-mist text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-56 overflow-y-auto border-r border-line bg-paper md:block">
        <div className="px-4 py-5">
          <p className="tracking-brand text-[11px]">NORTH &amp; CO.</p>
          <p className="mt-1 text-xs text-muted">Desk</p>
        </div>
        <nav className="px-2 pb-8 text-sm">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="block px-3 py-1.5 hover:bg-bone">
              {l.label}
            </Link>
          ))}
          <Link href="/" className="mt-4 block px-3 py-1.5 text-muted">
            View store
          </Link>
        </nav>
      </aside>
      <div className="md:pl-56">
        <header className="flex items-center justify-between border-b border-line bg-paper px-4 py-3 md:hidden">
          <p className="tracking-brand text-sm">NORTH &amp; CO. Desk</p>
        </header>
        <nav className="flex gap-3 overflow-x-auto border-b border-line bg-paper px-4 py-2 text-xs md:hidden">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="whitespace-nowrap">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}
