export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { getPublicEvents } from "@/services/events.service";
import { EventCard, EventCardSkeleton } from "@/components/public/event-card";
import { Suspense } from "react";
import { Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Événements",
  description: "Découvrez tous nos événements à venir — concerts, spectacles, soirées.",
};

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string; category?: string; upcoming?: string }>;
}

export default async function EventsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const search = params.search;
  const category = params.category;
  const upcoming = params.upcoming === "true";

  const { data: events, total, totalPages } = await getPublicEvents({
    page,
    perPage: 12,
    search,
    categories: category ? [category] : undefined,
    upcoming,
  });

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const p = {
      page: String(page),
      ...(upcoming ? { upcoming: "true" } : {}),
      ...(search ? { search } : {}),
      ...(category ? { category } : {}),
      ...overrides,
    };
    const qs = Object.entries(p)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join("&");
    return `/events${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="px-7 pb-[30px] pt-[150px]">
        <div className="mx-auto max-w-[1320px]">
          <p className="m-0 mb-[18px]">
            <span className="sticker text-[12px]">
              Saison 2025 — 26 · La programmation
            </span>
          </p>
          <h1 className="display m-0 text-[clamp(70px,17vw,260px)]">
            Agen<span className="text-outline">da</span>
          </h1>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-5">
            <p className="m-0 max-w-[48ch] text-[clamp(16px,1.4vw,19px)] leading-[1.55] text-nautilus-cream">
              Toute la saison en un coup d&apos;œil. Cherchez votre artiste,
              choisissez votre soir, réservez en deux clics.
            </p>
            <p className="m-0 flex items-center gap-[9px] font-mono text-[12px] text-nautilus-gray">
              <span className="inline-block h-[7px] w-[7px] animate-blink rounded-full bg-nautilus-green" />
              {total} date{total !== 1 ? "s" : ""} {upcoming ? "à venir" : "affichée" + (total !== 1 ? "s" : "")}
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-[92px] z-40 px-7">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-wrap items-center gap-[10px] border-y-2 border-nautilus-ink bg-nautilus-black py-[14px]">
            <form
              method="GET"
              action="/events"
              className="relative min-w-[200px] flex-1 max-w-sm"
            >
              {upcoming && <input type="hidden" name="upcoming" value="true" />}
              {category && <input type="hidden" name="category" value={category} />}
              <input type="hidden" name="page" value="1" />
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-nautilus-gray" />
              <input
                name="search"
                defaultValue={search}
                placeholder="Rechercher un artiste…"
                className="h-10 w-full border-2 border-nautilus-ink bg-transparent pl-11 pr-4 font-mono text-[12px] uppercase tracking-[0.06em] text-nautilus-white placeholder:text-nautilus-gray/60 focus:border-nautilus-gold focus:outline-none"
              />
            </form>

            <a
              href={buildHref({ upcoming: undefined, page: "1" })}
              data-hov
              className={`border-2 px-4 py-[8px] font-mono text-[12px] font-bold uppercase tracking-[0.1em] transition ${
                !upcoming
                  ? "border-nautilus-ink bg-nautilus-gold text-[color:var(--paper-chip)] shadow-[3px_3px_0_var(--shadow-hard)]"
                  : "border-nautilus-ink text-nautilus-cream hover:bg-nautilus-muted"
              }`}
            >
              Tout
            </a>
            <a
              href={buildHref({ upcoming: "true", page: "1" })}
              data-hov
              className={`border-2 px-4 py-[8px] font-mono text-[12px] font-bold uppercase tracking-[0.1em] transition ${
                upcoming
                  ? "border-nautilus-ink bg-nautilus-gold text-[color:var(--paper-chip)] shadow-[3px_3px_0_var(--shadow-hard)]"
                  : "border-nautilus-ink text-nautilus-cream hover:bg-nautilus-muted"
              }`}
            >
              À venir
            </a>

            {(search || category) && (
              <a
                href={buildHref({ search: undefined, category: undefined, page: "1" })}
                className="font-mono text-[11px] uppercase tracking-[0.08em] text-nautilus-gray transition-colors hover:text-nautilus-gold"
              >
                Effacer ✕
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="px-7 pb-[70px] pt-[30px]">
        <div className="mx-auto max-w-[1320px]">
          {events.length === 0 ? (
            <p className="py-[60px] text-center font-mono text-sm text-nautilus-gray">
              {search
                ? `Aucun résultat pour « ${search} ».`
                : "Aucune date pour le moment — revenez très vite."}
            </p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[18px]">
              {events.map((event) => (
                <div data-reveal key={event.id} className="h-full">
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-2 font-mono text-[13px]">
              {page > 1 && (
                <a
                  href={buildHref({ page: String(page - 1) })}
                  data-hov
                  className="flex h-10 items-center gap-1.5 border-2 border-nautilus-ink px-4 text-nautilus-cream transition-colors hover:bg-nautilus-muted"
                >
                  ← Précédent
                </a>
              )}
              {Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1;
                if (totalPages > 7 && Math.abs(p - page) > 2 && p !== 1 && p !== totalPages)
                  return null;
                return (
                  <a
                    key={p}
                    href={buildHref({ page: String(p) })}
                    data-hov
                    className={`flex h-10 w-10 items-center justify-center border-2 border-nautilus-ink transition-colors ${
                      p === page
                        ? "bg-nautilus-gold font-bold text-[color:var(--paper-chip)] shadow-[3px_3px_0_var(--shadow-hard)]"
                        : "text-nautilus-cream hover:bg-nautilus-muted"
                    }`}
                  >
                    {p}
                  </a>
                );
              })}
              {page < totalPages && (
                <a
                  href={buildHref({ page: String(page + 1) })}
                  data-hov
                  className="flex h-10 items-center gap-1.5 border-2 border-nautilus-ink px-4 text-nautilus-cream transition-colors hover:bg-nautilus-muted"
                >
                  Suivant →
                </a>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
