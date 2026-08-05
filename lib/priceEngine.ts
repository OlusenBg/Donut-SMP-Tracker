import { supabase } from "./supabase";
import { catalog } from "./items-data";

/**
 * Advances every given item's price by one random-walk step if it's been
 * >=5s since its last tick, and logs the new price to price_history — all
 * atomically, inside the `tick_prices` Postgres function (see the
 * add_get_price_history_function / create_price_tracking_schema
 * migrations). Items ticked more recently than 5s ago are left untouched.
 *
 * There's no persistent background process driving this — serverless
 * hosting (Vercel) doesn't allow one. Instead every read calls this first
 * ("lazy tick"): real traffic keeps prices moving, and a low-frequency
 * Vercel Cron hitting /api/cron/tick is the backstop for when nobody's
 * looking.
 */
export async function tickPrices(slugs: string[]): Promise<void> {
  if (slugs.length === 0) return;
  const { error } = await supabase.rpc("tick_prices", {
    p_slugs: slugs,
    p_now: Date.now(),
  });
  if (error) throw new Error(`tick_prices failed: ${error.message}`);
}

export async function tickAllPrices(): Promise<void> {
  await tickPrices(catalog.map((item) => item.slug));
}
