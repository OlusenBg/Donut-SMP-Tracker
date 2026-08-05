"use client";

import { useEffect, useState } from "react";
import ItemCard, { ItemSummary } from "./ItemCard";

const REFRESH_MS = 5000;
const SHOW_COUNT = 12;

export default function MostExpensiveSection() {
  const [items, setItems] = useState<ItemSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/items");
        const data = await res.json();
        if (!cancelled) {
          setItems((data.items ?? []).slice(0, SHOW_COUNT));
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
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item, i) => (
            <ItemCard key={item.slug} item={item} rank={i} />
          ))}
        </div>
      )}
    </section>
  );
}
