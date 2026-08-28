const KEY = "nc_wishlist";

export function getWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function toggleWishlist(slug: string): string[] {
  const cur = getWishlist();
  const next = cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug];
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("nc-wishlist"));
  return next;
}

export function recentlyKey() {
  return "nc_recent";
}

export function pushRecent(slug: string) {
  if (typeof window === "undefined") return;
  const cur: string[] = JSON.parse(localStorage.getItem(recentlyKey()) || "[]");
  const next = [slug, ...cur.filter((s) => s !== slug)].slice(0, 8);
  localStorage.setItem(recentlyKey(), JSON.stringify(next));
}

export function getRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(recentlyKey()) || "[]");
  } catch {
    return [];
  }
}
