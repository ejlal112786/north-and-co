"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function AnalyticsBeacon() {
  const path = usePathname();
  useEffect(() => {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "page_view", path }),
    }).catch(() => null);
  }, [path]);
  return null;
}
