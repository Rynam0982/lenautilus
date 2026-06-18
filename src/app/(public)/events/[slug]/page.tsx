import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, Clock, ArrowLeft, Tag, Ban } from "lucide-react";
import { getPublicEventBySlug } from "@/services/events.service";
import { Badge } from "@/components/ui/badge";
import { TicketSelector } from "@/components/public/ticket-selector";
import { SmartCover } from "@/components/public/smart-cover";
import { DownloadCoverButton } from "@/components/public/download-cover-button";
import { formatDate } from "@/lib/utils";
import { auth } from "@/lib/auth";

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
  const [event, session] = await Promise.all([
    getPublicEventBySlug(slug),
    auth(),
  ]);

  if (!event) notFound();

  const isSoldOut = event.ticketTypes.every((tt) => tt.sold >= tt.quantity);
  const isCancelled = event.status === "CANCELLED";

  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <div className="relative overflow-hidden">
        {event.coverImage ? (
          <SmartCover
            src={event.coverImage}
            alt={event.title}
            priority
            sizes="100vw"
            cancelled={isCancelled}
          />
        ) : (
          <div className="h-[40vh] w-full bg-gradient-to-br from-nautilus-muted to-nautilus-dark" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-nautilus-black via-nautilus-black/30 to-transparent pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-24">
        {/* Back */}
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-sm text-nautilus-gray hover:text-nautilus-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux événements
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Cancelled banner */}
            {isCancelled && (
              <div className="flex items-center gap-3 mb-6 rounded-xl border border-red-700/50 bg-red-950/40 px-5 py-4">
                <Ban className="h-5 w-5 text-red-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-300">
                    Cet événement a été annulé
                  </p>
                  <p className="text-xs text-red-400/80">
                    La billetterie est fermée. Consultez notre agenda pour d’autres dates.
                  </p>
                </div>
              </div>
            )}

            {/* Categories */}
            {event.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {event.categories.map((cat) => (
                  <Badge key={cat} variant="default">
                    {cat}
                  </Badge>
                ))}
              </div>
            )}

            <h1 className="font-display text-4xl md:text-5xl font-bold text-nautilus-white mb-6 leading-tight">
              {event.title}
            </h1>

            {/* Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 p-6 rounded-xl border border-nautilus-border bg-nautilus-card">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-nautilus-gold shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-nautilus-gray mb-1">Date</p>
                  <p className="text-sm text-nautilus-white font-medium">
                    {formatDate(event.startDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-nautilus-gold shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-nautilus-gray mb-1">Horaires</p>
                  <p className="text-sm text-nautilus-white font-medium">
                    {new Date(event.startDate).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    —{" "}
                    {new Date(event.endDate).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-nautilus-gold shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-nautilus-gray mb-1">Lieu</p>
                  <Link
                    href={`/venues/${event.venue.slug}`}
                    className="text-sm text-nautilus-white font-medium hover:text-nautilus-gold transition-colors"
                  >
                    {event.venue.name}
                  </Link>
                </div>
              </div>
              {event.conditions && (
                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-nautilus-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-nautilus-gray mb-1">Conditions</p>
                    <p className="text-sm text-nautilus-white font-medium">
                      {event.conditions}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="prose prose-invert max-w-none">
              <p className="text-nautilus-gray-light text-base leading-relaxed mb-6">
                {event.description}
              </p>
              {event.longDescription && (
                <div
                  className="text-nautilus-gray text-sm leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{
                    __html: event.longDescription.replace(/\n/g, "<br/>"),
                  }}
                />
              )}
            </div>

            {/* Cover download */}
            {event.coverImage && (
              <div className="mt-10">
                <DownloadCoverButton eventId={event.id} title={event.title} />
              </div>
            )}
          </div>

          {/* Sidebar: Ticket purchase */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {isCancelled ? (
                <div className="rounded-2xl border border-red-700/40 bg-nautilus-card p-6 text-center">
                  <Ban className="h-8 w-8 text-red-400 mx-auto mb-3" />
                  <p className="font-display text-lg font-semibold text-nautilus-white">
                    Événement annulé
                  </p>
                  <p className="text-sm text-nautilus-gray mt-1">
                    La vente de billets est fermée.
                  </p>
                  <Link
                    href="/events"
                    className="mt-5 inline-block text-sm text-nautilus-gold hover:underline"
                  >
                    Voir les autres événements →
                  </Link>
                </div>
              ) : (
                <TicketSelector
                  event={event}
                  ticketTypes={event.ticketTypes}
                  isSoldOut={isSoldOut}
                  isAuthenticated={!!session?.user}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
