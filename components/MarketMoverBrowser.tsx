"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatPctChange, formatPrice } from "@/lib/format";
import { getItem } from "@/lib/items-data";
import RarityBadge from "./RarityBadge";
import RankBadge from "./RankBadge";
import WatchlistStar from "./WatchlistStar";

interface MoverItem {
  slug: string;
  name: string;
  category: string;
  image: string;
  price: number;
  pctChange: number;
  rank?: number;
}

type Direction = "drops" | "gains";

const PAGE_SIZE = 40;

export default function MarketMoverBrowser() {
  const [direction, setDirection] = useState<Direction>("gains");
  const [items, setItems] = useState<MoverItem[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(0);
  const exhaustedRef = useRef(false);
  const inFlightRef = useRef(false);

  const loadNextPage = useCallback(
    async (dir: Direction) => {
      if (inFlightRef.current || exhaustedRef.current) return;
      inFlightRef.current = true;
      setLoadingMore(true);
      try {
        const res = await fetch(
          `/api/movers?direction=${dir}&limit=${PAGE_SIZE}&offset=${loadedRef.current}`,
        );
        const data = await res.json();
        const page: MoverItem[] = data.items ?? [];
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
    },
    [],
  );

  useEffect(() => {
    setItems([]);
    loadedRef.current = 0;
    exhaustedRef.current = false;
    loadNextPage(direction);
  }, [direction, loadNextPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadNextPage(direction);
      },
      { rootMargin: "600px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [direction, loadNextPage]);

  return (
    <div>
      <div className="mb-6 flex gap-1 rounded-full bg-donut-900/60 p-1 w-fit">
        <button
          onClick={() => setDirection("gains")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            direction === "gains"
              ? "bg-donut-500 text-white shadow-glow"
              : "text-donut-300/60 hover:text-donut-100"
          }`}
        >
          📈 Going Up
        </button>
        <button
          onClick={() => setDirection("drops")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            direction === "drops"
              ? "bg-donut-500 text-white shadow-glow"
              : "text-donut-300/60 hover:text-donut-100"
          }`}
        >
          📉 Going Down
        </button>
      </div>

      {total !== null && (
        <p className="mb-6 text-sm text-donut-300/60">
          Showing {items.length.toLocaleString()} of {total.toLocaleString()} items, by 24h %
          change.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((item) => {
          const basePrice = getItem(item.slug)?.basePrice ?? item.price;
          return (
            <Link
              key={item.slug}
              href={`/item/${item.slug}`}
              className="relative flex flex-col items-center rounded-2xl border border-donut-500/20 bg-donut-900/50 p-4 transition-all hover:-translate-y-1 hover:border-donut-accent/60 hover:shadow-glow"
            >
              <RarityBadge basePrice={basePrice} />
              {item.rank !== undefined && <RankBadge rank={item.rank} />}
              <WatchlistStar slug={item.slug} stacked={item.rank !== undefined} />
              <div className="mt-4 flex h-16 w-16 items-center justify-center rounded-xl bg-donut-800/60 p-2.5">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={52}
                  height={52}
                  unoptimized
                  className="pixelated h-full w-full object-contain"
                />
              </div>
              <div className="mt-2.5 truncate text-center text-sm font-medium text-donut-100">
                {item.name}
              </div>
              <div className="mt-1 font-mono text-sm text-donut-300/70">
                {formatPrice(item.price)}
              </div>
              <div
                className={`mt-1 font-mono text-sm font-bold ${
                  item.pctChange >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {formatPctChange(item.pctChange)}
              </div>
            </Link>
          );
        })}
      </div>

      <div ref={sentinelRef} className="h-1" />

      {loadingMore && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl border border-donut-500/10 bg-donut-900/40"
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
