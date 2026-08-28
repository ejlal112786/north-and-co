import { prisma } from "@/lib/prisma";
import { HeaderBar } from "./HeaderBar";

export async function Header() {
  const items = await prisma.navigationItem.findMany({
    where: { location: "header", isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return <HeaderBar items={items} initialCount={0} />;
}
