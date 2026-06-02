export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllVenues } from "@/services/venues.service";
import { Building2, CalendarDays, BookOpen, ExternalLink } from "lucide-react";

export const metadata: Metadata = { title: "Admin — Salles" };

export default async function AdminVenuesPage() {
  const venues = await getAllVenues();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-nautilus-white mb-1">Salles</h1>
        <p className="text-nautilus-gray text-sm">
          {venues.length} salle{venues.length !== 1 ? "s" : ""}
        </p>
      </div>

      {venues.length === 0 ? (
        <p className="text-nautilus-gray text-center py-16">Aucune salle configurée</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {venues.map((venue) => (
            <div
              key={venue.id}
              className="rounded-2xl border border-nautilus-border bg-nautilus-card overflow-hidden"
            >
              {venue.coverImage && (
                <div className="h-44 overflow-hidden">
                  <img
                    src={venue.coverImage}
                    alt={venue.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nautilus-gold/10 shrink-0">
                    <Building2 className="h-5 w-5 text-nautilus-gold" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-display text-lg font-semibold text-nautilus-white truncate">
                      {venue.name}
                    </h2>
                    <p className="text-xs text-nautilus-gray">
                      Capacité : {venue.capacity} personnes
                    </p>
                  </div>
                </div>

                <p className="text-sm text-nautilus-gray line-clamp-2 mb-5">
                  {venue.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-nautilus-gray mb-5">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-nautilus-gold/70" />
                    {venue._count.events} événement{venue._count.events !== 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-nautilus-gold/70" />
                    {venue._count.reservations} réservation{venue._count.reservations !== 1 ? "s" : ""}
                  </span>
                </div>

                {venue.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {venue.amenities.slice(0, 4).map((a) => (
                      <span
                        key={a}
                        className="text-xs px-2 py-0.5 rounded-full bg-nautilus-gold/10 text-nautilus-gold border border-nautilus-gold/20"
                      >
                        {a}
                      </span>
                    ))}
                    {venue.amenities.length > 4 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-nautilus-border text-nautilus-gray">
                        +{venue.amenities.length - 4}
                      </span>
                    )}
                  </div>
                )}

                <Link
                  href={`/venues/${venue.slug}`}
                  target="_blank"
                  className="flex items-center gap-1.5 text-xs text-nautilus-gray hover:text-nautilus-gold transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Voir la page publique
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
