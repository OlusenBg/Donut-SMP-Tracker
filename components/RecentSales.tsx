"use client";

import { useEffect, useState } from "react";
import { formatPrice, formatTimeAgo } from "@/lib/format";

interface Sale {
  player: string;
  price: number;
  ts: number;
}

export default function RecentSales({ slug }: { slug: string }) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [, forceTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/items/${slug}/recent-sales`);
        const data = await res.json();
        if (!cancelled) setSales(data.sales ?? []);
      } catch {
        // keep showing the last known feed on transient failure
      }
    }

    load();
    const interval = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [slug]);

  // Re-render every few seconds purely so "12s ago" labels keep counting
  // up between fetches, without needing a new network round-trip.
  useEffect(() => {
    const interval = setInterval(() => forceTick((n) => n + 1), 3000);
    return () => clearInterval(interval);
  }, []);

  if (sales.length === 0) return null;

  return (
    <div className="rounded-2xl border border-donut-500/20 bg-donut-900/40 p-5">
      <h3 className="mb-3 font-display text-lg font-semibold text-donut-100">Recent Sales</h3>
      <ul className="divide-y divide-donut-500/10">
        {sales.map((sale, i) => (
          <li key={`${sale.ts}-${i}`} className="flex items-center justify-between py-2.5 text-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-donut-500/20 text-xs font-semibold text-donut-accent">
                {sale.player.charAt(0).toUpperCase()}
              </span>
              <span className="text-donut-200">{sale.player}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-donut-accent">{formatPrice(sale.price)}</span>
              <span className="w-14 text-right text-xs text-donut-300/50">
                {formatTimeAgo(sale.ts)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
