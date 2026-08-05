"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";

interface Item {
  slug: string;
  name: string;
  category: string;
  image: string;
  price: number;
}

export default function SimilarItems({
  category,
  excludeSlug,
}: {
  category: string;
  excludeSlug: string;
}) {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(
          `/api/items?category=${encodeURIComponent(category)}&exclude=${encodeURIComponent(excludeSlug)}`,
        );
        const data = await res.json();
        if (!cancelled) setItems(data.items ?? []);
      } catch {
        // keep showing the last known list on transient failure
      }
    }

    load();
    const interval = setInterval(load, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [category, excludeSlug]);

  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="mb-3 font-display text-lg font-semibold text-donut-100">
        More {category}
      </h3>
      <div className="flex gap-4 overflow-x-auto pb-3 [scrollbar-width:thin]">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/item/${item.slug}`}
            className="flex w-32 flex-shrink-0 flex-col items-center rounded-2xl border border-donut-500/20 bg-donut-900/40 p-3 transition-colors hover:border-donut-accent/60 hover:shadow-glow"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-donut-800/60 p-2">
              <Image
                src={item.image}
                alt={item.name}
                width={44}
                height={44}
                unoptimized
                className="pixelated h-full w-full object-contain"
              />
            </div>
            <div className="mt-2 w-full truncate text-center text-xs font-medium text-donut-100">
              {item.name}
            </div>
            <div className="mt-1 font-mono text-xs font-semibold text-donut-accent">
              {formatPrice(item.price)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
