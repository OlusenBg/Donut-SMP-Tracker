"use client";

import { useEffect, useState } from "react";
import { formatPctChange, formatPrice } from "@/lib/format";
import TradeHeatmapBar, { TradeMode } from "./TradeHeatmapBar";

interface StatsResponse {
  change24h: { currentPrice: number; pastPrice: number; pctChange: number } | null;
  range7d: { min: number; max: number } | null;
  hourlyProfile: { hour: number; avgPrice: number }[];
}

export default function ItemInsights({ slug }: { slug: string }) {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [mode, setMode] = useState<TradeMode>("buy");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const tzOffset = new Date().getTimezoneOffset();
      try {
        const res = await fetch(`/api/items/${slug}/stats?tzOffset=${tzOffset}`);
        const data = await res.json();
        if (!cancelled) setStats(data);
      } catch {
        // keep showing last known stats on transient failure
      }
    }

    load();
    const interval = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [slug]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      <div className="grid grid-cols-3 gap-3 lg:col-span-2 lg:grid-cols-1">
        <StatTile
          label="24h Change"
          value={stats?.change24h ? formatPctChange(stats.change24h.pctChange) : "—"}
          tone={
            !stats?.change24h
              ? "neutral"
              : stats.change24h.pctChange > 0
                ? "up"
                : stats.change24h.pctChange < 0
                  ? "down"
                  : "neutral"
          }
        />
        <StatTile
          label="7d High"
          value={stats?.range7d ? formatPrice(stats.range7d.max) : "—"}
          tone="neutral"
        />
        <StatTile
          label="7d Low"
          value={stats?.range7d ? formatPrice(stats.range7d.min) : "—"}
          tone="neutral"
        />
      </div>

      <div className="rounded-2xl border border-donut-500/20 bg-donut-900/40 p-4 lg:col-span-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-donut-100">Best Time to Trade</h3>
          <div className="flex gap-1 rounded-full bg-donut-950/60 p-1">
            <button
              onClick={() => setMode("buy")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                mode === "buy"
                  ? "bg-donut-500 text-white shadow-glow"
                  : "text-donut-300/60 hover:text-donut-100"
              }`}
            >
              Buying
            </button>
            <button
              onClick={() => setMode("sell")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                mode === "sell"
                  ? "bg-donut-500 text-white shadow-glow"
                  : "text-donut-300/60 hover:text-donut-100"
              }`}
            >
              Selling
            </button>
          </div>
        </div>

        {stats && stats.hourlyProfile.length >= 2 ? (
          <TradeHeatmapBar profile={stats.hourlyProfile} mode={mode} />
        ) : (
          <div className="flex h-16 items-center justify-center text-xs text-donut-300/50">
            Gathering data…
          </div>
        )}
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "up" | "down" | "neutral";
}) {
  const color =
    tone === "up" ? "text-emerald-400" : tone === "down" ? "text-rose-400" : "text-donut-100";
  return (
    <div className="flex flex-col justify-center rounded-2xl border border-donut-500/20 bg-donut-900/40 px-4 py-3">
      <span className="text-[11px] uppercase tracking-wide text-donut-300/50">{label}</span>
      <span className={`font-mono text-lg font-semibold ${color}`}>{value}</span>
    </div>
  );
}
