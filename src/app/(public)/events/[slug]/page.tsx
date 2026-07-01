import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Ban } from "lucide-react";
import {
  getPublicEventBySlug,
  getFeaturedEvents,
} from "@/services/events.service";
import { TicketSelector } from "@/components/public/ticket-selector";
import { DownloadCoverButton } from "@/components/public/download-cover-button";

const LONG_DATE = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "2-digit",
  month: "long",
});
const REL_DATE = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "2-digit",
  month: "short",
});
const TIME = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
});

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getPublicEventBySlug(slug);
  if (!event) return { title: "Événement introuvable" };

  return {
    title: event.title,
    description: event.description,
    openGraph: {
      title: event.title,
      description: event.description,
      images: event.coverImage ? [event.coverImage] : [],
      type: "website",
    },
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [event, featured] = await Promise.all([
    getPublicEventBySlug(slug),
    getFeaturedEvents(4),
  ]);

  if (!event) notFound();

  const isSoldOut = event.ticketTypes.every((tt) => tt.sold >= tt.quantity);
  const isCancelled = event.status === "CANCELLED";
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  const category = event.categories[0] ?? "Concert";
  const durationMin = Math.round((end.getTime() - start.getTime()) / 60000);
  const durationLabel =
    durationMin > 0
      ? `≈ ${Math.floor(durationMin / 60)}h${String(durationMin % 60).padStart(2, "0")}`
      : "—";

  const related = featured.filter((e) => e.slug !== event.slug).slice(0, 3);

  const meta = [
    { label: "Date", value: LONG_DATE.format(start).replace(".", "") },
    { label: "Ouverture", value: TIME.format(start) },
    { label: "Salle", value: event.venue.name },
    { label: "Durée", value: durationLabel },
  ];

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative pt-[96px]">
        <div className="relative h-[clamp(420px,64vh,680px)] overflow-hidden">
          {event.coverImage ? (
            <Image
              src={event.coverImage}
              alt={event.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
              style={{
                filter:
                  "grayscale(.2) sepia(.4) saturate(1.35) brightness(.6) contrast(1.05)",
              }}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-nautilus-muted to-nautilus-dark" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(to_top,#0b0a09_2%,rgba(11,10,9,.35)_45%,rgba(11,10,9,.55))]" />
          <div className="absolute inset-x-0 bottom-0 px-7 pb-10">
            <div className="mx-auto max-w-[1320px]">
              <Link
                href="/events"
                data-hov
                className="mb-[18px] inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.12em] text-nautilus-gold-light"
              >
                ← Retour à l&apos;agenda
              </Link>
              <div className="mb-[14px] flex flex-wrap gap-[9px]">
                <span className="rounded-full bg-nautilus-gold px-3 py-[6px] font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-nautilus-black">
                  {category}
                </span>
                {isCancelled ? (
                  <span className="rounded-full border border-red-500/50 bg-red-500/15 px-3 py-[6px] font-mono text-[11px] uppercase tracking-[0.1em] text-red-300">
                    Annulé
                  </span>
                ) : isSoldOut ? (
                  <span className="rounded-full border border-nautilus-border-strong bg-nautilus-black/55 px-3 py-[6px] font-mono text-[11px] uppercase tracking-[0.1em] backdrop-blur-sm">
                    Complet
                  </span>
                ) : (
                  <span className="rounded-full border border-nautilus-green/50 bg-nautilus-green/15 px-3 py-[6px] font-mono text-[11px] uppercase tracking-[0.1em] text-[#7fe3a9]">
                    Places disponibles
                  </span>
                )}
              </div>
              <p className="m-0 mb-[6px] font-mono text-[13px] uppercase tracking-[0.16em] text-nautilus-gold-light [text-shadow:0_1px_10px_rgba(0,0,0,0.7)]">
                {LONG_DATE.format(start).replace(".", "")} · {TIME.format(start)} ·{" "}
                {event.venue.name}
              </p>
              <h1 className="display media-title m-0 text-[clamp(48px,12vw,176px)] [text-shadow:0_2px_30px_rgba(0,0,0,0.55)]">
                {event.title}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="px-7 pb-[70px] pt-[46px]">
        <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-start gap-[44px] lg:grid-cols-[1.65fr_.95fr]">
          {/* Left */}
          <div>
            <div
              data-reveal
              className="mb-9 grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-nautilus-border bg-nautilus-border sm:grid-cols-4"
            >
              {meta.map((m) => (
                <div key={m.label} className="bg-nautilus-black p-[18px]">
                  <p className="m-0 mb-2 font-mono text-[10.5px] uppercase tracking-[0.1em] text-nautilus-gray-dim">
                    {m.label}
                  </p>
                  <p className="m-0 text-[15px] font-semibold text-nautilus-white">
                    {m.value}
                  </p>
                </div>
              ))}
            </div>

            <div data-reveal>
              <h2 className="display m-0 mb-4 text-[clamp(28px,3.4vw,46px)]">
                Le concert
              </h2>
              <p className="m-0 mb-4 max-w-[62ch] text-[17px] leading-[1.65] text-nautilus-cream text-pretty">
                {event.description}
              </p>
              {event.longDescription && (
                <div
                  className="max-w-[62ch] space-y-4 text-[15.5px] leading-[1.65] text-nautilus-gray"
                  dangerouslySetInnerHTML={{
                    __html: event.longDescription.replace(/\n/g, "<br/>"),
                  }}
                />
              )}
              {event.conditions && (
                <p className="mt-6 font-mono text-[12px] uppercase tracking-[0.1em] text-nautilus-gray-dim">
                  Conditions : <span className="text-nautilus-cream">{event.conditions}</span>
                </p>
              )}
            </div>

            {event.coverImage && (
              <div className="mt-10">
                <DownloadCoverButton eventId={event.id} title={event.title} />
              </div>
            )}
          </div>

          {/* Right — ticket card */}
          <div className="lg:sticky lg:top-[120px]">
            {isCancelled ? (
              <div className="rounded-[18px] border border-red-700/40 bg-nautilus-card p-6 text-center">
                <Ban className="mx-auto mb-3 h-8 w-8 text-red-400" />
                <p className="font-display text-lg uppercase text-nautilus-white">
                  Événement annulé
                </p>
                <p className="mt-1 text-sm text-nautilus-gray">
                  La vente de billets est fermée.
                </p>
                <Link
                  href="/events"
                  className="mt-5 inline-block font-mono text-[12px] uppercase tracking-[0.1em] text-nautilus-gold hover:underline"
                >
                  Voir les autres dates →
                </Link>
              </div>
            ) : (
              <TicketSelector
                event={event}
                ticketTypes={event.ticketTypes}
                isSoldOut={isSoldOut}
              />
            )}
          </div>
        </div>
      </section>

      {/* RELATED */}
      {related.length > 0 && (
        <section className="px-7 pb-20 pt-[10px]">
          <div className="mx-auto max-w-[1320px]">
            <div
              data-reveal
              className="mb-[22px] flex items-baseline justify-between gap-4 border-t border-nautilus-border pt-[26px]"
            >
              <h2 className="display m-0 text-[clamp(28px,3.6vw,52px)]">À voir aussi</h2>
              <Link
                href="/events"
                data-hov
                className="font-mono text-[12px] uppercase tracking-[0.1em] text-nautilus-gold"
              >
                Tout l&apos;agenda ↗
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/events/${r.slug}`}
                  data-hov
                  data-reveal
                  className="group relative block overflow-hidden rounded-[14px] border border-nautilus-border bg-nautilus-card transition-colors hover:border-nautilus-gold"
                >
                  <div className="relative aspect-[16/11] overflow-hidden">
                    {r.coverImage ? (
                      <Image
                        src={r.coverImage}
                        alt={r.title}
                        fill
                        sizes="(max-width:1024px) 100vw, 420px"
                        className="duo object-cover group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-nautilus-muted to-nautilus-dark" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent to-65%" />
                    <div className="absolute inset-x-4 bottom-[14px]">
                      <p className="m-0 mb-[5px] font-mono text-[11px] uppercase tracking-[0.1em] text-nautilus-gold-light">
                        {REL_DATE.format(new Date(r.startDate)).replace(/\./g, "")}
                      </p>
                      <h3 className="display media-title m-0 text-[clamp(22px,2vw,32px)]">
                        {r.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
