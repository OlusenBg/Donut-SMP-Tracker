import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        donut: {
          950: "#020617",
          900: "#04102b",
          850: "#061638",
          800: "#0a1e4a",
          700: "#0f2a63",
          600: "#15398a",
          500: "#1e4fb8",
          400: "#3b74e0",
          300: "#6ea0f2",
          200: "#a8c6f7",
          100: "#dbe8fd",
          glow: "#4dd0ff",
          accent: "#00e5ff",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 25px rgba(77, 208, 255, 0.35)",
        "glow-lg": "0 0 60px rgba(77, 208, 255, 0.25)",
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
