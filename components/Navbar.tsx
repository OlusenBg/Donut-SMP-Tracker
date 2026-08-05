import Link from "next/link";
import SearchBar from "./SearchBar";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="hidden whitespace-nowrap rounded-full border border-donut-500/20 bg-donut-900/50 px-4 py-2 text-sm font-medium text-donut-200 transition-colors hover:border-donut-accent/60 hover:text-donut-accent md:inline-flex"
    >
      {children}
    </Link>
  );
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-donut-500/20 bg-donut-950/70 backdrop-blur-md">
      <div className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 sm:grid-cols-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 justify-self-start">
          <span className="h-8 w-8 flex-shrink-0 rounded-full bg-gradient-to-br from-donut-accent to-donut-600 shadow-glow" />
          <span className="hidden sm:inline font-display font-bold tracking-wide text-donut-100">
            DONUT<span className="text-donut-accent">SMP</span>
            <span className="text-donut-300/60 font-normal"> · AH Tracker</span>
          </span>
        </Link>

        <div className="flex items-center justify-center gap-3 justify-self-center">
          <NavLink href="/market_mover">Market Movers</NavLink>
          <SearchBar compact />
          <NavLink href="/most_expensive">Most Expensive</NavLink>
        </div>

        <Link
          href="/profile"
          aria-label="Profile"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center justify-self-end rounded-full border border-donut-500/20 bg-donut-900/50 text-donut-300 transition-colors hover:border-donut-accent/60 hover:text-donut-accent"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20a7.5 7.5 0 0115 0" />
          </svg>
        </Link>
      </div>
    </header>
  );
}
