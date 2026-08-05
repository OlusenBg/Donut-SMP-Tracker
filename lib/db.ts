import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { catalog } from "./items-data";

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, "donut.db");

declare global {
  // eslint-disable-next-line no-var
  var __donutDb: Database.Database | undefined;
}

function createConnection(): Database.Database {
  const database = new Database(DB_PATH);
  // Next's build step imports every route module (in parallel, across
  // separate processes) just to inspect its exports, which independently
  // triggers this file's module-level init. Without a busy timeout, that
  // stampede fails fast with SQLITE_BUSY instead of waiting its turn.
  database.pragma("busy_timeout = 5000");
  database.pragma("journal_mode = WAL");

  database.exec(`
    CREATE TABLE IF NOT EXISTS price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL,
      price REAL NOT NULL,
      ts INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_price_history_slug_ts ON price_history(slug, ts);

    CREATE TABLE IF NOT EXISTS current_prices (
      slug TEXT PRIMARY KEY,
      price REAL NOT NULL,
      ts INTEGER NOT NULL
    );
  `);

  return database;
}

export const db: Database.Database = global.__donutDb ?? createConnection();
if (process.env.NODE_ENV !== "production") global.__donutDb = db;

// --- Random walk helpers -------------------------------------------------

function gaussianRandom(): number {
  // Box-Muller transform, roughly N(0, 1)
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/**
 * One random-walk step with mean reversion toward basePrice, so prices
 * drift and dip like a real auction house instead of wandering off forever.
 */
export function stepPrice(current: number, basePrice: number, volatility: number): number {
  const reversion = (basePrice - current) * 0.01;
  const shock = current * volatility * gaussianRandom();
  const next = current + reversion + shock;
  return Math.min(Math.max(next, basePrice * 0.15), basePrice * 4);
}

// --- Seeding --------------------------------------------------------------

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const FIVE_MIN_MS = 5 * 60 * 1000;
const FIVE_SEC_MS = 5 * 1000;

function seedIfEmpty() {
  const insertHistory = db.prepare(
    "INSERT INTO price_history (slug, price, ts) VALUES (?, ?, ?)",
  );
  const insertCurrent = db.prepare(
    "INSERT INTO current_prices (slug, price, ts) VALUES (?, ?, ?) " +
      "ON CONFLICT(slug) DO UPDATE SET price = excluded.price, ts = excluded.ts",
  );

  // The empty-check and the seed writes must happen as one atomic unit —
  // otherwise two processes started at the same moment (e.g. Next's build
  // workers) can both see an empty table and both seed, doubling every
  // item's history. `.immediate()` grabs the write lock up front so the
  // second process blocks (courtesy of the busy_timeout above) until the
  // first has committed, then reruns its own count check and finds rows
  // already there.
  const seedAll = db.transaction(() => {
    const row = db.prepare("SELECT COUNT(*) as count FROM price_history").get() as {
      count: number;
    };
    if (row.count > 0) return;

    const now = Date.now();
    for (const item of catalog) {
      const start = now - WEEK_MS;
      let price = item.basePrice * (0.8 + Math.random() * 0.4);
      let ts = start;

      // Coarse resolution for the bulk of the week.
      while (ts < now - HOUR_MS) {
        price = stepPrice(price, item.basePrice, item.volatility);
        insertHistory.run(item.slug, price, ts);
        ts += FIVE_MIN_MS;
      }

      // Fine resolution for the last hour, matching the live 5s cadence.
      while (ts <= now) {
        price = stepPrice(price, item.basePrice, item.volatility);
        insertHistory.run(item.slug, price, ts);
        ts += FIVE_SEC_MS;
      }

      insertCurrent.run(item.slug, price, now);
    }
  });

  seedAll.immediate();
}

seedIfEmpty();
