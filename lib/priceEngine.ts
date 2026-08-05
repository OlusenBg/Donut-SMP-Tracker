import { db, stepPrice } from "./db";
import { catalog } from "./items-data";

const TICK_MS = 5000;

declare global {
  // eslint-disable-next-line no-var
  var __donutEngineStarted: boolean | undefined;
}

function tick() {
  const insertHistory = db.prepare(
    "INSERT INTO price_history (slug, price, ts) VALUES (?, ?, ?)",
  );
  const upsertCurrent = db.prepare(
    "INSERT INTO current_prices (slug, price, ts) VALUES (?, ?, ?) " +
      "ON CONFLICT(slug) DO UPDATE SET price = excluded.price, ts = excluded.ts",
  );
  const getCurrent = db.prepare(
    "SELECT price FROM current_prices WHERE slug = ?",
  );

  const runTick = db.transaction(() => {
    const now = Date.now();
    for (const item of catalog) {
      const row = getCurrent.get(item.slug) as { price: number } | undefined;
      const current = row?.price ?? item.basePrice;
      const next = stepPrice(current, item.basePrice, item.volatility);
      insertHistory.run(item.slug, next, now);
      upsertCurrent.run(item.slug, next, now);
    }
  });

  runTick();
}

/** Idempotent — safe to call from any route module; only the first call
 * actually starts the interval (guarded via globalThis to survive Next.js
 * dev-mode hot reloads). */
export function ensurePriceEngineStarted() {
  if (global.__donutEngineStarted) return;
  global.__donutEngineStarted = true;
  setInterval(tick, TICK_MS);
}
