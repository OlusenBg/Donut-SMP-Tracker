export type RarityTier = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

interface RarityStyle {
  tier: RarityTier;
  textClass: string;
  bgClass: string;
  borderClass: string;
}

// Bucketed by basePrice (not live price) so a badge never flips tiers as
// the price ticks near a boundary.
const THRESHOLDS: { max: number; tier: RarityTier }[] = [
  { max: 50_000, tier: "Common" },
  { max: 500_000, tier: "Uncommon" },
  { max: 5_000_000, tier: "Rare" },
  { max: 50_000_000, tier: "Epic" },
  { max: Infinity, tier: "Legendary" },
];

const STYLES: Record<RarityTier, Omit<RarityStyle, "tier">> = {
  Common: {
    textClass: "text-slate-300",
    bgClass: "bg-slate-500/20",
    borderClass: "border-slate-400/40",
  },
  Uncommon: {
    textClass: "text-emerald-300",
    bgClass: "bg-emerald-500/20",
    borderClass: "border-emerald-400/40",
  },
  Rare: {
    textClass: "text-sky-300",
    bgClass: "bg-sky-500/20",
    borderClass: "border-sky-400/40",
  },
  Epic: {
    textClass: "text-purple-300",
    bgClass: "bg-purple-500/20",
    borderClass: "border-purple-400/40",
  },
  Legendary: {
    textClass: "text-amber-300",
    bgClass: "bg-amber-500/20",
    borderClass: "border-amber-400/40",
  },
};

export function getRarity(basePrice: number): RarityStyle {
  const tier = THRESHOLDS.find((t) => basePrice <= t.max)!.tier;
  return { tier, ...STYLES[tier] };
}
