import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_SLUGS = 60;

export async function GET(request: NextRequest) {
  const slugsParam = request.nextUrl.searchParams.get("slugs") ?? "";
  const slugs = slugsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_SLUGS);

  if (slugs.length === 0) {
    return NextResponse.json({ profiles: {} });
  }

  const tzOffsetParam = request.nextUrl.searchParams.get("tzOffset");
  const tzOffsetMinutes = tzOffsetParam ? parseInt(tzOffsetParam, 10) : 0;
  const since = Date.now() - WEEK_MS;

  const { data, error } = await supabase.rpc("get_hourly_profile_batch", {
    p_slugs: slugs,
    p_since: since,
    p_tz_offset_minutes: Number.isFinite(tzOffsetMinutes) ? tzOffsetMinutes : 0,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const profiles: Record<string, { hour: number; avgPrice: number }[]> = {};
  for (const row of data as { slug: string; hour: number; avg_price: number }[]) {
    (profiles[row.slug] ??= []).push({ hour: row.hour, avgPrice: row.avg_price });
  }

  return NextResponse.json({ profiles });
}
