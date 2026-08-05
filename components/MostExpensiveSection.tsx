"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ItemCard, { ItemSummary } from "./ItemCard";
import ItemListRow from "./ItemListRow";
import { useLayoutPreference } from "@/lib/useLayoutPreference";
import { useHourlyProfiles } from "@/lib/useHourlyProfiles";

const REFRESH_MS = 5000;
const SHOW_COUNT = 12;

export default function MostExpensiveSection() {
  const [items, setItems] = useState<ItemSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const layout = useLayoutPreference();
  const profiles = useHourlyProfiles(layout === "list" ? items.map((i) => i.slug) : []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/items?full=1&limit=${SHOW_COUNT}`);
        const data = await res.json();
        if (!cancelled) {
          setItems(data.items ?? []);
          setLoading(false);
        }
      } catch {
        // keep showing last known prices on transient failure
      }
    }

    load();
    const interval = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <section id="most-expensive" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold text-donut-100">
            Most Expensive Items
          </h2>
          <p className="mt-1 text-sm text-donut-300/60">
            Lowest active listing per item · refreshes every 5 seconds
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-donut-300/60">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-glow" />
          live
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-2xl border border-donut-500/10 bg-donut-900/40"
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item, i) => (
            <ItemCard key={item.slug} item={item} rank={i} />
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Link
          href="/most_expensive"
          className="rounded-full border border-donut-500/30 bg-donut-900/60 px-6 py-2.5 text-sm font-medium text-donut-200 transition-colors hover:border-donut-accent/60 hover:text-donut-accent"
        >
          See more →
        </Link>
      </div>
    </section>
  );
}
