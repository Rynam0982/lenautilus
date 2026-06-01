export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { getAllVenues } from "@/services/venues.service";
import { NewReservationForm } from "@/components/artist/new-reservation-form";

export const metadata: Metadata = { title: "Nouvelle réservation" };

export default async function NewReservationPage() {
  const venues = await getAllVenues();

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-nautilus-gold mb-3">
            Artiste
          </p>
          <h1 className="font-display text-4xl font-bold text-nautilus-white mb-2">
            Demande de réservation
          </h1>
          <p className="text-nautilus-gray">
            Soumettez votre demande. Notre équipe l'examinera et vous répondra rapidement.
          </p>
        </div>
        <NewReservationForm venues={venues} />
      </div>
    </div>
  );
}
