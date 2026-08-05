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
  main thing left (see [Current status](#current-status-prices-are-simulated)
  below).

## Current status: prices are simulated

There is no real connection to Donut SMP's auction house. Every item's price
moves via a random walk stored in Postgres (Supabase), seeded with a week of
fake history so the charts aren't empty on first load. Treat every number on
the site as placeholder data.

Swapping in real prices later means replacing the tick logic in
`tick_prices()` (a Postgres function, see the `create_price_tracking_schema`
migration) with a write from an actual AH data source, and pointing
`lib/items-catalog.json`'s `basePrice`/`volatility` fields at whatever that
source reports — the rest of the app (search, charts, formatting, the
"Most Expensive" board) doesn't need to change.

### Why prices tick server-side instead of live in a background process

This app is meant to run on Vercel, which runs Next.js API routes as
stateless serverless functions — there's no persistent process to run a
"tick every 5 seconds" timer, and no writable local disk to store a
database file on. So instead of a background loop, every read is a
**lazy tick**: `lib/priceEngine.ts` calls a Postgres function that advances
an item's price by one random-walk step if ≥5s have passed since its last
tick, atomically, before the request reads the current price. Real traffic
keeps prices moving on their own; `/api/cron/tick` + `vercel.json`'s Cron
config is a backstop that keeps ticking during dead air.

(Vercel's free Hobby tier limits Cron Jobs to once a day — the Pro plan
allows per-minute. Either way this only affects how fast prices recover
after a period of zero visitors; a site with any real traffic ticks itself.)

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
- [Supabase](https://supabase.com/) (hosted Postgres) for price history,
  accessed server-side only via the `service_role` key
- [Recharts](https://recharts.org/) for the price charts

## Getting started

1. Create a Supabase project (or use the one already provisioned for this
   repo) and copy `.env.example` to `.env.local`, filling in `SUPABASE_URL`
   and `SUPABASE_SERVICE_ROLE_KEY` from Project Settings → API. The database
   schema and seed data are applied as Supabase migrations, not by app code
   on startup — if you're starting a fresh project, run the SQL in this
   repo's migration history (or ask for it) against it once.
2. Install and run:

   ```bash
   npm install
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # ESLint
```

## Deploying

This app is set up for [Vercel](https://vercel.com/):

1. Import this GitHub repo on vercel.com (auto-detects Next.js, no config
   needed).
2. In the Vercel project's Settings → Environment Variables, add
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and (optional but
   recommended) `CRON_SECRET` — same values as `.env.local`, plus a random
   secret string of your choosing for `CRON_SECRET`.
3. Deploy. `vercel.json` already configures the Cron Job that hits
   `/api/cron/tick`.

Do **not** deploy this to a purely static host (e.g. GitHub Pages) — it has
real API routes and a database, neither of which a static host can serve.

## Project structure

```
app/                    Next.js App Router pages and API routes
  api/items/             Item list/search, item detail, and price history endpoints
  api/cron/tick/         Vercel Cron backstop endpoint
  item/[slug]/           Item detail page
components/             UI components (search bar, charts, item cards, ...)
lib/
  items-catalog.json     The item catalog: name, texture, category, base price
  supabase.ts             Server-only Supabase client (service_role key)
  priceEngine.ts          Calls the tick_prices Postgres function ("lazy tick")
  format.ts               $/K/M/B/T price formatting helpers
public/items/            Vendored Minecraft item/block textures
scripts/download-images.mjs   One-off script used to fetch the textures above
vercel.json              Cron Job config for the tick backstop
```

## Roadmap

- Let players link their Donut SMP username to track their own AH listings
  (Supabase Auth is already the natural fit for this, given the DB choice)
- Android app: an installable PWA wrapped as a signed APK via a Trusted Web
  Activity, once the site has a stable production URL
