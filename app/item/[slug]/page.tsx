import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import ItemDetailView from "@/components/ItemDetailView";
import { getItem } from "@/lib/items-data";
import { supabase } from "@/lib/supabase";
import { tickPrices } from "@/lib/priceEngine";

export const dynamic = "force-dynamic";

export default async function ItemPage({ params }: { params: { slug: string } }) {
  const catalogItem = getItem(params.slug);
  if (!catalogItem) notFound();

  await tickPrices([catalogItem.slug]);

  const [{ data: current }, { data: rankData }] = await Promise.all([
    supabase
      .from("current_prices")
      .select("price, ts")
      .eq("slug", catalogItem.slug)
      .maybeSingle<{ price: number; ts: number }>(),
    supabase.rpc("get_ranked_prices", { p_slugs: [catalogItem.slug] }),
  ]);

  const rank = (rankData as { slug: string; price: number; rank: number }[] | null)?.[0]?.rank;

  const initial = {
    slug: catalogItem.slug,
    name: catalogItem.name,
    category: catalogItem.category,
    image: `/items/${catalogItem.slug}.png`,
    price: current?.price ?? catalogItem.basePrice,
    updatedAt: current?.ts ?? Date.now(),
    rank,
  };

  return (
    <main>
      <Navbar />
      <ItemDetailView initial={initial} />
    </main>
  );
}
