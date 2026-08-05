import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensurePriceEngineStarted } from "@/lib/priceEngine";
import { getItem } from "@/lib/items-data";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } },
) {
  ensurePriceEngineStarted();

  const item = getItem(params.slug);
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const current = db
    .prepare("SELECT price, ts FROM current_prices WHERE slug = ?")
    .get(item.slug) as { price: number; ts: number } | undefined;

  return NextResponse.json({
    slug: item.slug,
    name: item.name,
    category: item.category,
    image: `/items/${item.slug}.png`,
    price: current?.price ?? item.basePrice,
    updatedAt: current?.ts ?? Date.now(),
  });
}
