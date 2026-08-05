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

  const [{ data: current, error }, { data: rankData, error: rankError }] = await Promise.all([
    supabase
      .from("current_prices")
      .select("price, ts")
      .eq("slug", item.slug)
      .maybeSingle<{ price: number; ts: number }>(),
    supabase.rpc("get_ranked_prices", { p_slugs: [item.slug] }),
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (rankError) {
    return NextResponse.json({ error: rankError.message }, { status: 500 });
  }

  const rank = (rankData as { slug: string; price: number; rank: number }[] | null)?.[0]?.rank;

  return NextResponse.json({
    slug: item.slug,
    name: item.name,
    category: item.category,
    image: `/items/${item.slug}.png`,
    price: current?.price ?? item.basePrice,
    updatedAt: current?.ts ?? Date.now(),
    rank,
  });
}
