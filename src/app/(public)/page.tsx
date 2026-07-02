import { Suspense } from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";

import { HomeHero, type HeroFeatured } from "@/components/public/home-hero";
import { AgendaList, type AgendaRow } from "@/components/public/agenda-list";
import { VenueCard } from "@/components/public/venue-card";
import { getFeaturedEvents } from "@/services/events.service";
import { getAllVenues } from "@/services/venues.service";
import { formatPrice } from "@/lib/utils";
import type { EventCardData } from "@/types";

const ROW_DATE = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
});
const HERO_DATE = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "2-digit",
  month: "long",
});

function priceLabel(ev: EventCardData) {
  if (ev.status === "CANCELLED") return "Annulé";
  if (!ev.ticketTypes.length) return "Gratuit";
  const min = Math.min(...ev.ticketTypes.map((t) => t.price));
  return min === 0 ? "Gratuit" : formatPrice(min);
}

export default async function HomePage() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<div className="h-[80vh]" />}>
        <HomeContent />
      </Suspense>
    </div>
  );
}

async function HomeContent() {
  const [events, venues] = await Promise.all([
    getFeaturedEvents(6),
    getAllVenues(),
  ]);

  const first = events[0];
  const featured: HeroFeatured | null = first
    ? {
        slug: first.slug,
        title: first.title,
        dateLabel: HERO_DATE.format(new Date(first.startDate))
          .replace(".", "")
          .toUpperCase(),
        venueName: first.venue.name,
        category: first.categories[0] ?? "Concert",
        coverImage: first.coverImage,
      }
    : null;

  const rows: AgendaRow[] = events.map((ev, i) => ({
    slug: ev.slug,
    num: String(i + 1).padStart(2, "0"),
    date: ROW_DATE.format(new Date(ev.startDate)).replace(/\./g, "").toUpperCase(),
    title: ev.title,
    genre: ev.categories[0] ?? "Concert",
    price: priceLabel(ev),
    img: ev.coverImage,
  }));

  return (
    <>
      <HomeHero featured={featured} />

      {/* ░░ AGENDA ░░ */}
      <section className="px-7 pb-10 pt-[60px]">
        <div className="mx-auto max-w-[1320px]">
          <div
            data-reveal
            className="mb-2 flex flex-wrap items-end justify-between gap-5 border-t border-nautilus-border pt-[26px]"
          >
            <div className="flex items-baseline gap-4">
              <span className="sticker text-[12px]">01</span>
              <h2 className="display m-0 text-[clamp(38px,6vw,86px)]">
                Prochaine<span className="text-outline">ment</span>
              </h2>
            </div>
            <Link
              href="/events"
              data-hov
              className="inline-flex items-center gap-[9px] border-b-2 border-nautilus-gold pb-[3px] font-mono text-[12.5px] font-bold uppercase tracking-[0.12em] text-nautilus-gold"
            >
              Tout l&apos;agenda <span className="text-[15px]">↗</span>
            </Link>
          </div>

          {rows.length > 0 ? (
            <AgendaList rows={rows} />
          ) : (
            <p className="border-t border-nautilus-border py-16 text-center font-mono text-sm text-nautilus-gray">
              Aucune date pour le moment — revenez très vite.
            </p>
          )}
        </div>
      </section>

      {/* ░░ SALLES ░░ */}
      {venues.length > 0 && (
        <section className="px-7 py-[70px]">
          <div className="mx-auto max-w-[1320px]">
            <div
              data-reveal
              className="mb-[34px] flex items-baseline gap-4"
            >
              <span className="sticker rotate-[2deg] text-[12px]">02</span>
              <h2 className="display m-0 text-[clamp(38px,6vw,86px)]">
                Trois&nbsp;salles,{" "}
                <span className="accent-serif text-nautilus-gold">
                  une&nbsp;énergie
                </span>
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
              {venues.slice(0, 3).map((v) => (
                <div data-reveal key={v.id}>
                  <VenueCard venue={v} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <ProjetTeaser />
      <CTASection />
    </>
  );
}

function ProjetTeaser() {
  return (
    <section className="px-7 py-[70px]">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-[46px] lg:grid-cols-2">
        <div data-reveal>
          <span className="sticker rotate-[-2deg] text-[12px]">03 · Le projet</span>
          <h2 className="display m-0 my-[18px] text-[clamp(36px,4.6vw,72px)]">
            Un lieu au service du&nbsp;
            <span className="accent-serif text-nautilus-gold">territoire</span>
          </h2>
          <p className="m-0 mb-[26px] max-w-[46ch] text-[17px] leading-[1.6] text-nautilus-cream text-pretty">
            Accompagnement des artistes locaux, des organisateurs d&apos;événements,
            sensibilisation aux métiers de la musique et diffusion des musiques
            actuelles. Une saison fondatrice qui ancre le Nautilus dans son
            territoire.
          </p>
          <div className="mb-[30px] flex flex-wrap gap-[9px]">
            {["Artistes locaux", "Organisateurs", "Métiers de la musique", "Diffusion"].map(
              (t, i) => (
                <span
                  key={t}
                  className={`border-2 border-nautilus-ink px-[13px] py-[7px] font-mono text-[11.5px] uppercase tracking-[0.06em] text-nautilus-white ${
                    i % 2 === 1 ? "rotate-[1deg]" : "rotate-[-1deg]"
                  }`}
                >
                  {t}
                </span>
              )
            )}
          </div>
          <Link
            href="/projet"
            data-hov
            className="btn-stamp btn-stamp--ghost text-[15px]"
          >
            Découvrir le projet →
          </Link>
        </div>
        <div data-reveal className="relative">
          <div
            className="poster-frame hard-shadow relative aspect-[5/6] rotate-[1.4deg] overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: "url(/images/salles/soiree.jpeg)" }}
          />
          <div className="sticker absolute -bottom-[24px] -right-[12px] rotate-[-3deg] px-[22px] py-[16px] text-left normal-case shadow-[4px_4px_0_rgba(0,0,0,0.35)]">
            <p className="m-0 font-display text-[44px] leading-[0.85] tracking-normal">
              60 386 €
            </p>
            <p className="m-0 mt-[6px] font-mono text-[11px] font-bold uppercase tracking-[0.06em]">
              reversés au territoire
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="px-7 pb-20 pt-[30px]">
      <div
        data-reveal
        className="relative mx-auto max-w-[1320px] overflow-hidden border-2 border-nautilus-ink bg-nautilus-gold hard-shadow"
      >
        <div className="relative flex flex-col items-start gap-[18px] p-[clamp(40px,7vw,86px)]">
          <p className="m-0 font-mono text-[12.5px] font-bold uppercase tracking-[0.22em] text-[color:var(--paper-chip)]">
            Vous êtes artiste ou organisateur ?
          </p>
          <h2 className="display m-0 max-w-[14ch] text-[clamp(40px,7vw,104px)] text-[color:var(--paper-chip)]">
            Réservez notre{" "}
            <span className="accent-serif">scène</span>
          </h2>
          <p className="m-0 mb-2 max-w-[52ch] text-[17px] leading-[1.55] text-[color:var(--paper-chip)] opacity-90">
            Trois salles, une équipe dédiée, des conditions professionnelles. Du
            showcase intime au grand concert.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/devenir-artiste"
              data-hov
              className="btn-stamp btn-stamp--paper text-[15px] shadow-[4px_4px_0_rgba(0,0,0,0.45)] hover:shadow-[7px_7px_0_rgba(0,0,0,0.45)]"
            >
              Demander un compte artiste
            </Link>
            <Link
              href="/venues"
              data-hov
              className="btn-stamp text-[15px] !border-[color:var(--paper-chip)] !bg-transparent !text-[color:var(--paper-chip)] shadow-[4px_4px_0_rgba(0,0,0,0.45)] hover:shadow-[7px_7px_0_rgba(0,0,0,0.45)]"
            >
              Voir les salles
            </Link>
          </div>
        </div>

        {/* Tampon décoratif */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 hidden rotate-[14deg] font-display text-[180px] leading-none text-[color:var(--paper-chip)] opacity-[0.14] lg:block"
        >
          ✦
        </span>
      </div>
    </section>
  );
}
