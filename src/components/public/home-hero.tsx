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
            Scène — Musiques actuelles — Pyrénées-Orientales
          </p>
          <p className="m-0 flex animate-up items-center gap-[9px] font-mono text-[12px] tracking-[0.16em] text-nautilus-gray [animation-delay:.1s]">
            <span className="inline-block h-[7px] w-[7px] animate-blink rounded-full bg-nautilus-green" />
            3 salles · 924 artistes accueillis
          </p>
        </div>

        <h1 className="display m-0 text-[clamp(58px,12.5vw,188px)]">
          <span className="block animate-up [animation-delay:.12s]">
            Ce qui vous
          </span>
          <span className="block animate-up text-nautilus-gold [animation-delay:.22s]">
            attend ce soir<span className="text-nautilus-white">.</span>
          </span>
        </h1>

        <div className="mt-[46px] grid grid-cols-1 items-end gap-[34px] lg:grid-cols-[1.55fr_1fr]">
          {/* Featured */}
          <Link
            href={featured ? `/events/${featured.slug}` : "/events"}
            data-hov
            className="group relative block animate-up overflow-hidden rounded-[14px] bg-nautilus-card [animation-delay:.3s] aspect-[16/10]"
          >
            {featured?.coverImage ? (
              <Image
                src={featured.coverImage}
                alt={featured.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 800px"
                className="duo object-cover group-hover:scale-[1.05]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-nautilus-muted to-nautilus-dark">
                <Music2 className="h-12 w-12 text-nautilus-gold/40" />
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent to-60%" />

            <div className="absolute left-4 top-4 flex gap-2">
              <span className="rounded-full bg-nautilus-gold px-[11px] py-[6px] font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-nautilus-black">
                À l&apos;affiche
              </span>
            </div>

            <div className="absolute inset-x-5 bottom-[18px] flex items-end justify-between gap-4">
              <div>
                <p className="m-0 mb-[6px] font-mono text-[12px] tracking-[0.14em] text-nautilus-gold-light [text-shadow:0_1px_10px_rgba(0,0,0,0.8)]">
                  {featured
                    ? `${featured.dateLabel} · ${featured.venueName}`
                    : "Toute la programmation"}
                </p>
                <h2 className="display media-title m-0 text-[clamp(30px,5vw,60px)] [text-shadow:0_2px_24px_rgba(0,0,0,0.6)]">
                  {featured?.title ?? "Découvrir l'agenda"}
                </h2>
                {featured && (
                  <p className="media-text mt-[6px] text-[14px]">
                    {featured.category}
                  </p>
                )}
              </div>
              <span className="grid h-[58px] w-[58px] flex-none place-items-center rounded-full border border-nautilus-gold text-[22px] text-nautilus-gold">
                ↗
              </span>
            </div>
          </Link>

          {/* Intro + CTAs + stats */}
          <div className="animate-up [animation-delay:.42s]">
            <p className="m-0 mb-[26px] text-[clamp(16px,1.4vw,19px)] leading-[1.55] text-nautilus-cream text-pretty">
              Trois salles, une programmation qui ne dort jamais. Concerts,
              résidences, ateliers&nbsp;: le Nautilus fait vivre les musiques
              actuelles au cœur du territoire.
            </p>
            <div className="mb-[30px] flex flex-wrap gap-3">
              <Link
                href="/events"
                data-hov
                className="inline-flex items-center gap-[10px] rounded-full bg-nautilus-gold px-6 py-[14px] text-[15px] font-bold text-nautilus-black transition-colors hover:bg-nautilus-gold-light"
              >
                Voir l&apos;agenda <span className="text-[17px]">→</span>
              </Link>
              <Link
                href="/venues"
                data-hov
                className="inline-flex items-center gap-[10px] rounded-full border border-nautilus-border-strong px-6 py-[14px] text-[15px] font-semibold transition-colors hover:border-nautilus-gold hover:text-nautilus-gold"
              >
                Nos salles
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-[14px] border-t border-nautilus-border pt-5">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="m-0 font-display text-[30px] leading-none text-nautilus-gold">
                    {s.value}
                  </p>
                  <p className="mt-[5px] font-mono text-[10.5px] uppercase tracking-[0.08em] text-nautilus-gray">
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
