// Decorative brand backdrop: three soft colored ribbons (violet, green, yellow —
// the company colors) that flow down the whole page, weaving together (s'accolant)
// and separating (se démêlant). Purely decorative, sits behind all content as a
// subtle, theme-aware background watermark.

const VB_W = 100;
const VB_H = 1000;

/** Smooth vertical sine ribbon that sweeps across the page width. */
function ribbon(phase: number, amplitude = 30, center = 50, waves = 3.5): string {
  const step = 8;
  let d = "";
  for (let y = 0; y <= VB_H; y += step) {
    const x = center + amplitude * Math.sin((y / VB_H) * Math.PI * waves + phase);
    d += y === 0 ? `M ${x.toFixed(2)} ${y}` : ` L ${x.toFixed(2)} ${y}`;
  }
  return d;
}

const RIBBONS = [
  { d: ribbon(0), color: "var(--band-1)" },
  { d: ribbon((2 * Math.PI) / 3), color: "var(--band-2)" },
  { d: ribbon((4 * Math.PI) / 3), color: "var(--band-3)" },
];

export function ColorBands() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden mask-fade-y"
      style={{ opacity: "var(--band-opacity)" }}
    >
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
        className="h-full w-full blur-[3px]"
      >
        {RIBBONS.map((r, i) => (
          <path
            key={i}
            d={r.d}
            fill="none"
            stroke={r.color}
            strokeWidth={64}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </div>
  );
}
