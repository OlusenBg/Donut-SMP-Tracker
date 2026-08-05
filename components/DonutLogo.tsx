export default function DonutLogo({ size = 220 }: { size?: number }) {
  // Sprinkles keep a fixed multicolor palette regardless of theme — real
  // donut sprinkles are colorful, and it reads better against all three
  // themes than tying every sprinkle to a single accent color would.
  const sprinkleColors = [
    "rgb(var(--donut-accent))",
    "rgb(var(--donut-200))",
    "#ffffff",
    "rgb(var(--donut-300))",
    "rgb(var(--donut-glow))",
  ];
  const sprinkles = Array.from({ length: 22 }).map((_, i) => {
    const angle = (i / 22) * Math.PI * 2 + (i % 2 === 0 ? 0.15 : 0);
    const radius = 62 + ((i * 13) % 22);
    const x = 100 + Math.cos(angle) * radius;
    const y = 100 + Math.sin(angle) * radius;
    const rotate = (i * 47) % 360;
    const color = sprinkleColors[i % sprinkleColors.length];
    return { x, y, rotate, color, key: i };
  });

  return (
    <div className="relative animate-float" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        className="drop-shadow-[0_0_40px_rgb(var(--donut-accent)/0.45)]"
      >
        <defs>
          <radialGradient id="donutGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgb(var(--donut-glow))" stopOpacity="0.35" />
            <stop offset="100%" stopColor="rgb(var(--donut-glow))" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="donutBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(var(--donut-400))" />
            <stop offset="100%" stopColor="rgb(var(--donut-700))" />
          </linearGradient>
          <linearGradient id="donutIcing" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(var(--donut-accent))" />
            <stop offset="100%" stopColor="rgb(var(--donut-500))" />
          </linearGradient>
        </defs>

        <circle cx="100" cy="100" r="98" fill="url(#donutGlow)" />

        {/* dough ring */}
        <circle cx="100" cy="100" r="80" fill="url(#donutBody)" />
        <circle cx="100" cy="100" r="34" fill="rgb(var(--donut-950))" />

        {/* icing drip ring */}
        <path
          d="M100 24
             a76 76 0 1 1 -0.1 0 Z"
          fill="url(#donutIcing)"
          opacity="0.92"
        />
        <circle cx="100" cy="100" r="38" fill="rgb(var(--donut-950))" />

        {/* icing drips */}
        {[18, 70, 130, 200, 250, 300].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const x = 100 + Math.cos(rad) * 78;
          const y = 100 + Math.sin(rad) * 78;
          return (
            <ellipse
              key={i}
              cx={x}
              cy={y + 8}
              rx={5}
              ry={10}
              fill="rgb(var(--donut-accent))"
              opacity={0.85}
            />
          );
        })}

        {/* sprinkles */}
        {sprinkles.map((s) => (
          <rect
            key={s.key}
            x={s.x - 4}
            y={s.y - 1.3}
            width={8}
            height={2.6}
            rx={1.3}
            fill={s.color}
            transform={`rotate(${s.rotate} ${s.x} ${s.y})`}
          />
        ))}
      </svg>
    </div>
  );
}
