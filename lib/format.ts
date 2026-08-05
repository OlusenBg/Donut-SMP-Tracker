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

export function formatPctChange(pct: number): string {
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

export function formatHour(hour: number): string {
  const h = ((hour % 24) + 24) % 24;
  const period = h < 12 ? "AM" : "PM";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}${period}`;
}

export function formatTimeAgo(ts: number): string {
  const seconds = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
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
