import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Clock, Users, ArrowLeft, Tag } from "lucide-react";
import { getPublicEventBySlug } from "@/services/events.service";
import { Badge } from "@/components/ui/badge";
import { TicketSelector } from "@/components/public/ticket-selector";
import { formatDate, formatDateRange } from "@/lib/utils";
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

  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        {event.coverImage ? (
          <Image
            src={event.coverImage}
            alt={event.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-nautilus-muted to-nautilus-dark" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-nautilus-black via-nautilus-black/30 to-transparent" />
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
          </div>

          {/* Sidebar: Ticket purchase */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <TicketSelector
                event={event}
                ticketTypes={event.ticketTypes}
                isSoldOut={isSoldOut}
                isAuthenticated={!!session?.user}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
