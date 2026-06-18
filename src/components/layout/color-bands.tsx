// Decorative brand ribbons: three colored bands that run the full height of the
// page, weaving together (s'accolant) and separating (se démêlant). Purely
// decorative — fixed to the side edges, behind the content, theme-aware.

const VB_W = 60;
const VB_H = 1000;

/** Build a smooth vertical sine path that braids around the centre. */
function ribbon(phase: number, amplitude = 17, center = 30, waves = 5): string {
  const step = 12;
  let d = "";
  for (let y = 0; y <= VB_H; y += step) {
    const x = center + amplitude * Math.sin((y / VB_H) * Math.PI * waves + phase);
    d += y === 0 ? `M ${x.toFixed(1)} ${y}` : ` L ${x.toFixed(1)} ${y}`;
  }
  return d;
}

const RIBBONS = [
  { d: ribbon(0), color: "var(--band-1)" },
  { d: ribbon((2 * Math.PI) / 3), color: "var(--band-2)" },
  { d: ribbon((4 * Math.PI) / 3), color: "var(--band-3)" },
];

function Braid({ className }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      className={className}
    >
      {RIBBONS.map((r, i) => (
        <path
          key={i}
          d={r.d}
          fill="none"
          stroke={r.color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

export function ColorBands() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-y-0 left-0 right-0 z-0 overflow-hidden"
      style={{ opacity: "var(--band-opacity)" }}
    >
      <Braid className="absolute inset-y-0 left-0 h-full w-12 sm:w-16 mask-fade-y" />
      <Braid className="absolute inset-y-0 right-0 h-full w-12 sm:w-16 -scale-x-100 mask-fade-y" />
    </div>
  );
}
