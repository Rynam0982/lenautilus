export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { getAllVenues } from "@/services/venues.service";
import { VenueCard } from "@/components/public/venue-card";

export const metadata: Metadata = {
  title: "Nos salles",
  description: "Découvrez les trois salles du Nautilus — leurs capacités, équipements et disponibilités.",
};

export default async function VenuesPage() {
  const venues = await getAllVenues();

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 pt-8">
          <p className="text-xs uppercase tracking-[0.3em] text-nautilus-gold mb-4">
            Espaces
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-nautilus-white mb-4">
            Nos salles
          </h1>
          <p className="text-nautilus-gray text-lg max-w-xl">
            Trois espaces uniques pour accueillir vos événements et concerts.
          </p>
        </div>

        {venues.length === 0 ? (
          <p className="text-nautilus-gray text-center py-32">
            Aucune salle disponible pour le moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {venues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
