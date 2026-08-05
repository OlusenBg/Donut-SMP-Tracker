# Donut SMP Tracker

A fan-made auction house (AH) price tracker for [Donut SMP](https://www.donutsmp.net/),
a large donation-funded Minecraft survival server. It's a stock-ticker-style
website for watching what the cheapest active listing of any item is going
for, searching for items with autocomplete, and viewing price history charts.

**This is an unofficial, third-party project.** It is not affiliated with or
endorsed by Donut SMP.

## Who it's for

- **Donut SMP players/traders** who want a quick way to check roughly what an
  item (an elytra, a totem, netherite gear, enchanted books, etc.) is
  currently selling for before they buy or list one, and to see whether
  prices are trending up or down.
- **Developers** who want a starting point for a real AH tracker — the data
  layer, charting, and UI are all built; wiring up a real price feed is the
  main thing left (see [Current status](#current-status) below).

## Current status: prices are simulated

There is no real connection to Donut SMP's auction house. Every item's price
is generated server-side by a random walk that ticks every 5 seconds and is
stored in SQLite, seeded with a week of fake history so the charts aren't
empty on first load. Treat every number on the site as placeholder data.

Swapping in real prices later means replacing the random-walk tick in
`lib/priceEngine.ts` with a fetch from an actual AH data source, and pointing
`lib/items-catalog.json`'s `basePrice`/`volatility` fields at whatever that
source reports — the rest of the app (search, charts, formatting, the
"Most Expensive" board) doesn't need to change.

## Features

- **Hero section** with an original donut logo and rows of Minecraft item
  icons scrolling behind it
- **Search bar** with live autocomplete as you type (e.g. "diam" suggests
  Diamond, Diamond Block, Diamond Sword, ...)
- **Most Expensive Items** board, sorted by current price, refreshing every
  5 seconds
- **Item detail pages** with a big item icon, a price display that toggles
  between Auto / Full / K / M / B / T formatting, and a stock-chart-style
  price history graph with Past Hour / Today / This Week ranges
- 55 real Minecraft item/block textures vendored under `public/items/`

## Tech stack

- [Next.js](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) for the price
  history database
- [Recharts](https://recharts.org/) for the price charts

## Getting started

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000). A SQLite database
is created at `data/donut.db` on first run and seeded with a week of fake
price history.

Other scripts:

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # ESLint
```

## Project structure

```
app/                    Next.js App Router pages and API routes
  api/items/             Item list/search, item detail, and price history endpoints
  item/[slug]/           Item detail page
components/             UI components (search bar, charts, item cards, ...)
lib/
  items-catalog.json     The item catalog: name, texture, category, base price
  db.ts                  SQLite schema, seeding, and the random-walk price model
  priceEngine.ts         The 5-second live price tick
  format.ts              $/K/M/B/T price formatting helpers
public/items/            Vendored Minecraft item/block textures
scripts/download-images.mjs   One-off script used to fetch the textures above
```

## Roadmap

- Let players link their Donut SMP username to track their own AH listings
