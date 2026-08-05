import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function NotFound() {
  return (
    <main>
      <Navbar />
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-6 py-32 text-center">
        <span className="text-6xl">🍩</span>
        <h1 className="font-display text-3xl font-bold text-donut-100">
          That listing doesn&apos;t exist
        </h1>
        <p className="text-donut-300/60">
          No item on the auction house matches this page. It may have been renamed
          or never existed.
        </p>
        <Link
          href="/"
          className="mt-2 rounded-full bg-donut-500 px-5 py-2.5 text-sm font-medium text-white shadow-glow transition-colors hover:bg-donut-400"
        >
          Back to the tracker
        </Link>
      </div>
    </main>
  );
}
