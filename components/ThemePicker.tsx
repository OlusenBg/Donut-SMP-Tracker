"use client";

import { useEffect, useState } from "react";
import { getTheme, setTheme as persistTheme, THEMES, Theme } from "@/lib/preferences";

const SWATCHES: Record<Theme, string[]> = {
  donut: ["#04102b", "#1e4fb8", "#00e5ff"],
  dark: ["#111113", "#3f3f46", "#f4f4f5"],
  sprinkles: ["#2b0a1f", "#d63384", "#ff4fa3"],
};

export default function ThemePicker() {
  const [selected, setSelected] = useState<Theme>("donut");

  useEffect(() => {
    setSelected(getTheme());
  }, []);

  function choose(theme: Theme) {
    setSelected(theme);
    persistTheme(theme);
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {THEMES.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => choose(t.value)}
          className={`rounded-2xl border p-4 text-left transition-all ${
            selected === t.value
              ? "border-donut-accent bg-donut-900/70 shadow-glow"
              : "border-donut-500/20 bg-donut-900/40 hover:border-donut-accent/50"
          }`}
        >
          <div className="flex gap-1.5">
            {SWATCHES[t.value].map((color, i) => (
              <span
                key={i}
                className="h-8 flex-1 rounded-lg"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm font-medium text-donut-100">{t.label}</span>
            {selected === t.value && (
              <span className="text-xs font-semibold text-donut-accent">Selected</span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
