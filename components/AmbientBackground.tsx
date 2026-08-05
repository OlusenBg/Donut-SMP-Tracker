/** Slow-drifting blurred gradient blobs behind the whole site. Fixed +
 * pointer-events-none so it never interferes with scrolling or clicks;
 * animations are disabled site-wide for prefers-reduced-motion via the
 * global rule in globals.css. */
export default function AmbientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -left-40 -top-40 h-[36rem] w-[36rem] rounded-full bg-donut-500/25 blur-[110px] animate-blob-a" />
      <div className="absolute -right-40 top-1/3 h-[30rem] w-[30rem] rounded-full bg-donut-accent/15 blur-[110px] animate-blob-b" />
      <div className="absolute bottom-0 left-1/3 h-[28rem] w-[28rem] rounded-full bg-donut-600/20 blur-[110px] animate-blob-c" />
    </div>
  );
}
