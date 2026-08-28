import { prisma } from "./prisma";
import { parseJson } from "./utils";
import { rapidEnabled } from "./rapid";

export type StoreSettings = {
  store: {
    name: string;
    tagline: string;
    email: string;
    phone: string;
    address: string;
    currency: string;
    timezone: string;
    country: string;
    logo: string;
  };
  payments: {
    rapidEnabled: boolean;
    codEnabled: boolean;
  };
  tax: {
    rateBps: number;
  };
  seo: {
    title: string;
    description: string;
    ogImage: string;
  };
  returns: {
    windowDays: number;
  };
};

const DEFAULTS: StoreSettings = {
  store: {
    name: "NORTH & CO.",
    tagline: "Objects for a considered life",
    email: "samuel.w@example.com",
    phone: "+1 (212) 555-0148",
    address: "184 Mercer Street, New York, NY 10012",
    currency: "pkr",
    timezone: "Asia/Karachi",
    country: "PK",
    logo: "",
  },
  payments: {
    rapidEnabled: rapidEnabled(),
    codEnabled: true,
  },
  tax: { rateBps: 0 },
  seo: {
    title: "NORTH & CO. — Objects for a considered life",
    description:
      "Apparel, home, and objects made to last. Guest checkout, worldwide shipping, and considered materials.",
    ogImage: "/images/og.jpg",
  },
  returns: { windowDays: 30 },
};

let cache: { value: StoreSettings; at: number } | null = null;

export async function getSettings(): Promise<StoreSettings> {
  if (cache && Date.now() - cache.at < 15_000) return cache.value;
  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL && !process.env.POSTGRES_PRISMA_URL) {
    return DEFAULTS;
  }
  let rows: { key: string; value: string }[] = [];
  try {
    rows = await prisma.setting.findMany();
  } catch {
    return DEFAULTS;
  }
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const stored = parseJson<Record<string, unknown>>(map["payments"], {});
  const merged: StoreSettings = {
    store: { ...DEFAULTS.store, ...parseJson(map["store"], {}) },
    payments: {
      rapidEnabled:
        rapidEnabled() &&
        stored.rapidEnabled !== false &&
        stored.stripeEnabled !== false,
      codEnabled: stored.codEnabled !== false,
    },
    tax: { ...DEFAULTS.tax, ...parseJson(map["tax"], {}) },
    seo: { ...DEFAULTS.seo, ...parseJson(map["seo"], {}) },
    returns: { ...DEFAULTS.returns, ...parseJson(map["returns"], {}) },
  };
  cache = { value: merged, at: Date.now() };
  return merged;
}

export function clearSettingsCache() {
  cache = null;
}

export async function setSetting(key: string, value: unknown) {
  await prisma.setting.upsert({
    where: { key },
    update: { value: JSON.stringify(value) },
    create: { key, value: JSON.stringify(value) },
  });
  clearSettingsCache();
}
