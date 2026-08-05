import Image from "next/image";
import { catalog } from "@/lib/items-data";

function Row({
  slugs,
  direction,
  duration,
  size,
}: {
  slugs: string[];
  direction: "left" | "right";
  duration: number;
  size: number;
}) {
  const doubled = [...slugs, ...slugs];
  return (
    <div className="flex w-max gap-10 opacity-70">
      <div
        className={`flex gap-10 ${
          direction === "left" ? "animate-marquee-left" : "animate-marquee-right"
        }`}
        style={{ animationDuration: `${duration}s` }}
      >
        {doubled.map((slug, i) => (
          <div
            key={`${slug}-${i}`}
            className="flex items-center justify-center rounded-xl bg-donut-800/40 border border-donut-500/20 shadow-glow"
            style={{ width: size, height: size, padding: size * 0.18 }}
          >
            <Image
              src={`/items/${slug}.png`}
              alt=""
              width={size}
              height={size}
              className="pixelated w-full h-full object-contain"
              unoptimized
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HeroFloatingItems() {
  const slugs = catalog.map((i) => i.slug);
  const rowA = slugs.filter((_, i) => i % 3 === 0);
  const rowB = slugs.filter((_, i) => i % 3 === 1);
  const rowC = slugs.filter((_, i) => i % 3 === 2);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex flex-col justify-between py-10 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]"
    >
      <Row slugs={rowA} direction="left" duration={38} size={56} />
      <Row slugs={rowB} direction="right" duration={50} size={70} />
      <Row slugs={rowC} direction="left" duration={44} size={56} />
    </div>
  );
}
