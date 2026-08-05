import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { tickPrices } from "@/lib/priceEngine";
import { getItem } from "@/lib/items-data";

export const dynamic = "force-dynamic";

const RANGE_MS: Record<string, number> = {
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
};

const MAX_POINTS = 240;

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } },
) {
  const item = getItem(params.slug);
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  await tickPrices([item.slug]);

  const range = request.nextUrl.searchParams.get("range") ?? "hour";
  const windowMs = RANGE_MS[range] ?? RANGE_MS.hour;
  const since = Date.now() - windowMs;

  // Downsampling happens inside get_price_history (SQL), not here — a
  // week of raw 5-minute-resolution rows (~2000) could otherwise be
  // silently truncated by PostgREST's default 1000-row response cap.
  const { data, error } = await supabase.rpc("get_price_history", {
    p_slug: item.slug,
    p_since: since,
    p_max_points: MAX_POINTS,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const points = (data as { price: number; ts: number }[]).map((r) => ({
    ts: r.ts,
    price: r.price,
  }));

  return NextResponse.json({ slug: item.slug, range, points });
}
