import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getItem } from "@/lib/items-data";
import { nameForId } from "@/lib/fakeNames";

export const dynamic = "force-dynamic";

const LIMIT = 5;

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } },
) {
  const item = getItem(params.slug);
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("price_history")
    .select("id, price, ts")
    .eq("slug", item.slug)
    .order("ts", { ascending: false })
    .limit(LIMIT);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const sales = (data as { id: number; price: number; ts: number }[]).map((row) => ({
    player: nameForId(row.id),
    price: row.price,
    ts: row.ts,
  }));

  return NextResponse.json({ slug: item.slug, sales });
}
