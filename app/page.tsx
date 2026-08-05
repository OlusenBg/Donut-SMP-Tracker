import DonutLogo from "@/components/DonutLogo";
import HeroFloatingItems from "@/components/HeroFloatingItems";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import MostExpensiveSection from "@/components/MostExpensiveSection";

export default function Home() {
  return (
    <main>
      <Navbar />

      <section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-6 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(30,79,184,0.25),transparent_65%)]" />
        <HeroFloatingItems />

        <div className="relative z-10 flex flex-col items-center gap-6">
          <DonutLogo size={200} />
          <div>
            <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-donut-100 text-glow">
              DONUT<span className="text-donut-accent">SMP</span> AH TRACKER
            </h1>
            <p className="mt-3 text-donut-300/70 text-base sm:text-lg">
              Real-time-ish auction house prices. Never overpay for an elytra again.
            </p>
          </div>

          <SearchBar />

          <a
            href="#most-expensive"
            className="mt-4 flex flex-col items-center gap-1 text-donut-300/50 hover:text-donut-accent transition-colors"
          >
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <svg className="h-5 w-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>
      </section>

      <MostExpensiveSection />

      <footer className="border-t border-donut-500/10 px-6 py-10 text-center text-xs text-donut-300/40">
        Donut SMP Tracker is an unofficial fan project. Prices shown are simulated demo
        data, not pulled from any real auction house API.
      </footer>
    </main>
  );
}
