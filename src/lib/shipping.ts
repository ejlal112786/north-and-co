import { prisma } from "./prisma";
import { parseJson, estimateWindow } from "./utils";

export type Quote = {
  id: string;
  name: string;
  code: string;
  rateCents: number;
  minDays: number;
  maxDays: number;
  estimate: string;
};

export async function quoteShipping(country: string, subtotalAfterDiscount: number): Promise<Quote[]> {
  const zones = await prisma.shippingZone.findMany({
    where: { isActive: true },
    include: { methods: { where: { isActive: true } } },
  });
  const iso = country.toUpperCase();
  const matched =
    zones.find((z) => parseJson<string[]>(z.countries, []).includes(iso)) ??
    zones.find((z) => parseJson<string[]>(z.countries, []).includes("*"));
  if (!matched) return [];
  return matched.methods.map((m) => {
    let rate = m.rateCents;
    if (m.freeAboveCents != null && subtotalAfterDiscount >= m.freeAboveCents) rate = 0;
    return {
      id: m.id,
      name: m.name,
      code: m.code,
      rateCents: rate,
      minDays: m.minDays,
      maxDays: m.maxDays,
      estimate: estimateWindow(m.minDays, m.maxDays),
    };
  });
}
