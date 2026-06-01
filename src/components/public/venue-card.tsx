import Link from "next/link";
import Image from "next/image";
import { Users, CalendarDays } from "lucide-react";
import type { Venue } from "@prisma/client";

interface VenueCardProps {
  venue: Venue & { _count?: { events: number } };
}

export function VenueCard({ venue }: VenueCardProps) {
  return (
    <Link href={`/venues/${venue.slug}`} className="group block">
      <article className="relative overflow-hidden rounded-2xl border border-nautilus-border bg-nautilus-card transition-all duration-300 hover:border-nautilus-gold/40 hover:shadow-xl hover:shadow-nautilus-gold/5">
        {/* Image */}
        <div className="aspect-[16/9] relative overflow-hidden">
          {venue.coverImage ? (
            <Image
              src={venue.coverImage}
              alt={venue.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-nautilus-muted to-nautilus-dark" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-nautilus-black/80 to-transparent" />
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-display text-xl font-semibold text-nautilus-white group-hover:text-nautilus-gold transition-colors mb-2">
            {venue.name}
          </h3>
          <p className="text-sm text-nautilus-gray line-clamp-2 mb-4">
            {venue.description}
          </p>
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
        </div>
      </article>
    </Link>
  );
}
