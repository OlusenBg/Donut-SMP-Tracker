import Navbar from "@/components/Navbar";
import MostExpensiveBrowser from "@/components/MostExpensiveBrowser";

export const metadata = {
  title: "Most Expensive Items — Donut SMP Tracker",
};

export default function MostExpensivePage() {
  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="font-display text-4xl font-bold text-donut-100">Most Expensive Items</h1>
        <p className="mt-2 text-donut-300/60">
          Every tracked item, ranked by its current lowest active listing.
        </p>
        <div className="mt-10">
          <MostExpensiveBrowser />
        </div>
      </div>
    </main>
  );
}
