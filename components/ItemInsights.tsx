"use client";

import { useEffect, useState } from "react";
import { formatHour, formatPctChange, formatPrice } from "@/lib/format";

interface StatsResponse {
  change24h: { currentPrice: number; pastPrice: number; pctChange: number } | null;
  range7d: { min: number; max: number } | null;
  hourlyProfile: { hour: number; avgPrice: number }[];
}

type ViewMode = "buy" | "sell";

const GREEN = [34, 197, 94];
const ORANGE = [245, 158, 11];
const RED = [239, 68, 68];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function mixColor(a: number[], b: number[], t: number): string {
  const r = Math.round(lerp(a[0], b[0], t));
  const g = Math.round(lerp(a[1], b[1], t));
  const bl = Math.round(lerp(a[2], b[2], t));
  return `rgb(${r}, ${g}, ${bl})`;
}

/** t=0 -> green, t=0.5 -> orange, t=1 -> red */
function heatColor(t: number): string {
  const clamped = Math.min(1, Math.max(0, t));
  return clamped < 0.5
    ? mixColor(GREEN, ORANGE, clamped / 0.5)
    : mixColor(ORANGE, RED, (clamped - 0.5) / 0.5);
}

export default function ItemInsights({ slug }: { slug: string }) {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [mode, setMode] = useState<ViewMode>("buy");

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
          <HeatmapBar profile={stats.hourlyProfile} mode={mode} />
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

function HeatmapBar({
  profile,
  mode,
}: {
  profile: { hour: number; avgPrice: number }[];
  mode: ViewMode;
}) {
  const byHour = new Map(profile.map((p) => [p.hour, p.avgPrice]));
  const prices = profile.map((p) => p.avgPrice);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = max - min || 1;

  const cheapestHour = profile.reduce((a, b) => (b.avgPrice < a.avgPrice ? b : a)).hour;
  const priciestHour = profile.reduce((a, b) => (b.avgPrice > a.avgPrice ? b : a)).hour;

  const stops: string[] = [];
  for (let h = 0; h <= 24; h++) {
    const price = byHour.get(h % 24) ?? min;
    const priceT = (price - min) / span;
    // In "buy" mode, cheap=green (good), expensive=red (bad).
    // In "sell" mode that's inverted: expensive=green (good), cheap=red (bad).
    const t = mode === "buy" ? priceT : 1 - priceT;
    const pct = (h / 24) * 100;
    stops.push(`${heatColor(t)} ${pct}%`);
  }

  const goodHour = mode === "buy" ? cheapestHour : priciestHour;
  const badHour = mode === "buy" ? priciestHour : cheapestHour;

  return (
    <div>
      <div
        className="h-6 w-full rounded-full"
        style={{ background: `linear-gradient(to right, ${stops.join(", ")})` }}
      />
      <div className="mt-1.5 flex justify-between text-[10px] text-donut-300/40">
        <span>12AM</span>
        <span>6AM</span>
        <span>12PM</span>
        <span>6PM</span>
        <span>12AM</span>
      </div>
      <p className="mt-3 text-xs text-donut-300/70">
        {mode === "buy" ? (
          <>
            Historically cheapest around{" "}
            <span className="font-semibold text-emerald-400">{formatHour(goodHour)}</span>,
            priciest around{" "}
            <span className="font-semibold text-rose-400">{formatHour(badHour)}</span> — your
            local time.
          </>
        ) : (
          <>
            Historically best to sell around{" "}
            <span className="font-semibold text-emerald-400">{formatHour(goodHour)}</span>,
            worst around{" "}
            <span className="font-semibold text-rose-400">{formatHour(badHour)}</span> — your
            local time.
          </>
        )}
      </p>
    </div>
  );
}
