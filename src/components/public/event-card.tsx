import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Music2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatShortDate, formatPrice } from "@/lib/utils";
import type { EventCardData } from "@/types";

interface EventCardProps {
  event: EventCardData;
  featured?: boolean;
}

export function EventCard({ event }: EventCardProps) {
  const minPrice = event.ticketTypes.reduce(
    (min, tt) => (tt.price < min ? tt.price : min),
    Infinity
  );
  const isFree = minPrice === 0;
  const isSoldOut = event.ticketTypes.every((tt) => tt.sold >= tt.quantity);
  const isCancelled = event.status === "CANCELLED";

  return (
    <Link href={`/events/${event.slug}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-nautilus-border bg-nautilus-card transition-all duration-300 hover:-translate-y-1 hover:border-nautilus-gold/50 hover:shadow-xl hover:shadow-black/20">
        {/* Poster — shown in full (contain) over a blurred backdrop, never cropped */}
        <div className="relative aspect-[4/3] overflow-hidden bg-nautilus-dark">
          {event.coverImage ? (
            <>
              <Image
                src={event.coverImage}
                alt=""
                aria-hidden
                fill
                className="object-cover blur-2xl scale-110 opacity-40"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <Image
                src={event.coverImage}
                alt={event.title}
                fill
                className={`object-contain transition-transform duration-500 group-hover:scale-[1.03] ${
                  isCancelled ? "grayscale-[35%]" : ""
                }`}
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-nautilus-muted to-nautilus-dark">
              <Music2 className="h-10 w-10 text-nautilus-gold/40" />
            </div>
          )}

          {/* Status / price badge */}
          <div className="absolute top-3 right-3">
            {isCancelled ? (
              <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-lg">
                Annulé
              </span>
            ) : isSoldOut ? (
              <span className="rounded-full bg-nautilus-black/85 px-3 py-1 text-xs font-medium text-red-300 shadow-lg">
                Complet
              </span>
            ) : isFree ? (
              <span className="rounded-full bg-nautilus-green px-3 py-1 text-xs font-semibold text-white shadow-lg">
                Gratuit
              </span>
            ) : (
              <span className="rounded-full bg-nautilus-black/85 px-3 py-1 text-xs font-semibold text-nautilus-gold shadow-lg">
                dès {formatPrice(minPrice)}
              </span>
            )}
          </div>

          {isCancelled && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="-rotate-6 bg-red-600 px-5 py-1 font-display text-xl font-bold uppercase tracking-widest text-white shadow-2xl">
                Annulé
              </span>
            </div>
          )}
        </div>

        {/* Content on the solid card surface */}
        <div className="flex flex-1 flex-col p-4">
          {event.categories.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {event.categories.slice(0, 2).map((cat) => (
                <Badge key={cat} variant="secondary" className="text-[11px]">
                  {cat}
                </Badge>
              ))}
            </div>
          )}

          <h3 className="font-display text-base font-semibold leading-snug text-nautilus-white transition-colors line-clamp-2 group-hover:text-nautilus-gold">
            {event.title}
          </h3>

          <div className="mt-auto flex items-center gap-4 pt-3 text-xs text-nautilus-gray">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-nautilus-gold" />
              {formatShortDate(event.startDate)}
            </span>
            <span className="flex items-center gap-1.5 truncate">
              <MapPin className="h-3.5 w-3.5 text-nautilus-gold" />
              <span className="truncate">{event.venue.name}</span>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function EventCardSkeleton() {
  return <div className="aspect-[4/3] rounded-2xl skeleton" />;
}
