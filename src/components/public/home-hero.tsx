"use client";

import Link from "next/link";
import Image from "next/image";
import { Music2 } from "lucide-react";

export type HeroFeatured = {
  slug: string;
  title: string;
  dateLabel: string;
  venueName: string;
  category: string;
  coverImage: string | null;
};

const stats = [
  { value: "358", label: "événements / an" },
  { value: "12 273", label: "spectateurs" },
  { value: "65", label: "soirées gratuites" },
];

export function HomeHero({ featured }: { featured: HeroFeatured | null }) {
  return (
    <section className="relative px-7 pb-[70px] pt-[158px]">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-[26px] flex flex-wrap items-end justify-between gap-5">
          <p className="kicker m-0 animate-up [animation-delay:.05s]">
            Scène — Musiques actuelles — Perpignan
          </p>
          <p className="m-0 flex animate-up items-center gap-[9px] font-mono text-[12px] tracking-[0.16em] text-nautilus-gray [animation-delay:.1s]">
            <span className="inline-block h-[7px] w-[7px] animate-blink rounded-full bg-nautilus-green" />
            3 salles · 924 artistes accueillis
          </p>
        </div>

        <h1 className="display m-0 text-[clamp(58px,12.5vw,188px)]">
          <span className="block animate-up [animation-delay:.12s]">
            Ce qui <span className="text-outline">vous</span>
          </span>
          <span className="block animate-up [animation-delay:.22s]">
            <span className="accent-serif text-nautilus-gold">attend</span>{" "}
            ce soir<span className="text-nautilus-gold">.</span>
          </span>
        </h1>

        <div className="mt-[52px] grid grid-cols-1 items-end gap-[38px] lg:grid-cols-[1.55fr_1fr]">
          {/* Featured — l'affiche punaisée */}
          <div className="relative animate-up [animation-delay:.3s]">
            <Link
              href={featured ? `/events/${featured.slug}` : "/events"}
              data-hov
              className="group relative block overflow-hidden poster-frame hard-shadow aspect-[16/10] rotate-[-1.2deg] transition-transform duration-300 hover:rotate-0"
            >
              {featured?.coverImage ? (
                <Image
                  src={featured.coverImage}
                  alt={featured.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 800px"
                  className="duo object-cover group-hover:scale-[1.04]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-nautilus-muted">
                  <Music2 className="h-12 w-12 text-nautilus-gold/40" />
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent to-60%" />

              <div className="absolute inset-x-5 bottom-[18px] flex items-end justify-between gap-4">
                <div>
                  <p className="m-0 mb-[8px]">
                    <span className="media-chip inline-block px-[10px] py-[5px] font-mono text-[11px] font-bold uppercase tracking-[0.12em]">
                      {featured
                        ? `${featured.dateLabel} · ${featured.venueName}`
                        : "Toute la programmation"}
                    </span>
                  </p>
                  <h2 className="display media-title m-0 text-[clamp(30px,5vw,60px)] [text-shadow:0_2px_24px_rgba(0,0,0,0.6)]">
                    {featured?.title ?? "Découvrir l'agenda"}
                  </h2>
                  {featured && (
                    <p className="media-text mt-[7px] font-mono text-[12px] uppercase tracking-[0.1em]">
                      {featured.category}
                    </p>
                  )}
                </div>
                <span className="grid h-[58px] w-[58px] flex-none place-items-center border-2 border-[#f4f1ea] bg-[#191713] text-[22px] text-[#f4f1ea] transition-colors group-hover:bg-nautilus-gold">
                  ↗
                </span>
              </div>
            </Link>

            {/* Sticker collé par-dessus le cadre */}
            <span className="sticker absolute -left-3 -top-4 z-10 rotate-[-6deg] text-[12px]">
              À l&apos;affiche ✦
            </span>
          </div>

          {/* Intro + CTAs + stats */}
          <div className="animate-up [animation-delay:.42s]">
            <p className="m-0 mb-[26px] text-[clamp(16px,1.4vw,19px)] leading-[1.55] text-nautilus-cream text-pretty">
              Trois salles, une programmation qui ne dort jamais. Concerts,
              résidences, ateliers&nbsp;: le Nautilus fait vivre les musiques
              actuelles au cœur du territoire.
            </p>
            <div className="mb-[34px] flex flex-wrap gap-4">
              <Link href="/events" data-hov className="btn-stamp text-[15px]">
                Voir l&apos;agenda <span className="text-[17px]">→</span>
              </Link>
              <Link
                href="/venues"
                data-hov
                className="btn-stamp btn-stamp--ghost text-[15px]"
              >
                Nos salles
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-[10px]">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className={`border-2 border-nautilus-ink p-[12px_14px] ${
                    i === 1 ? "rotate-[1deg]" : i === 2 ? "rotate-[-1deg]" : ""
                  }`}
                >
                  <p className="m-0 font-display text-[clamp(22px,2.4vw,30px)] leading-none text-nautilus-gold">
                    {s.value}
                  </p>
                  <p className="mt-[6px] font-mono text-[10.5px] uppercase tracking-[0.08em] text-nautilus-gray">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
