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
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 pt-8">
          <p className="text-xs uppercase tracking-[0.3em] text-nautilus-gold mb-4">
            Programmation
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-nautilus-white mb-4">
            {upcoming ? "Événements à venir" : "Événements"}
          </h1>
          <p className="text-nautilus-gray text-lg max-w-xl">
            {total} événement{total !== 1 ? "s" : ""} {upcoming ? "à venir" : "à découvrir"}
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 mb-10 p-4 rounded-2xl border border-nautilus-border bg-nautilus-card/50 backdrop-blur-sm">
          {/* Search */}
          <form method="GET" action="/events" className="relative flex-1 min-w-[200px] max-w-sm">
            {upcoming && <input type="hidden" name="upcoming" value="true" />}
            {category && <input type="hidden" name="category" value={category} />}
            <input type="hidden" name="page" value="1" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-nautilus-gray pointer-events-none" />
            <input
              name="search"
              defaultValue={search}
              placeholder="Rechercher un événement…"
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-nautilus-border bg-transparent text-sm text-nautilus-white placeholder:text-nautilus-gray/50 focus:border-nautilus-gold/60 focus:outline-none transition-colors"
            />
          </form>

          {/* Upcoming / All toggle */}
          <div className="flex items-center gap-1.5">
            <a
              href={buildHref({ upcoming: undefined, page: "1" })}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                !upcoming
                  ? "bg-nautilus-gold text-nautilus-black"
                  : "border border-nautilus-border text-nautilus-gray hover:border-nautilus-gold/50 hover:text-nautilus-white"
              }`}
            >
              Tous
            </a>
            <a
              href={buildHref({ upcoming: "true", page: "1" })}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                upcoming
                  ? "bg-nautilus-gold text-nautilus-black"
                  : "border border-nautilus-border text-nautilus-gray hover:border-nautilus-gold/50 hover:text-nautilus-white"
              }`}
            >
              À venir
            </a>
          </div>

          {/* Clear search */}
          {(search || category) && (
            <a
              href={buildHref({ search: undefined, category: undefined, page: "1" })}
              className="text-xs text-nautilus-gray hover:text-nautilus-gold transition-colors"
            >
              Effacer les filtres
            </a>
          )}
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p className="text-nautilus-gray text-lg mb-2">Aucun événement disponible</p>
            <p className="text-nautilus-gray/60 text-sm">
              {search
                ? `Aucun résultat pour « ${search} »`
                : upcoming
                ? "Aucun événement à venir pour le moment."
                : "Revenez bientôt pour découvrir notre prochaine programmation."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-16">
            {page > 1 && (
              <a
                href={buildHref({ page: String(page - 1) })}
                className="flex h-10 px-4 items-center gap-1.5 rounded-full text-sm text-nautilus-gray border border-nautilus-border hover:border-nautilus-gold hover:text-nautilus-white transition-colors"
              >
                ← Précédent
              </a>
            )}
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              if (totalPages > 7 && Math.abs(p - page) > 2 && p !== 1 && p !== totalPages) return null;
              return (
                <a
                  key={p}
                  href={buildHref({ page: String(p) })}
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                    p === page
                      ? "bg-nautilus-gold text-nautilus-black"
                      : "border border-nautilus-border text-nautilus-gray hover:border-nautilus-gold hover:text-nautilus-white"
                  }`}
                >
                  {p}
                </a>
              );
            })}
            {page < totalPages && (
              <a
                href={buildHref({ page: String(page + 1) })}
                className="flex h-10 px-4 items-center gap-1.5 rounded-full text-sm text-nautilus-gray border border-nautilus-border hover:border-nautilus-gold hover:text-nautilus-white transition-colors"
              >
                Suivant →
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
