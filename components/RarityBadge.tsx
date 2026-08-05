import { getRarity } from "@/lib/rarity";

export default function RarityBadge({
  basePrice,
  size = "sm",
}: {
  basePrice: number;
  size?: "sm" | "md";
}) {
  const rarity = getRarity(basePrice);
  const sizeClass = size === "md" ? "text-[11px] px-2 py-1" : "text-[9px] px-1.5 py-0.5";

  return (
    <span
      className={`absolute left-2 top-2 z-10 rounded-full border font-semibold uppercase tracking-wide backdrop-blur-sm ${rarity.textClass} ${rarity.bgClass} ${rarity.borderClass} ${sizeClass}`}
    >
      {rarity.tier}
    </span>
  );
}
