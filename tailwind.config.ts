import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Each shade reads from a CSS variable (defined per-theme in
        // globals.css) so switching themes recolors every existing
        // bg-donut-*/text-donut-*/border-donut-* usage across the app
        // without touching component code. The rgb(var(...) / <alpha-value>)
        // form is Tailwind's documented pattern for keeping opacity
        // modifiers (e.g. bg-donut-500/20) working with CSS-variable colors.
        donut: {
          950: "rgb(var(--donut-950) / <alpha-value>)",
          900: "rgb(var(--donut-900) / <alpha-value>)",
          850: "rgb(var(--donut-850) / <alpha-value>)",
          800: "rgb(var(--donut-800) / <alpha-value>)",
          700: "rgb(var(--donut-700) / <alpha-value>)",
          600: "rgb(var(--donut-600) / <alpha-value>)",
          500: "rgb(var(--donut-500) / <alpha-value>)",
          400: "rgb(var(--donut-400) / <alpha-value>)",
          300: "rgb(var(--donut-300) / <alpha-value>)",
          200: "rgb(var(--donut-200) / <alpha-value>)",
          100: "rgb(var(--donut-100) / <alpha-value>)",
          glow: "rgb(var(--donut-glow) / <alpha-value>)",
          accent: "rgb(var(--donut-accent) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 25px rgb(var(--donut-glow) / 0.35)",
        "glow-lg": "0 0 60px rgb(var(--donut-glow) / 0.25)",
      },
      keyframes: {
        "marquee-left": {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-right": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        "blob-a": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(6rem, 4rem) scale(1.15)" },
          "66%": { transform: "translate(-3rem, 6rem) scale(0.9)" },
        },
        "blob-b": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(-5rem, 5rem) scale(0.9)" },
          "66%": { transform: "translate(-6rem, -3rem) scale(1.1)" },
        },
        "blob-c": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(4rem, -5rem) scale(1.2)" },
        },
      },
      animation: {
        "marquee-left": "marquee-left 40s linear infinite",
        "marquee-right": "marquee-right 55s linear infinite",
        float: "float 4s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "blob-a": "blob-a 22s ease-in-out infinite",
        "blob-b": "blob-b 26s ease-in-out infinite",
        "blob-c": "blob-c 19s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
