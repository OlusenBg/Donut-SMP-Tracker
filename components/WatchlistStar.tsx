"use client";

import { useEffect, useState } from "react";
import { isWatched, subscribeWatchlist, toggleWatched } from "@/lib/watchlist";

export default function WatchlistStar({
  slug,
  size = "sm",
  stacked = false,
  inline = false,
}: {
  slug: string;
  size?: "sm" | "md";
  /** Set when a RankBadge already occupies the top-right corner, so this
   * renders just below it instead of overlapping. Ignored when inline. */
  stacked?: boolean;
  /** Renders in normal flow instead of as an absolute corner overlay, for
   * use in list rows rather than tile cards. */
  inline?: boolean;
}) {
  const [watched, setWatched] = useState(false);

  useEffect(() => {
    setWatched(isWatched(slug));
    return subscribeWatchlist(() => setWatched(isWatched(slug)));
  }, [slug]);

  const dimension = size === "md" ? "h-9 w-9" : "h-7 w-7";
  const iconSize = size === "md" ? "h-5 w-5" : "h-4 w-4";
  const topOffset = stacked ? (size === "md" ? "top-11" : "top-9") : "top-2";
  const position = inline ? "" : `absolute right-2 ${topOffset} z-10 backdrop-blur-sm`;

  return (
    <button
      type="button"
      aria-label={watched ? "Remove from watchlist" : "Add to watchlist"}
      aria-pressed={watched}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setWatched(toggleWatched(slug));
      }}
      className={`${position} flex flex-shrink-0 ${dimension} items-center justify-center rounded-full border transition-colors ${
        watched
          ? "border-amber-400/50 bg-amber-500/20 text-amber-300"
          : "border-donut-500/20 bg-donut-950/50 text-donut-300/60 hover:text-amber-300"
      }`}
    >
      <svg viewBox="0 0 24 24" className={iconSize} fill={watched ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.75}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.8L12 3.5z"
        />
      </svg>
    </button>
  );
}
