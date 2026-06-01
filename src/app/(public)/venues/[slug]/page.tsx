import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Users, ArrowLeft, Music } from "lucide-react";
import { getVenueBySlug } from "@/services/venues.service";
import { EventCard } from "@/components/public/event-card";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const venue = await getVenueBySlug(slug);
  if (!venue) return { title: "Salle introuvable" };
  return {
    title: venue.name,
    description: venue.description,
    openGraph: {
      title: venue.name,
      description: venue.description,
      images: venue.coverImage ? [venue.coverImage] : [],
    },
  };
}

export default async function VenueDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const venue = await getVenueBySlug(slug);
  if (!venue) notFound();

  const specs = venue.specs as Record<string, string> | null;

  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <div className="relative h-[45vh] overflow-hidden">
        {venue.coverImage ? (
          <Image
            src={venue.coverImage}
            alt={venue.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="h-full bg-gradient-to-br from-nautilus-muted to-nautilus-dark" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-nautilus-black via-nautilus-black/20 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-24">
        <Link
          href="/venues"
          className="inline-flex items-center gap-2 text-sm text-nautilus-gray hover:text-nautilus-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Toutes les salles
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main */}
          <div className="lg:col-span-2">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-nautilus-white mb-4">
              {venue.name}
            </h1>

            <div className="flex items-center gap-2 mb-8">
              <Users className="h-5 w-5 text-nautilus-gold" />
              <span className="text-nautilus-gray">
                Capacité : <strong className="text-nautilus-white">{venue.capacity.toLocaleString("fr-FR")} personnes</strong>
              </span>
            </div>

            <p className="text-nautilus-gray-light text-base leading-relaxed mb-10">
              {venue.description}
            </p>

            {/* Amenities */}
            {venue.amenities.length > 0 && (
              <div className="mb-10">
                <h3 className="text-sm uppercase tracking-widest text-nautilus-gold mb-4">
                  Équipements
                </h3>
                <div className="flex flex-wrap gap-2">
                  {venue.amenities.map((a) => (
                    <span
                      key={a}
                      className="rounded-full border border-nautilus-border px-4 py-1.5 text-sm text-nautilus-gray-light"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Specs */}
            {specs && Object.keys(specs).length > 0 && (
              <div className="mb-10">
                <h3 className="text-sm uppercase tracking-widest text-nautilus-gold mb-4">
                  Caractéristiques techniques
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(specs).map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2 border-b border-nautilus-border">
                      <span className="text-sm text-nautilus-gray">{k}</span>
                      <span className="text-sm text-nautilus-white font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {venue.gallery.length > 0 && (
              <div>
                <h3 className="text-sm uppercase tracking-widest text-nautilus-gold mb-4">
                  Galerie
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {venue.gallery.map((img, i) => (
                    <div key={i} className="aspect-square relative rounded-xl overflow-hidden">
                      <Image
                        src={img}
                        alt={`${venue.name} - photo ${i + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-nautilus-border bg-nautilus-card p-6 sticky top-24">
              <h3 className="font-display text-lg font-semibold text-nautilus-white mb-4">
                Réserver cet espace
              </h3>
              <p className="text-sm text-nautilus-gray mb-6">
                Vous êtes artiste ? Soumettez votre demande de réservation et notre équipe vous contactera.
              </p>
              <Button size="lg" className="w-full" asChild>
                <Link href="/artist/reservations/new">
                  <Music className="h-4 w-4" />
                  Faire une demande
                </Link>
              </Button>
              <p className="text-xs text-nautilus-gray mt-4 text-center">
                Compte artiste requis
              </p>
            </div>
          </div>
        </div>

        {/* Upcoming events at this venue */}
        {venue.events.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-3xl font-bold text-nautilus-white mb-8">
              Prochains événements ici
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venue.events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
