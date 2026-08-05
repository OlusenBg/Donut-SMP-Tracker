"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { formatPrice, formatTime } from "@/lib/format";

type Range = "hour" | "day" | "week";

const RANGES: { key: Range; label: string }[] = [
  { key: "hour", label: "Past Hour" },
  { key: "day", label: "Today" },
  { key: "week", label: "This Week" },
];

interface Point {
  ts: number;
  price: number;
}

function CustomTooltip({ active, payload, range }: any) {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0].payload as Point;
  return (
    <div className="rounded-lg border border-donut-500/30 bg-donut-950/95 px-3 py-2 shadow-glow">
      <div className="font-mono text-sm font-semibold text-donut-accent">
        {formatPrice(point.price, "full")}
      </div>
      <div className="text-xs text-donut-300/60">{formatTime(point.ts, range)}</div>
    </div>
  );
}

export default function PriceChart({ slug }: { slug: string }) {
  const [range, setRange] = useState<Range>("hour");
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function load() {
      try {
        const res = await fetch(`/api/items/${slug}/history?range=${range}`);
        const data = await res.json();
        if (!cancelled) {
          setPoints(data.points ?? []);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [slug, range]);

  const prices = points.map((p) => p.price);
  const min = prices.length ? Math.min(...prices) : 0;
  const max = prices.length ? Math.max(...prices) : 0;
  const pad = (max - min) * 0.1 || max * 0.05 || 1;

  return (
    <div className="rounded-2xl border border-donut-500/20 bg-donut-900/40 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-lg font-semibold text-donut-100">Price History</h3>
        <div className="flex gap-1 rounded-full bg-donut-950/60 p-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                range === r.key
                  ? "bg-donut-500 text-white shadow-glow"
                  : "text-donut-300/60 hover:text-donut-100"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72 w-full">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-donut-300/50">
            Loading chart…
          </div>
        ) : points.length < 2 ? (
          <div className="flex h-full items-center justify-center text-sm text-donut-300/50">
            Not enough data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00e5ff" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#00e5ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(77,208,255,0.08)" vertical={false} />
              <XAxis
                dataKey="ts"
                tickFormatter={(ts) => formatTime(ts, range)}
                stroke="rgba(168,198,247,0.4)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                minTickGap={40}
              />
              <YAxis
                domain={[min - pad, max + pad]}
                tickFormatter={(v) => formatPrice(v)}
                stroke="rgba(168,198,247,0.4)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={64}
              />
              <Tooltip content={<CustomTooltip range={range} />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#00e5ff"
                strokeWidth={2}
                fill="url(#priceFill)"
                animationDuration={300}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
