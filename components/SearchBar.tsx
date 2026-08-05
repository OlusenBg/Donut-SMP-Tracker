"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatPrice } from "@/lib/format";

interface SearchResult {
  slug: string;
  name: string;
  category: string;
  image: string;
  price: number;
}

export default function SearchBar({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setOpen(false);
      return;
    }
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(`/api/items?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.items ?? []);
        setOpen(true);
        setActiveIndex(-1);
      } catch {
        // ignore transient fetch errors
      }
    }, 150);
    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function goToItem(slug: string) {
    setOpen(false);
    setQuery("");
    router.push(`/item/${slug}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      const pick = results[activeIndex] ?? results[0];
      if (pick) goToItem(pick.slug);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className={`relative w-full ${compact ? "max-w-sm" : "max-w-xl"}`}>
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-donut-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M17 10.5A6.5 6.5 0 114 10.5a6.5 6.5 0 0113 0z"
          />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          type="text"
          placeholder="Search items… try “diam” or “elytra”"
          className="w-full rounded-full bg-donut-900/80 border border-donut-500/30 pl-11 pr-4 py-3 text-sm text-donut-100 placeholder:text-donut-300/50 outline-none focus:border-donut-accent focus:shadow-glow transition-shadow"
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-donut-500/30 bg-donut-900/95 backdrop-blur-md shadow-glow-lg overflow-hidden">
          {results.map((item, i) => (
            <button
              key={item.slug}
              onClick={() => goToItem(item.slug)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                i === activeIndex ? "bg-donut-500/20" : "hover:bg-donut-500/10"
              } ${i !== results.length - 1 ? "border-b border-donut-500/10" : ""}`}
            >
              <div className="h-9 w-9 flex-shrink-0 rounded-lg bg-donut-800/60 p-1.5">
                <Image
                  src={item.image}
                  alt=""
                  width={36}
                  height={36}
                  unoptimized
                  className="pixelated h-full w-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-medium text-donut-100">{item.name}</div>
                <div className="text-xs text-donut-300/70">{item.category}</div>
              </div>
              <div className="font-mono text-sm text-donut-accent">
                {formatPrice(item.price)}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
