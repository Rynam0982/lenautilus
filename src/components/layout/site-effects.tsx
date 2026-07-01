"use client";

import { useEffect } from "react";

/**
 * Nautilus signature interactions, mounted once for the public site:
 *  - magnetic custom cursor (dot + trailing ring) on fine pointers
 *  - scroll-reveal for any [data-reveal] element
 * Both degrade gracefully (no JS / reduced-motion / touch).
 */
export function SiteEffects() {
  // ── Scroll reveal ──────────────────────────────────────────────────────────
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("reveal-on");

    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    );

    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement;
            const delay = Number(el.dataset.revealDelay ?? 0);
            window.setTimeout(() => el.classList.add("is-visible"), delay);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // ── Custom cursor ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!window.matchMedia("(pointer:fine)").matches) return;

    const dot = document.createElement("div");
    const ring = document.createElement("div");
    dot.className = "naut-cursor-dot";
    ring.className = "naut-cursor-ring";
    document.body.append(dot, ring);
    document.body.classList.add("naut-cursor");

    let mx = -100,
      my = -100,
      rx = -100,
      ry = -100,
      raf: number | null = null;

    const loop = () => {
      rx += (mx - rx) * 0.2;
      ry += (my - ry) * 0.2;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
      if (Math.abs(mx - rx) > 0.3 || Math.abs(my - ry) > 0.3) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = null;
      }
    };
    const move = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = mx + "px";
      dot.style.top = my + "px";
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const isInteractive = (t: EventTarget | null) =>
      t instanceof Element &&
      t.closest("a, button, input, textarea, select, [data-hov]");
    const over = (e: MouseEvent) => {
      if (isInteractive(e.target)) {
        ring.style.width = ring.style.height = "56px";
        ring.style.background = "rgba(201,168,76,.08)";
        dot.style.width = dot.style.height = "0px";
      }
    };
    const out = (e: MouseEvent) => {
      if (isInteractive(e.target)) {
        ring.style.width = ring.style.height = "34px";
        ring.style.background = "transparent";
        dot.style.width = dot.style.height = "7px";
      }
    };

    window.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseover", over);
    document.addEventListener("mouseout", out);

    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mouseout", out);
      if (raf) cancelAnimationFrame(raf);
      dot.remove();
      ring.remove();
      document.body.classList.remove("naut-cursor");
    };
  }, []);

  return null;
}
