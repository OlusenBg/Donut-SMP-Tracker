"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import { getItem } from "@/lib/items-data";
import RarityBadge from "./RarityBadge";
import WatchlistStar from "./WatchlistStar";

export interface ItemSummary {
  slug: string;
  name: string;
  category: string;
  image: string;
  price: number;
}

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

export default function ItemCard({
  item,
  rank,
}: {
  item: ItemSummary;
  rank?: number;
}) {
  const [flash, setFlash] = useState(false);
  const [prevPrice, setPrevPrice] = useState(item.price);
  const basePrice = getItem(item.slug)?.basePrice ?? item.price;

  useEffect(() => {
    if (item.price !== prevPrice) {
      setFlash(true);
      setPrevPrice(item.price);
      const t = setTimeout(() => setFlash(false), 700);
      return () => clearTimeout(t);
    }
  }, [item.price, prevPrice]);

  return (
    <Link
      href={`/item/${item.slug}`}
      className={`group relative flex flex-col rounded-2xl border border-donut-500/20 bg-donut-900/50 p-4 transition-all hover:-translate-y-1 hover:border-donut-accent/60 hover:shadow-glow ${
        flash ? "ring-1 ring-donut-accent/70" : ""
      }`}
    >
      {rank !== undefined && rank < 3 && (
        <span className="absolute -top-3 -left-2 z-20 text-2xl">{RANK_MEDALS[rank]}</span>
      )}
      <RarityBadge basePrice={basePrice} />
      <WatchlistStar slug={item.slug} />
      <div className="mx-auto mt-3 flex h-20 w-20 items-center justify-center rounded-xl bg-donut-800/60 p-3 group-hover:scale-105 transition-transform">
        <Image
          src={item.image}
          alt={item.name}
          width={64}
          height={64}
          unoptimized
          className="pixelated h-full w-full object-contain"
        />
      </div>
      <div className="mt-3 text-center">
        <div className="truncate text-sm font-medium text-donut-100">{item.name}</div>
        <div className="text-[11px] uppercase tracking-wide text-donut-300/50">
          {item.category}
        </div>
        <div className="mt-2 font-mono text-lg font-semibold text-donut-accent text-glow">
          {formatPrice(item.price)}
        </div>
      </div>
    </Link>
  );
}
