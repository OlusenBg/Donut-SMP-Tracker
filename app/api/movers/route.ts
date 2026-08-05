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

export async function GET(request: NextRequest) {
  const direction = request.nextUrl.searchParams.get("direction") === "drops" ? "drops" : "gains";
  const limit = Math.min(20, Number(request.nextUrl.searchParams.get("limit")) || 8);

  await tickAllPrices();

  const { data, error } = await supabase.rpc("get_price_movers", { p_hours: 24, p_slug: null });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = data as MoverRow[];
  rows.sort((a, b) => (direction === "gains" ? b.pct_change - a.pct_change : a.pct_change - b.pct_change));

  const items = rows.slice(0, limit).map((row) => {
    const catalogItem = catalogBySlug[row.slug];
    return {
      slug: row.slug,
      name: catalogItem?.name ?? row.slug,
      category: catalogItem?.category ?? "Misc",
      image: `/items/${row.slug}.png`,
      price: row.current_price,
      pctChange: row.pct_change,
    };
  });

  return NextResponse.json({ direction, items });
}
