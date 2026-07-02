import Link from "next/link";
import Image from "next/image";
import { Music2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { EventCardData } from "@/types";

interface EventCardProps {
  event: EventCardData;
}

const DAY = new Intl.DateTimeFormat("fr-FR", { day: "2-digit" });
const DOW = new Intl.DateTimeFormat("fr-FR", { weekday: "short" });
const MON = new Intl.DateTimeFormat("fr-FR", { month: "short" });

export function EventCard({ event }: EventCardProps) {
  const date = new Date(event.startDate);
  const day = DAY.format(date);
  const dow = DOW.format(date).replace(".", "").toUpperCase();
  const mon = MON.format(date).replace(".", "").toUpperCase();

  const prices = event.ticketTypes.map((t) => t.price);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const isFree = minPrice === 0;
  const isSoldOut =
    event.ticketTypes.length > 0 &&
    event.ticketTypes.every((tt) => tt.sold >= tt.quantity);
  const isCancelled = event.status === "CANCELLED";
  const category = event.categories[0] ?? "Concert";

  const priceLabel = isCancelled
    ? "Annulé"
    : isSoldOut
      ? "Complet"
      : isFree
        ? "Gratuit"
        : `dès ${formatPrice(minPrice)}`;

  return (
    <Link
      href={`/events/${event.slug}`}
      data-hov
      className="group poster-frame relative flex h-full flex-col overflow-visible transition-transform duration-200 hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[6px_6px_0_var(--shadow-hard)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden border-b-2 border-nautilus-ink">
        {event.coverImage ? (
          <Image
            src={event.coverImage}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            className="duo object-cover group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-nautilus-muted">
            <Music2 className="h-10 w-10 text-nautilus-gold/40" />
          </div>
        )}

        {/* Category stamp */}
        <span className="media-chip absolute right-[11px] top-[13px] px-[9px] py-[5px] font-mono text-[10px] font-bold uppercase tracking-[0.08em]">
          {isCancelled ? "Annulé" : category}
        </span>
      </div>

      {/* Date sticker — slapped across the poster edge */}
      <div className="sticker absolute -left-[10px] -top-[8px] z-10 px-[11px] py-[7px] text-center leading-none">
        <span className="block font-display text-[24px] tracking-normal">
          {day}
        </span>
        <span className="mt-[3px] block font-mono text-[9.5px] font-bold uppercase tracking-[0.1em]">
          {dow} {mon}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-[6px] p-4 pb-[16px]">
        <h3 className="line-clamp-2 min-h-[1.9em] font-display text-[clamp(22px,2vw,30px)] uppercase leading-[0.95] text-nautilus-white transition-colors group-hover:text-nautilus-gold">
          {event.title}
        </h3>
        <p className="font-mono text-[11.5px] tracking-[0.04em] text-nautilus-gray line-clamp-1">
          {category} · {event.venue.name}
        </p>
        <div className="mt-auto flex items-center justify-between border-t-2 border-dashed border-nautilus-border pt-[12px]">
          <span className="font-mono text-[13px] font-bold text-nautilus-gold">
            {priceLabel}
          </span>
          <span className="inline-flex items-center gap-[7px] font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-nautilus-white">
            Réserver ↗
          </span>
        </div>
      </div>
    </Link>
  );
}

export function EventCardSkeleton() {
  return <div className="aspect-[4/5] skeleton" />;
}
