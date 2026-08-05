import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { tickPrices } from "@/lib/priceEngine";
import { catalog, searchCatalog } from "@/lib/items-data";

export const dynamic = "force-dynamic";

interface CurrentPriceRow {
  slug: string;
  price: number;
  ts: number;
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const category = request.nextUrl.searchParams.get("category");
  const excludeSlug = request.nextUrl.searchParams.get("exclude");

  let items = q ? searchCatalog(q, 8) : catalog;
  if (category) items = items.filter((item) => item.category === category);
  if (excludeSlug) items = items.filter((item) => item.slug !== excludeSlug);

  const slugs = items.map((item) => item.slug);
  await tickPrices(slugs);

  const { data, error } = await supabase
    .from("current_prices")
    .select("slug, price, ts")
    .in("slug", slugs);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const prices = new Map((data as CurrentPriceRow[]).map((r) => [r.slug, r]));

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
