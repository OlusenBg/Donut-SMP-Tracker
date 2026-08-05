import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
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

  const range = request.nextUrl.searchParams.get("range") ?? "hour";
  const windowMs = RANGE_MS[range] ?? RANGE_MS.hour;
  const since = Date.now() - windowMs;

  const rows = db
    .prepare(
      "SELECT price, ts FROM price_history WHERE slug = ? AND ts >= ? ORDER BY ts ASC",
    )
    .all(item.slug, since) as { price: number; ts: number }[];

  const step = Math.max(1, Math.floor(rows.length / MAX_POINTS));
  const sampled = rows.filter((_, i) => i % step === 0);

  return NextResponse.json({
    slug: item.slug,
    range,
    points: sampled.map((r) => ({ ts: r.ts, price: r.price })),
  });
}
