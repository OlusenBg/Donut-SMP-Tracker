import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import ItemDetailView from "@/components/ItemDetailView";
import { getItem } from "@/lib/items-data";
import { db } from "@/lib/db";
import { ensurePriceEngineStarted } from "@/lib/priceEngine";

export default function ItemPage({ params }: { params: { slug: string } }) {
  ensurePriceEngineStarted();

  const catalogItem = getItem(params.slug);
  if (!catalogItem) notFound();

  const current = db
    .prepare("SELECT price, ts FROM current_prices WHERE slug = ?")
    .get(catalogItem.slug) as { price: number; ts: number } | undefined;

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
