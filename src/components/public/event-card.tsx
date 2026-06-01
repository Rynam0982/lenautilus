import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatShortDate, formatPrice } from "@/lib/utils";
import type { EventCardData } from "@/types";

interface EventCardProps {
  event: EventCardData;
  featured?: boolean;
}

export function EventCard({ event, featured = false }: EventCardProps) {
  const minPrice = event.ticketTypes.reduce(
    (min, tt) => (tt.price < min ? tt.price : min),
    Infinity
  );
  const isFree = minPrice === 0;
  const isSoldOut = event.ticketTypes.every((tt) => tt.sold >= tt.quantity);

  return (
    <Link href={`/events/${event.slug}`} className="group block">
      <article
        className={`relative overflow-hidden rounded-2xl border border-nautilus-border bg-nautilus-card transition-all duration-300 hover:border-nautilus-gold/40 hover:shadow-2xl hover:shadow-nautilus-gold/5 ${
          featured ? "aspect-[4/3]" : "aspect-[3/2]"
        }`}
      >
        {/* Cover Image */}
        <div className="absolute inset-0">
          {event.coverImage ? (
            <Image
              src={event.coverImage}
              alt={event.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-nautilus-muted to-nautilus-dark" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-nautilus-black via-nautilus-black/40 to-transparent" />
        </div>

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-5">
          {/* Categories */}
          {event.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {event.categories.slice(0, 2).map((cat) => (
                <Badge key={cat} variant="secondary" className="text-xs">
                  {cat}
                </Badge>
              ))}
            </div>
          )}

          <h3 className="font-display text-lg font-semibold text-nautilus-white leading-tight mb-2 group-hover:text-nautilus-gold transition-colors">
            {event.title}
          </h3>

          <div className="flex items-center gap-4 text-xs text-nautilus-gray">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatShortDate(event.startDate)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {event.venue.name}
            </span>
          </div>
        </div>

        {/* Price badge */}
        <div className="absolute top-4 right-4">
          {isSoldOut ? (
            <span className="rounded-full bg-nautilus-black/80 border border-red-800/50 px-3 py-1 text-xs text-red-400 font-medium">
              Complet
            </span>
          ) : isFree ? (
            <span className="rounded-full bg-nautilus-gold/90 px-3 py-1 text-xs text-nautilus-black font-semibold">
              Gratuit
            </span>
          ) : (
            <span className="rounded-full bg-nautilus-black/80 border border-nautilus-border px-3 py-1 text-xs text-nautilus-white font-medium">
              dès {formatPrice(minPrice)}
            </span>
          )}
        </div>
      </article>
    </Link>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="aspect-[3/2] rounded-2xl skeleton" />
  );
}
