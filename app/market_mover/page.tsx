import Navbar from "@/components/Navbar";
import MarketMoverBrowser from "@/components/MarketMoverBrowser";

export const metadata = {
  title: "Market Movers — Donut SMP Tracker",
};

export default function MarketMoverPage() {
  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="font-display text-4xl font-bold text-donut-100">Market Movers</h1>
        <p className="mt-2 text-donut-300/60">
          Every tracked item, ranked by 24-hour price change.
        </p>
        <div className="mt-10">
          <MarketMoverBrowser />
        </div>
      </div>
    </main>
  );
}
