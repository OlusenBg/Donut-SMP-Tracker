import Link from "next/link";
import SearchBar from "./SearchBar";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-donut-500/20 bg-donut-950/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="h-8 w-8 rounded-full bg-gradient-to-br from-donut-accent to-donut-600 shadow-glow" />
          <span className="hidden sm:inline font-display font-bold tracking-wide text-donut-100">
            DONUT<span className="text-donut-accent">SMP</span>
            <span className="text-donut-300/60 font-normal"> · AH Tracker</span>
          </span>
        </Link>
        <div className="flex-1 flex justify-end">
          <SearchBar compact />
        </div>
      </div>
    </header>
  );
}
