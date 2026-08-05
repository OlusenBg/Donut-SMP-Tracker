import Image from "next/image";
import Link from "next/link";
import { formatPctChange, formatPrice } from "@/lib/format";
import { getItem } from "@/lib/items-data";
import RarityBadge from "./RarityBadge";
import RankBadge from "./RankBadge";
import WatchlistStar from "./WatchlistStar";
import TradeHeatmapBar from "./TradeHeatmapBar";

export interface ListRowItem {
  slug: string;
  name: string;
  category: string;
  image: string;
  price: number;
  rank?: number;
  pctChange?: number;
}

export default function ItemListRow({
  item,
  hourlyProfile,
}: {
  item: ListRowItem;
  /** Fetched in batch by the parent list, one round trip for the whole
   * visible page — see /api/items/hourly-batch. Omitted while loading. */
  hourlyProfile?: { hour: number; avgPrice: number }[];
}) {
  const basePrice = getItem(item.slug)?.basePrice ?? item.price;

  return (
    <Link
      href={`/item/${item.slug}`}
      className="flex items-center gap-4 rounded-2xl border border-donut-500/20 bg-donut-900/50 px-4 py-3 transition-all hover:border-donut-accent/60 hover:shadow-glow"
    >
      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-donut-800/60 p-2.5">
        <Image
          src={item.image}
          alt={item.name}
          width={44}
          height={44}
          unoptimized
          className="pixelated h-full w-full object-contain"
        />
      </div>

      <div className="min-w-0 flex-shrink-0 basis-40">
        <div className="truncate text-sm font-medium text-donut-100">{item.name}</div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] uppercase tracking-wide text-donut-300/50">
            {item.category}
          </span>
          <RarityBadge basePrice={basePrice} inline />
        </div>
      </div>

      <div className="hidden flex-1 items-center gap-2 md:flex">
        <span className="flex-shrink-0 text-[10px] uppercase tracking-wide text-donut-300/40">
          Best time to trade
        </span>
        {hourlyProfile && hourlyProfile.length >= 2 ? (
          <TradeHeatmapBar profile={hourlyProfile} mode="buy" compact />
        ) : (
          <div className="h-2 w-full animate-pulse rounded-full bg-donut-800/60" />
        )}
      </div>

      <div className="flex flex-shrink-0 items-center gap-4">
        <div className="text-right">
          <div className="font-mono text-sm font-semibold text-donut-accent text-glow">
            {formatPrice(item.price)}
          </div>
          {item.pctChange !== undefined && (
            <div
              className={`font-mono text-xs font-bold ${
                item.pctChange >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {formatPctChange(item.pctChange)}
            </div>
          )}
        </div>
        {item.rank !== undefined && <RankBadge rank={item.rank} inline />}
        <WatchlistStar slug={item.slug} inline />
      </div>
    </Link>
  );
}
