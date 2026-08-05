import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { tickPrices } from "@/lib/priceEngine";
import { getItem } from "@/lib/items-data";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } },
) {
  const item = getItem(params.slug);
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  await tickPrices([item.slug]);

  const { data: current, error } = await supabase
    .from("current_prices")
    .select("price, ts")
    .eq("slug", item.slug)
    .maybeSingle<{ price: number; ts: number }>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    slug: item.slug,
    name: item.name,
    category: item.category,
    image: `/items/${item.slug}.png`,
    price: current?.price ?? item.basePrice,
    updatedAt: current?.ts ?? Date.now(),
  });
}
