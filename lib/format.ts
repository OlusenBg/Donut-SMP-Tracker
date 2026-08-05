export type PriceUnit = "auto" | "full" | "k" | "m" | "b" | "t";

const UNITS: { suffix: string; value: number }[] = [
  { suffix: "T", value: 1e12 },
  { suffix: "B", value: 1e9 },
  { suffix: "M", value: 1e6 },
  { suffix: "K", value: 1e3 },
];

export function formatCompact(value: number): string {
  for (const unit of UNITS) {
    if (Math.abs(value) >= unit.value) {
      const scaled = value / unit.value;
      const decimals = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
      return `${trimZeros(scaled.toFixed(decimals))}${unit.suffix}`;
    }
  }
  return Math.round(value).toString();
}

export function formatFull(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}

function trimZeros(s: string): string {
  return s.replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
}

export function formatPrice(value: number, unit: PriceUnit = "auto"): string {
  if (unit === "full") return `$${formatFull(value)}`;
  if (unit === "auto") return `$${formatCompact(value)}`;

  const map: Record<Exclude<PriceUnit, "auto" | "full">, number> = {
    k: 1e3,
    m: 1e6,
    b: 1e9,
    t: 1e12,
  };
  const divisor = map[unit];
  const scaled = value / divisor;
  const decimals = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
  return `$${trimZeros(scaled.toFixed(decimals))}${unit.toUpperCase()}`;
}

export function formatTime(ts: number, range: "hour" | "day" | "week"): string {
  const d = new Date(ts);
  if (range === "week") {
    return d.toLocaleDateString("en-US", { weekday: "short", hour: "numeric" });
  }
  if (range === "day") {
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  return d.toLocaleTimeString("en-US", { minute: "2-digit", second: "2-digit" });
}
