export default function RankBadge({ rank, size = "sm" }: { rank: number; size?: "sm" | "md" }) {
  const sizeClass = size === "md" ? "text-[11px] px-2 py-1" : "text-[9px] px-1.5 py-0.5";

  return (
    <span
      className={`absolute right-2 top-2 z-10 rounded-full border border-donut-500/30 bg-donut-950/70 font-mono font-semibold text-donut-200 backdrop-blur-sm ${sizeClass}`}
    >
      #{rank}
    </span>
  );
}
