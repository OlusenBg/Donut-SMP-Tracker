"use client";

import { useEffect, useState } from "react";
import { hasOnboarded, setOnboarded } from "@/lib/preferences";
import ThemePicker from "./ThemePicker";
import LayoutPicker from "./LayoutPicker";

const STEPS = 3;

export default function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!hasOnboarded()) setOpen(true);
  }, []);

  function close() {
    setOnboarded();
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-donut-950/80 backdrop-blur-sm px-4">
      <div
        className={`relative w-full rounded-3xl border border-donut-500/30 bg-donut-900/95 p-6 shadow-glow-lg transition-[max-width] sm:p-8 ${
          step === 3 ? "max-w-2xl" : "max-w-lg"
        }`}
      >
        {/* Step 3 (layout picker) is wider than the other steps — it needs
            enough room for the list-layout preview row to render without
            its columns cramming together, matching the width it gets on
            the profile page. */}
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-donut-300/60 transition-colors hover:bg-donut-800/60 hover:text-donut-100"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="mb-6 flex gap-1.5">
          {Array.from({ length: STEPS }, (_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i < step ? "bg-donut-accent" : "bg-donut-800/60"
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="text-center">
            <span className="text-5xl">🍩</span>
            <h2 className="mt-4 font-display text-2xl font-bold text-donut-100">
              Welcome to Donut SMP Tracker!
            </h2>
            <p className="mt-3 text-donut-300/70">
              Let&apos;s start by customizing your experience. This can be changed in the
              profile tab!
            </p>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-display text-xl font-bold text-donut-100">
              Choose your preferred theme
            </h2>
            <div className="mt-5">
              <ThemePicker />
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="font-display text-xl font-bold text-donut-100">
              Choose your desired layout
            </h2>
            <div className="mt-5">
              <LayoutPicker />
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="rounded-full px-4 py-2 text-sm font-medium text-donut-300/60 transition-colors hover:text-donut-100"
            >
              Back
            </button>
          ) : (
            <span />
          )}

          {step < STEPS ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="rounded-full bg-donut-500 px-6 py-2.5 text-sm font-medium text-white shadow-glow transition-colors hover:bg-donut-400"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={close}
              className="rounded-full bg-donut-500 px-6 py-2.5 text-sm font-medium text-white shadow-glow transition-colors hover:bg-donut-400"
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
