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

  const { data: current } = await supabase
    .from("current_prices")
    .select("price, ts")
    .eq("slug", catalogItem.slug)
    .maybeSingle<{ price: number; ts: number }>();

  const initial = {
    slug: catalogItem.slug,
    name: catalogItem.name,
    category: catalogItem.category,
    image: `/items/${catalogItem.slug}.png`,
    price: current?.price ?? catalogItem.basePrice,
    updatedAt: current?.ts ?? Date.now(),
  };

  return (
    <main>
      <Navbar />
      <ItemDetailView initial={initial} />
    </main>
  );
}
