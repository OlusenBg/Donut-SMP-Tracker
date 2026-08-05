import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensurePriceEngineStarted } from "@/lib/priceEngine";
import { catalog, searchCatalog } from "@/lib/items-data";

export const dynamic = "force-dynamic";

interface CurrentPriceRow {
  slug: string;
  price: number;
  ts: number;
}

function getCurrentPrices(): Map<string, CurrentPriceRow> {
  const rows = db
    .prepare("SELECT slug, price, ts FROM current_prices")
    .all() as CurrentPriceRow[];
  return new Map(rows.map((r) => [r.slug, r]));
}

export async function GET(request: NextRequest) {
  ensurePriceEngineStarted();

  const q = request.nextUrl.searchParams.get("q") ?? "";
  const items = q ? searchCatalog(q, 8) : catalog;
  const prices = getCurrentPrices();

  const results = items.map((item) => {
    const current = prices.get(item.slug);
    return {
      slug: item.slug,
      name: item.name,
      category: item.category,
      image: `/items/${item.slug}.png`,
      price: current?.price ?? item.basePrice,
      updatedAt: current?.ts ?? Date.now(),
    };
  });

  if (!q) results.sort((a, b) => b.price - a.price);

  return NextResponse.json({ items: results });
}
