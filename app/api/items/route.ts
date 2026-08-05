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

interface RankedRow {
  slug: string;
  price: number;
  rank: number;
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const category = request.nextUrl.searchParams.get("category");
  const excludeSlug = request.nextUrl.searchParams.get("exclude");
  const limit = Math.min(100, Number(request.nextUrl.searchParams.get("limit")) || 8);
  const offset = Math.max(0, Number(request.nextUrl.searchParams.get("offset")) || 0);
  // "full" mode paginates the whole catalog sorted by price (for the
  // /most_expensive browse page); otherwise this returns every matching
  // item at once (search results, category filters, homepage previews).
  const full = request.nextUrl.searchParams.get("full") === "1";

  let items = q ? searchCatalog(q, limit) : catalog;
  if (category) items = items.filter((item) => item.category === category);
  if (excludeSlug) items = items.filter((item) => item.slug !== excludeSlug);
  // Categories can run into the hundreds now (e.g. "Blocks") — cap
  // non-search, non-full requests so a "similar items" strip doesn't
  // tick/fetch/rank the entire category on every poll.
  if (!full && !q) items = items.slice(0, limit);

  const slugs = full ? undefined : items.map((item) => item.slug);
  await tickPrices(full ? catalog.map((i) => i.slug) : items.map((i) => i.slug));

  if (full) {
    const { data, error } = await supabase.rpc("get_ranked_prices", { p_slugs: null });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const ranked = (data as RankedRow[]).sort((a, b) => a.rank - b.rank);
    const page = ranked.slice(offset, offset + limit);
    const results = page.map((row) => {
      const catalogItem = items.find((i) => i.slug === row.slug) ?? catalog.find((i) => i.slug === row.slug);
      return {
        slug: row.slug,
        name: catalogItem?.name ?? row.slug,
        category: catalogItem?.category ?? "Misc",
        image: `/items/${row.slug}.png`,
        price: row.price,
        rank: row.rank,
      };
    });

    return NextResponse.json({ items: results, total: ranked.length });
  }

  const [{ data: priceData, error: priceError }, { data: rankData, error: rankError }] =
    await Promise.all([
      supabase.from("current_prices").select("slug, price, ts").in("slug", slugs!),
      supabase.rpc("get_ranked_prices", { p_slugs: slugs }),
    ]);

  if (priceError) return NextResponse.json({ error: priceError.message }, { status: 500 });
  if (rankError) return NextResponse.json({ error: rankError.message }, { status: 500 });

  const prices = new Map((priceData as CurrentPriceRow[]).map((r) => [r.slug, r]));
  const ranks = new Map((rankData as RankedRow[]).map((r) => [r.slug, r.rank]));

  const results = items.map((item) => {
    const current = prices.get(item.slug);
    return {
      slug: item.slug,
      name: item.name,
      category: item.category,
      image: `/items/${item.slug}.png`,
      price: current?.price ?? item.basePrice,
      updatedAt: current?.ts ?? Date.now(),
      rank: ranks.get(item.slug),
    };
  });

  if (!q) results.sort((a, b) => b.price - a.price);

  return NextResponse.json({ items: results });
}
