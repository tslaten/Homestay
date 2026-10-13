"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * The Echo Show sits on one screen for days. Re-fetch server data
 * periodically so "today" rolls over at midnight (New York) and edits
 * made elsewhere show up without anyone touching the screen.
 */
export function AutoRefresh({ intervalMs = 5 * 60_000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
