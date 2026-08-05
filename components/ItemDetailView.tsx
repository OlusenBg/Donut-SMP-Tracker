"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { formatPrice, PriceUnit } from "@/lib/format";
import PriceChart from "./PriceChart";

export interface ItemDetail {
  slug: string;
  name: string;
  category: string;
  image: string;
  price: number;
  updatedAt: number;
}

const UNITS: { key: PriceUnit; label: string }[] = [
  { key: "auto", label: "Auto" },
  { key: "full", label: "Full" },
  { key: "k", label: "K" },
  { key: "m", label: "M" },
  { key: "b", label: "B" },
  { key: "t", label: "T" },
];

export default function ItemDetailView({ initial }: { initial: ItemDetail }) {
  const [item, setItem] = useState(initial);
  const [unit, setUnit] = useState<PriceUnit>("auto");
  const [direction, setDirection] = useState<"up" | "down" | "flat">("flat");
  const prevPrice = useRef(initial.price);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/items/${initial.slug}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setDirection(
          data.price > prevPrice.current ? "up" : data.price < prevPrice.current ? "down" : "flat",
        );
        prevPrice.current = data.price;
        setItem(data);
      } catch {
        // ignore transient errors, keep last known price
      }
    }

    const interval = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [initial.slug]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center">
        {/* Price panel — left */}
        <div className="order-2 md:order-1">
          <div className="text-xs uppercase tracking-widest text-donut-300/50">
            {item.category}
          </div>
          <h1 className="mt-1 font-display text-4xl font-bold text-donut-100">{item.name}</h1>

          <div className="mt-6 flex items-end gap-3">
            <span
              className={`font-mono text-5xl font-bold text-glow transition-colors ${
                direction === "up"
                  ? "text-emerald-400"
                  : direction === "down"
                    ? "text-rose-400"
                    : "text-donut-accent"
              }`}
            >
              {formatPrice(item.price, unit)}
            </span>
            {direction !== "flat" && (
              <span className={direction === "up" ? "text-emerald-400" : "text-rose-400"}>
                {direction === "up" ? "▲" : "▼"}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-donut-300/50">
            Lowest active listing · updates every 5s
          </p>

          <div className="mt-5 flex flex-wrap gap-1.5">
            {UNITS.map((u) => (
              <button
                key={u.key}
                onClick={() => setUnit(u.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  unit === u.key
                    ? "bg-donut-500 text-white shadow-glow"
                    : "bg-donut-900/60 text-donut-300/60 hover:text-donut-100 border border-donut-500/20"
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>

        {/* Big image — right */}
        <div className="order-1 md:order-2 flex items-center justify-center">
          <div className="relative flex h-56 w-56 items-center justify-center rounded-3xl border border-donut-500/20 bg-donut-900/50 shadow-glow-lg sm:h-72 sm:w-72">
            <Image
              src={item.image}
              alt={item.name}
              width={192}
              height={192}
              unoptimized
              className="pixelated h-2/3 w-2/3 object-contain drop-shadow-[0_10px_30px_rgba(0,229,255,0.35)]"
            />
          </div>
        </div>
      </div>

      <div className="mt-12">
        <PriceChart slug={item.slug} />
      </div>
    </div>
  );
}
