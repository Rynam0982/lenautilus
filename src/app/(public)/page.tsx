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
              <span className="font-mono text-[13px] tracking-[0.1em] text-nautilus-gold">
                [ 01 ]
              </span>
              <h2 className="display m-0 text-[clamp(38px,6vw,86px)]">
                Prochainement
              </h2>
            </div>
            <Link
              href="/events"
              data-hov
              className="inline-flex items-center gap-[9px] font-mono text-[12.5px] uppercase tracking-[0.12em] text-nautilus-gold"
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
              <span className="font-mono text-[13px] tracking-[0.1em] text-nautilus-gold">
                [ 02 ]
              </span>
              <h2 className="display m-0 text-[clamp(38px,6vw,86px)]">
                Trois&nbsp;salles, <span className="text-nautilus-gold">une&nbsp;énergie</span>
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
          <span className="font-mono text-[13px] tracking-[0.1em] text-nautilus-gold">
            [ 03 ] &nbsp;Le projet
          </span>
          <h2 className="display m-0 my-[14px] text-[clamp(36px,4.6vw,72px)]">
            Un lieu au service du&nbsp;<span className="text-nautilus-gold">territoire</span>
          </h2>
          <p className="m-0 mb-[26px] max-w-[46ch] text-[17px] leading-[1.6] text-nautilus-cream text-pretty">
            Accompagnement des artistes locaux, des organisateurs d&apos;événements,
            sensibilisation aux métiers de la musique et diffusion des musiques
            actuelles. Une saison fondatrice qui ancre le Nautilus dans son
            territoire.
          </p>
          <div className="mb-[30px] flex flex-wrap gap-[9px]">
            {["Artistes locaux", "Organisateurs", "Métiers de la musique", "Diffusion"].map(
              (t) => (
                <span
                  key={t}
                  className="rounded-full border border-nautilus-border-strong px-[14px] py-2 font-mono text-[12px] text-nautilus-cream"
                >
                  {t}
                </span>
              )
            )}
          </div>
          <Link
            href="/projet"
            data-hov
            className="inline-flex items-center gap-[10px] rounded-full border border-nautilus-gold px-6 py-[14px] text-[15px] font-semibold text-nautilus-gold transition-colors hover:bg-nautilus-gold hover:text-nautilus-black"
          >
            Découvrir le projet →
          </Link>
        </div>
        <div data-reveal className="relative">
          <div
            className="relative overflow-hidden rounded-[14px] bg-nautilus-card aspect-[5/6] bg-cover bg-center"
            style={{ backgroundImage: "url(/images/salles/soiree.jpeg)" }}
          />
          <div className="absolute -bottom-[22px] -right-[14px] rounded-[12px] bg-nautilus-gold px-[22px] py-[18px] text-nautilus-black shadow-[0_18px_50px_rgba(0,0,0,0.5)]">
            <p className="m-0 font-display text-[46px] leading-[0.85]">60 386 €</p>
            <p className="m-0 mt-[6px] font-mono text-[11px] uppercase tracking-[0.06em]">
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
        className="relative mx-auto max-w-[1320px] overflow-hidden rounded-[18px]"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(/images/salles/soiree.jpeg)",
            filter: "grayscale(.3) brightness(.42) contrast(1.05)",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(11,10,9,.9),rgba(11,10,9,.35))]" />
        <div className="relative flex flex-col items-start gap-[18px] p-[clamp(40px,7vw,86px)]">
          <p className="on-media m-0 font-mono text-[12.5px] uppercase tracking-[0.22em]">
            Vous êtes artiste ou organisateur ?
          </p>
          <h2 className="display media-title m-0 max-w-[14ch] text-[clamp(40px,7vw,104px)]">
            Réservez notre&nbsp;scène
          </h2>
          <p className="media-text m-0 mb-2 max-w-[52ch] text-[17px] leading-[1.55]">
            Trois salles, une équipe dédiée, des conditions professionnelles. Du
            showcase intime au grand concert.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/devenir-artiste"
              data-hov
              className="rounded-full bg-nautilus-gold px-7 py-[15px] text-[15px] font-bold text-nautilus-black transition-colors hover:bg-nautilus-gold-light"
            >
              Demander un compte artiste
            </Link>
            <Link
              href="/venues"
              data-hov
              className="rounded-full border border-white/80 px-7 py-[15px] text-[15px] font-semibold text-white transition-colors hover:bg-white hover:text-black"
            >
              Voir les salles
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
