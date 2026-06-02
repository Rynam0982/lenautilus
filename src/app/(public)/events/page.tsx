export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { getPublicEvents } from "@/services/events.service";
import { EventCard, EventCardSkeleton } from "@/components/public/event-card";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Événements",
  description: "Découvrez tous nos événements à venir — concerts, spectacles, soirées.",
};

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string; category?: string; upcoming?: string }>;
}

export default async function EventsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
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

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 pt-8">
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

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p className="text-nautilus-gray text-lg mb-2">Aucun événement disponible</p>
            <p className="text-nautilus-gray/60 text-sm">Revenez bientôt pour découvrir notre prochaine programmation.</p>
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
          <div className="flex justify-center gap-3 mt-16">
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              const href = `?page=${p}${upcoming ? "&upcoming=true" : ""}${search ? `&search=${search}` : ""}${category ? `&category=${category}` : ""}`;
              return (
                <a
                  key={p}
                  href={href}
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
          </div>
        )}
      </div>
    </div>
  );
}
