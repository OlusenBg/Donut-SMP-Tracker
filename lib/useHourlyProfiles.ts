"use client";

import { useEffect, useRef, useState } from "react";

type Profile = { hour: number; avgPrice: number }[];

/** Batch-fetches trade heatmap data for a set of slugs. Only ever
 * requests slugs it hasn't already fetched — safe to call with a slug
 * list that grows over time (e.g. infinite scroll accumulating pages)
 * without re-fetching or unbounded-growing a single request. */
export function useHourlyProfiles(slugs: string[]): Record<string, Profile> {
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const fetchedRef = useRef<Set<string>>(new Set());
  const key = slugs.join(",");

  useEffect(() => {
    const missing = slugs.filter((s) => !fetchedRef.current.has(s));
    if (missing.length === 0) return;
    missing.forEach((s) => fetchedRef.current.add(s));

    let cancelled = false;

    async function load() {
      const tzOffset = new Date().getTimezoneOffset();
      try {
        const res = await fetch(
          `/api/items/hourly-batch?slugs=${encodeURIComponent(missing.join(","))}&tzOffset=${tzOffset}`,
        );
        const data = await res.json();
        if (!cancelled) setProfiles((prev) => ({ ...prev, ...(data.profiles ?? {}) }));
      } catch {
        // allow a later render to retry these slugs
        missing.forEach((s) => fetchedRef.current.delete(s));
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return profiles;
}
