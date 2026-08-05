import Link from "next/link";
import Navbar from "@/components/Navbar";
import ThemePicker from "@/components/ThemePicker";
import LayoutPicker from "@/components/LayoutPicker";

export default function ProfilePage() {
  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="text-5xl">🚧</span>
          <h1 className="font-display text-3xl font-bold text-donut-100">
            Coming soon, but here are some settings for you
          </h1>
          <p className="max-w-md text-donut-300/60">
            Linking your Donut SMP username and tracking your own listings aren&apos;t built
            yet — in the meantime, tune how the site looks and feels below.
          </p>
        </div>

        <div className="mt-12 space-y-10">
          <section>
            <h2 className="mb-4 font-display text-lg font-semibold text-donut-100">Theme</h2>
            <ThemePicker />
          </section>

          <section>
            <h2 className="mb-4 font-display text-lg font-semibold text-donut-100">Layout</h2>
            <LayoutPicker />
          </section>
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            href="/"
            className="rounded-full bg-donut-500 px-5 py-2.5 text-sm font-medium text-white shadow-glow transition-colors hover:bg-donut-400"
          >
            Back to the tracker
          </Link>
        </div>
      </div>
    </main>
  );
}
