import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { tickPrices } from "@/lib/priceEngine";
import { getItem } from "@/lib/items-data";

export const dynamic = "force-dynamic";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } },
) {
  const item = getItem(params.slug);
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  await tickPrices([item.slug]);

  const tzOffsetParam = request.nextUrl.searchParams.get("tzOffset");
  const tzOffsetMinutes = tzOffsetParam ? parseInt(tzOffsetParam, 10) : 0;
  const since = Date.now() - WEEK_MS;

  const [moversRes, rangeRes, hourlyRes] = await Promise.all([
    supabase.rpc("get_price_movers", { p_hours: 24, p_slug: item.slug }),
    supabase.rpc("get_price_range", { p_slug: item.slug, p_since: since }),
    supabase.rpc("get_hourly_profile", {
      p_slug: item.slug,
      p_since: since,
      p_tz_offset_minutes: Number.isFinite(tzOffsetMinutes) ? tzOffsetMinutes : 0,
    }),
  ]);

  if (moversRes.error || rangeRes.error || hourlyRes.error) {
    const message =
      moversRes.error?.message ?? rangeRes.error?.message ?? hourlyRes.error?.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const change24h = (
    moversRes.data as {
      current_price: number;
      past_price: number;
      pct_change: number;
    }[]
  )[0];

  const range7d = (rangeRes.data as { min_price: number; max_price: number }[])[0];

  const hourlyProfile = (hourlyRes.data as { hour: number; avg_price: number }[]).map(
    (r) => ({ hour: r.hour, avgPrice: r.avg_price }),
  );

  return NextResponse.json({
    slug: item.slug,
    change24h: change24h
      ? {
          currentPrice: change24h.current_price,
          pastPrice: change24h.past_price,
          pctChange: change24h.pct_change,
        }
      : null,
    range7d: range7d ? { min: range7d.min_price, max: range7d.max_price } : null,
    hourlyProfile,
  });
}
