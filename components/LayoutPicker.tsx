"use client";

import { useEffect, useState } from "react";
import { getItem } from "@/lib/items-data";
import { getLayout, setLayout as persistLayout, LAYOUTS, Layout } from "@/lib/preferences";
import ItemCard from "./ItemCard";
import ItemListRow from "./ItemListRow";

// A representative fake profile so the list preview's trade heatmap has
// something to render without a network call — picker previews aren't
// tied to real data.
const EXAMPLE_PROFILE = Array.from({ length: 24 }, (_, hour) => ({
  hour,
  avgPrice: 40_000_000 + Math.sin((hour / 24) * Math.PI * 2) * 6_000_000,
}));

export default function LayoutPicker() {
  const [selected, setSelected] = useState<Layout>("tiles");

  useEffect(() => {
    setSelected(getLayout());
  }, []);

  function choose(layout: Layout) {
    setSelected(layout);
    persistLayout(layout);
  }

  const elytra = getItem("elytra");
  const exampleItem = {
    slug: "elytra",
    name: elytra?.name ?? "Elytra",
    category: elytra?.category ?? "Rare",
    image: "/items/elytra.png",
    price: elytra?.basePrice ?? 45_000_000,
    rank: 5,
  };

  return (
    // Stacked, not side-by-side — the list row needs real width to show
    // its columns properly (its "md:" breakpoint reacts to viewport
    // width, not this container, so squeezing it into a half-width
    // column would misrepresent how it actually looks).
    <div className="flex flex-col gap-3">
      {LAYOUTS.map((l) => (
        // A <div role="button"> rather than a real <button> — the preview
        // below nests an <ItemCard>/<ItemListRow>, both of which render as
        // <Link> (an <a>). Anchors nested inside a <button> are invalid
        // HTML; browsers repair that during parsing, which desyncs the
        // server-rendered DOM from what React expects and causes hydration
        // errors. tabIndex/onKeyDown keep it keyboard-accessible.
        <div
          key={l.value}
          role="button"
          tabIndex={0}
          onClick={() => choose(l.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              choose(l.value);
            }
          }}
          className={`cursor-pointer rounded-2xl border p-4 text-left transition-all ${
            selected === l.value
              ? "border-donut-accent bg-donut-900/70 shadow-glow"
              : "border-donut-500/20 bg-donut-900/40 hover:border-donut-accent/50"
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-donut-100">{l.label}</span>
            {selected === l.value && (
              <span className="text-xs font-semibold text-donut-accent">Selected</span>
            )}
          </div>
          <div className={`pointer-events-none ${l.value === "tiles" ? "max-w-[220px]" : ""}`}>
            {l.value === "tiles" ? (
              <ItemCard item={exampleItem} />
            ) : (
              <ItemListRow item={exampleItem} hourlyProfile={EXAMPLE_PROFILE} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
