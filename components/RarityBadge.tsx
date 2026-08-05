import { getRarity } from "@/lib/rarity";

export default function RarityBadge({
  basePrice,
  size = "sm",
  inline = false,
}: {
  basePrice: number;
  size?: "sm" | "md";
  /** Renders in normal flow instead of as an absolute corner overlay, for
   * use in list rows rather than tile cards. */
  inline?: boolean;
}) {
  const rarity = getRarity(basePrice);
  const sizeClass = size === "md" ? "text-[11px] px-2 py-1" : "text-[9px] px-1.5 py-0.5";
  const position = inline ? "" : "absolute left-2 top-2 z-10 backdrop-blur-sm";

  return (
    <span
      className={`${position} flex-shrink-0 rounded-full border font-semibold uppercase tracking-wide ${rarity.textClass} ${rarity.bgClass} ${rarity.borderClass} ${sizeClass}`}
    >
      {rarity.tier}
    </span>
  );
}
