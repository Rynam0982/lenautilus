import Link from "next/link";
import Image from "next/image";
import { Users, CalendarDays, ArrowRight, Building2 } from "lucide-react";
import type { Venue } from "@prisma/client";

interface VenueCardProps {
  venue: Venue & { _count?: { events: number } };
}

export function VenueCard({ venue }: VenueCardProps) {
  return (
    <Link href={`/venues/${venue.slug}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-nautilus-border bg-nautilus-card transition-all duration-300 hover:-translate-y-1 hover:border-nautilus-gold/50 hover:shadow-xl hover:shadow-black/20">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-nautilus-dark">
          {venue.coverImage ? (
            <Image
              src={venue.coverImage}
              alt={venue.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-nautilus-muted to-nautilus-dark">
              <Building2 className="h-10 w-10 text-nautilus-gold/40" />
            </div>
          )}
        </div>

        {/* Content on the solid card surface */}
        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-xl font-semibold text-nautilus-white transition-colors group-hover:text-nautilus-gold mb-2">
            {venue.name}
          </h3>
          <p className="text-sm text-nautilus-gray line-clamp-2 mb-4">
            {venue.description}
          </p>
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-nautilus-gray">
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-nautilus-gold" />
                {venue.capacity.toLocaleString("fr-FR")} personnes
              </span>
              {venue._count && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-nautilus-gold" />
                  {venue._count.events} événements
                </span>
              )}
            </div>
            <ArrowRight className="h-4 w-4 text-nautilus-gold opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
          </div>
        </div>
      </article>
    </Link>
  );
}
