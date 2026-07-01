"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  /** Target number, e.g. 60386 */
  value: number;
  /** Optional suffix appended after the number, e.g. " €" */
  suffix?: string;
  /** Group thousands with a thin space (French style) */
  group?: boolean;
  duration?: number;
  className?: string;
}

const fmt = (n: number, group: boolean) =>
  group ? n.toLocaleString("fr-FR") : String(n);

export function CountUp({
  value,
  suffix = "",
  group = true,
  duration = 1400,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplay(value);
      return;
    }

    let raf = 0;
    let started = false;
    const run = (t0: number) => {
      const step = (t: number) => {
        const p = Math.min(1, (t - t0) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplay(Math.round(value * eased));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started) {
            started = true;
            run(performance.now());
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {fmt(display, group)}
      {suffix}
    </span>
  );
}
