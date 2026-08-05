import { formatHour } from "@/lib/format";

export type TradeMode = "buy" | "sell";

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

/** t=0 -> green, t=0.5 -> orange, t=1 -> red. Fixed semantic good/bad
 * colors — intentionally not theme-driven, unlike the rest of the UI. */
function heatColor(t: number): string {
  const clamped = Math.min(1, Math.max(0, t));
  return clamped < 0.5
    ? mixColor(GREEN, ORANGE, clamped / 0.5)
    : mixColor(ORANGE, RED, (clamped - 0.5) / 0.5);
}

export function findExtremeHours(profile: { hour: number; avgPrice: number }[]) {
  const cheapestHour = profile.reduce((a, b) => (b.avgPrice < a.avgPrice ? b : a)).hour;
  const priciestHour = profile.reduce((a, b) => (b.avgPrice > a.avgPrice ? b : a)).hour;
  return { cheapestHour, priciestHour };
}

/** 24-stop gradient showing which hour of the viewer's local day an item
 * has historically been cheapest vs. priciest. `compact` drops the axis
 * labels and caption for use in dense contexts like list rows. */
export default function TradeHeatmapBar({
  profile,
  mode,
  compact = false,
}: {
  profile: { hour: number; avgPrice: number }[];
  mode: TradeMode;
  compact?: boolean;
}) {
  const byHour = new Map(profile.map((p) => [p.hour, p.avgPrice]));
  const prices = profile.map((p) => p.avgPrice);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = max - min || 1;

  const { cheapestHour, priciestHour } = findExtremeHours(profile);

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
  const gradient = `linear-gradient(to right, ${stops.join(", ")})`;

  if (compact) {
    return (
      <div
        className="h-2 w-full rounded-full"
        style={{ background: gradient }}
        title={`Best time to ${mode}: ~${formatHour(goodHour)} · Worst: ~${formatHour(badHour)} (your local time)`}
      />
    );
  }

  return (
    <div>
      <div className="h-6 w-full rounded-full" style={{ background: gradient }} />
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
