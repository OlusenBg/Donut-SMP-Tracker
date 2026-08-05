import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { tickAllPrices } from "@/lib/priceEngine";
import { catalogBySlug } from "@/lib/items-data";

export const dynamic = "force-dynamic";

interface MoverRow {
  slug: string;
  current_price: number;
  past_price: number;
  pct_change: number;
}

interface RankedRow {
  slug: string;
  price: number;
  rank: number;
}

export async function GET(request: NextRequest) {
  const direction = request.nextUrl.searchParams.get("direction") === "drops" ? "drops" : "gains";
  const limit = Math.min(100, Number(request.nextUrl.searchParams.get("limit")) || 8);
  const offset = Math.max(0, Number(request.nextUrl.searchParams.get("offset")) || 0);

  await tickAllPrices();

  const [{ data, error }, { data: rankData, error: rankError }] = await Promise.all([
    supabase.rpc("get_price_movers", { p_hours: 24, p_slug: null }),
    supabase.rpc("get_ranked_prices", { p_slugs: null }),
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (rankError) return NextResponse.json({ error: rankError.message }, { status: 500 });

  const ranks = new Map((rankData as RankedRow[]).map((r) => [r.slug, r.rank]));

  const rows = data as MoverRow[];
  rows.sort((a, b) => (direction === "gains" ? b.pct_change - a.pct_change : a.pct_change - b.pct_change));

  const page = rows.slice(offset, offset + limit);
  const items = page.map((row) => {
    const catalogItem = catalogBySlug[row.slug];
    return {
      slug: row.slug,
      name: catalogItem?.name ?? row.slug,
      category: catalogItem?.category ?? "Misc",
      image: `/items/${row.slug}.png`,
      price: row.current_price,
      pctChange: row.pct_change,
      rank: ranks.get(row.slug),
    };
  });

  return NextResponse.json({ direction, items, total: rows.length });
}
