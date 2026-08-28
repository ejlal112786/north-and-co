"use client";

import { useEffect } from "react";
import { pushRecent } from "./wishlist-store";

export function RecordView({ slug }: { slug: string }) {
  useEffect(() => {
    pushRecent(slug);
  }, [slug]);
  return null;
}
