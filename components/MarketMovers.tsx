"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPctChange, formatPrice } from "@/lib/format";
import { getItem } from "@/lib/items-data";
import RarityBadge from "./RarityBadge";
import RankBadge from "./RankBadge";
import WatchlistStar from "./WatchlistStar";
import ItemListRow from "./ItemListRow";
import { useLayoutPreference } from "@/lib/useLayoutPreference";
import { useHourlyProfiles } from "@/lib/useHourlyProfiles";

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

const REFRESH_MS = 30000;

export default function MarketMovers() {
  const [direction, setDirection] = useState<Direction>("gains");
  const [items, setItems] = useState<MoverItem[]>([]);
  const [loading, setLoading] = useState(true);
  const layout = useLayoutPreference();
  const profiles = useHourlyProfiles(layout === "list" ? items.map((i) => i.slug) : []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function load() {
      try {
        const res = await fetch(`/api/movers?direction=${direction}&limit=8`);
        const data = await res.json();
        if (!cancelled) {
          setItems(data.items ?? []);
          setLoading(false);
        }
      } catch {
        // keep showing the last known list on transient failure
      }
    }

    load();
    const interval = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [direction]);

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold text-donut-100">Market Movers</h2>
          <p className="mt-1 text-sm text-donut-300/60">Biggest 24h price swings</p>
        </div>
        <div className="flex gap-1 rounded-full bg-donut-900/60 p-1">
          <button
            onClick={() => setDirection("gains")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              direction === "gains"
                ? "bg-donut-500 text-white shadow-glow"
                : "text-donut-300/60 hover:text-donut-100"
            }`}
          >
            📈 Biggest Gains
          </button>
          <button
            onClick={() => setDirection("drops")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              direction === "drops"
                ? "bg-donut-500 text-white shadow-glow"
                : "text-donut-300/60 hover:text-donut-100"
            }`}
          >
            📉 Biggest Drops
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl border border-donut-500/10 bg-donut-900/40"
            />
          ))}
        </div>
      ) : layout === "list" ? (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <ItemListRow key={item.slug} item={item} hourlyProfile={profiles[item.slug]} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
      )}

      <div className="mt-8 flex justify-center">
        <Link
          href="/market_mover"
          className="rounded-full border border-donut-500/30 bg-donut-900/60 px-6 py-2.5 text-sm font-medium text-donut-200 transition-colors hover:border-donut-accent/60 hover:text-donut-accent"
        >
          See more →
        </Link>
      </div>
    </section>
  );
}
