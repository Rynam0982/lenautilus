import Link from "next/link";
import Image from "next/image";
import { Building2 } from "lucide-react";
import type { Venue } from "@prisma/client";

interface VenueCardProps {
  venue: Venue & { _count?: { events: number } };
}

export function VenueCard({ venue }: VenueCardProps) {
  return (
    <Link
      href={`/venues/${venue.slug}`}
      data-hov
      className="group poster-frame relative block transition-transform duration-200 hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[6px_6px_0_var(--shadow-hard)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        {venue.coverImage ? (
          <Image
            src={venue.coverImage}
            alt={venue.name}
            fill
            sizes="(max-width: 768px) 100vw, 420px"
            className="duo object-cover group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-nautilus-muted">
            <Building2 className="h-10 w-10 text-nautilus-gold/40" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent to-65%" />

        <span className="media-chip absolute right-[14px] top-[14px] px-[10px] py-[6px] font-mono text-[11px] font-bold tracking-[0.04em]">
          {venue.capacity.toLocaleString("fr-FR")} places
        </span>

        <div className="absolute inset-x-[18px] bottom-4">
          <p className="mb-[6px] font-mono text-[11px] uppercase tracking-[0.12em] text-nautilus-gold-light line-clamp-1 [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]">
            {venue._count ? `${venue._count.events} événements` : "Programmation"}
          </p>
          <h3 className="media-title font-display text-[clamp(26px,2.6vw,40px)] uppercase leading-[0.92]">
            {venue.name}
          </h3>
        </div>
      </div>
    </Link>
  );
}
