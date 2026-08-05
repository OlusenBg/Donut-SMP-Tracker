"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ItemCard, { ItemSummary } from "./ItemCard";
import ItemListRow from "./ItemListRow";
import { useLayoutPreference } from "@/lib/useLayoutPreference";
import { useHourlyProfiles } from "@/lib/useHourlyProfiles";

const PAGE_SIZE = 40;

export default function MostExpensiveBrowser() {
  const [items, setItems] = useState<ItemSummary[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(0);
  const exhaustedRef = useRef(false);
  const inFlightRef = useRef(false);
  const layout = useLayoutPreference();
  const profiles = useHourlyProfiles(layout === "list" ? items.map((i) => i.slug) : []);

  const loadNextPage = useCallback(async () => {
    if (inFlightRef.current || exhaustedRef.current) return;
    inFlightRef.current = true;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/items?full=1&limit=${PAGE_SIZE}&offset=${loadedRef.current}`);
      const data = await res.json();
      const page: ItemSummary[] = data.items ?? [];
      setItems((prev) => [...prev, ...page]);
      loadedRef.current += page.length;
      setTotal(data.total ?? null);
      if (page.length < PAGE_SIZE) exhaustedRef.current = true;
    } catch {
      // leave exhaustedRef false so a later scroll/retry can pick back up
    } finally {
      inFlightRef.current = false;
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadNextPage();
  }, [loadNextPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadNextPage();
      },
      { rootMargin: "600px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadNextPage]);

  return (
    <div>
      {total !== null && (
        <p className="mb-6 text-sm text-donut-300/60">
          Showing {items.length.toLocaleString()} of {total.toLocaleString()} items, ranked by
          current price.
        </p>
      )}

      {layout === "list" ? (
        <div className="flex flex-col gap-3">
          {items.map((item, i) => (
            <ItemListRow key={item.slug} item={item} hourlyProfile={profiles[item.slug]} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((item, i) => (
            <ItemCard key={item.slug} item={item} rank={i < 3 ? i : undefined} />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-1" />

      {loadingMore && (
        <div
          className={
            layout === "list"
              ? "mt-3 flex flex-col gap-3"
              : "mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          }
        >
          {Array.from({ length: layout === "list" ? 6 : 10 }).map((_, i) => (
            <div
              key={i}
              className={
                layout === "list"
                  ? "h-[72px] animate-pulse rounded-2xl border border-donut-500/10 bg-donut-900/40"
                  : "h-40 animate-pulse rounded-2xl border border-donut-500/10 bg-donut-900/40"
              }
            />
          ))}
        </div>
      )}

      {exhaustedRef.current && items.length > 0 && (
        <p className="mt-10 text-center text-sm text-donut-300/40">
          That&apos;s every tracked item.
        </p>
      )}
    </div>
  );
}
