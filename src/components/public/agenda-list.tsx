"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export type AgendaRow = {
  slug: string;
  num: string;
  date: string;
  title: string;
  genre: string;
  price: string;
  img: string | null;
};

/**
 * Editorial agenda list — big Anton rows that light up gold on hover, with a
 * cursor-following poster thumbnail (fine pointers only).
 */
export function AgendaList({ rows }: { rows: AgendaRow[] }) {
  const thumbRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const thumb = thumbRef.current;
    if (!thumb || !window.matchMedia("(pointer:fine)").matches) return;

    let tx = 0,
      ty = 0,
      cx = 0,
      cy = 0,
      active = false,
      raf: number | null = null;

    const loop = () => {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      thumb.style.left = cx + "px";
      thumb.style.top = cy + "px";
      if (active && (Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5)) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = null;
      }
    };
    const move = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", move, { passive: true });

    const rowsEls = Array.from(
      document.querySelectorAll<HTMLElement>("[data-agenda-row]")
    );
    const enters: Array<() => void> = [];
    const leaves: Array<() => void> = [];
    rowsEls.forEach((row) => {
      const enter = () => {
        const src = row.dataset.img;
        if (!src) return;
        active = true;
        thumb.src = src;
        cx = tx;
        cy = ty;
        thumb.style.opacity = "1";
        thumb.style.transform =
          "translate(-50%,-50%) scale(1) rotate(-4deg)";
        if (!raf) raf = requestAnimationFrame(loop);
      };
      const leave = () => {
        active = false;
        thumb.style.opacity = "0";
        thumb.style.transform =
          "translate(-50%,-50%) scale(.85) rotate(-4deg)";
      };
      row.addEventListener("mouseenter", enter);
      row.addEventListener("mouseleave", leave);
      enters.push(() => row.removeEventListener("mouseenter", enter));
      leaves.push(() => row.removeEventListener("mouseleave", leave));
    });

    return () => {
      window.removeEventListener("mousemove", move);
      enters.forEach((fn) => fn());
      leaves.forEach((fn) => fn());
      if (raf) cancelAnimationFrame(raf);
    };
  }, [rows]);

  return (
    <>
      <div className="mt-[18px]">
        {rows.map((ev) => (
          <Link
            key={ev.slug + ev.num}
            href={`/events/${ev.slug}`}
            data-hov
            data-agenda-row
            data-img={ev.img ?? ""}
            className="group grid grid-cols-[40px_1fr_auto] items-center gap-4 border-t border-nautilus-border py-5 transition-colors hover:bg-[linear-gradient(90deg,rgba(201,168,76,0.07),transparent)] md:grid-cols-[54px_168px_1fr_200px_110px_40px] md:gap-[18px] md:px-[6px] md:hover:pl-[18px]"
          >
            <span className="font-mono text-[13px] text-nautilus-gray-dim">
              {ev.num}
            </span>
            <span className="hidden font-mono text-[13.5px] tracking-[0.08em] text-nautilus-gold-light md:block">
              {ev.date}
            </span>
            <span className="font-display text-[clamp(22px,3.3vw,44px)] uppercase leading-[0.95] text-nautilus-white transition-colors group-hover:text-nautilus-gold">
              {ev.title}
              <span className="mt-1 block font-mono text-[11px] normal-case tracking-[0.06em] text-nautilus-gray md:hidden">
                {ev.date} · {ev.price}
              </span>
            </span>
            <span className="hidden text-[14px] text-nautilus-gray md:block">
              {ev.genre}
            </span>
            <span className="hidden text-right font-mono text-[13px] text-nautilus-cream md:block">
              {ev.price}
            </span>
            <span className="hidden justify-self-end text-[20px] text-nautilus-gray-dim transition-colors group-hover:text-nautilus-gold md:block">
              ↗
            </span>
          </Link>
        ))}
        <div className="border-t border-nautilus-border" />
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={thumbRef}
        alt=""
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[55] h-[178px] w-[248px] rounded-[10px] object-cover opacity-0 shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
        style={{
          transform: "translate(-50%,-50%) scale(.85) rotate(-4deg)",
          transition:
            "opacity .25s ease, transform .25s cubic-bezier(.16,1,.3,1)",
        }}
      />
    </>
  );
}
