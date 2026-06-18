import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";
import { HeroSection } from "@/components/public/hero-section";
import { FeaturedEvents } from "@/components/public/featured-events";
import { VenuesShowcase } from "@/components/public/venues-showcase";
import { getFeaturedEvents } from "@/services/events.service";
import { getAllVenues } from "@/services/venues.service";
import { EventCardSkeleton } from "@/components/public/event-card";

export default async function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <Suspense fallback={<FeaturedEventsSkeleton />}>
        <FeaturedEventsServer />
      </Suspense>
      <Suspense fallback={null}>
        <VenuesServer />
      </Suspense>
      <ProjetTeaser />
      <CTASection />
    </div>
  );
}

function ProjetTeaser() {
  const stats = [
    { value: "358", label: "événements en 2025" },
    { value: "12 273", label: "personnes accueillies" },
    { value: "65", label: "soirées gratuites" },
  ];
  return (
    <section className="py-24 px-4">
      <div className="max-w-5xl mx-auto rounded-3xl border border-nautilus-border bg-nautilus-card p-8 md:p-12 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-nautilus-gold mb-4">
          Le projet
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-nautilus-white mb-4">
          Un lieu culturel au service du territoire
        </h2>
        <p className="text-nautilus-gray max-w-2xl mx-auto mb-10">
          Accompagnement des artistes locaux, des organisateurs d’événements,
          sensibilisation aux métiers de la musique et diffusion des musiques
          actuelles.
        </p>
        <div className="grid grid-cols-3 gap-6 mb-10">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-display text-3xl md:text-4xl font-bold text-gradient-brand">
                {s.value}
              </p>
              <p className="text-xs text-nautilus-gray mt-1">{s.label}</p>
            </div>
          ))}
        </div>
        <Link
          href="/projet"
          className="inline-flex items-center gap-2 rounded-full border border-nautilus-border px-7 py-3 text-sm font-medium text-nautilus-white hover:border-nautilus-gold hover:text-nautilus-gold transition-colors"
        >
          Découvrir le projet
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

async function FeaturedEventsServer() {
  const events = await getFeaturedEvents(6);
  return <FeaturedEvents events={events} />;
}

async function VenuesServer() {
  const venues = await getAllVenues();
  return <VenuesShowcase venues={venues} />;
}

function FeaturedEventsSkeleton() {
  return (
    <section className="py-24 px-4 max-w-7xl mx-auto">
      <div className="skeleton h-8 w-48 mb-12 rounded-md" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-32 px-4 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 50%, #c9a84c 0%, transparent 60%)",
        }}
      />
      <div className="max-w-3xl mx-auto text-center relative">
        <p className="text-xs uppercase tracking-[0.3em] text-nautilus-gold mb-6">
          Vous êtes artiste ?
        </p>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-nautilus-white mb-6">
          Réservez notre scène
        </h2>
        <p className="text-nautilus-gray text-lg mb-10 max-w-xl mx-auto">
          Deux salles à votre disposition. Une équipe dédiée. Des conditions
          professionnelles pour vos événements.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/register?role=ARTIST"
            className="inline-flex items-center justify-center h-12 px-8 text-base rounded-md bg-nautilus-gold text-nautilus-black hover:bg-nautilus-gold-light font-medium transition-colors"
          >
            Créer un compte artiste
          </Link>
          <Link
            href="/venues"
            className="inline-flex items-center justify-center h-12 px-8 text-base rounded-md border border-nautilus-border text-nautilus-white hover:border-nautilus-gold hover:text-nautilus-gold font-medium transition-colors"
          >
            Voir les salles
          </Link>
        </div>
      </div>
    </section>
  );
}
