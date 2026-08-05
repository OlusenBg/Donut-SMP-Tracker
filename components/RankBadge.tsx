export default function RankBadge({
  rank,
  size = "sm",
  inline = false,
}: {
  rank: number;
  size?: "sm" | "md";
  /** Renders in normal flow instead of as an absolute corner overlay, for
   * use in list rows rather than tile cards. */
  inline?: boolean;
}) {
  const sizeClass = size === "md" ? "text-[11px] px-2 py-1" : "text-[9px] px-1.5 py-0.5";
  const position = inline ? "" : "absolute right-2 top-2 z-10 backdrop-blur-sm";

  return (
    <span
      className={`${position} flex-shrink-0 rounded-full border border-donut-500/30 bg-donut-950/70 font-mono font-semibold text-donut-200 ${sizeClass}`}
    >
      #{rank}
    </span>
  );
}
