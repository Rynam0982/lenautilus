export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAllVenues } from "@/services/venues.service";
import { EventForm } from "@/components/admin/event-form";

export const metadata: Metadata = { title: "Admin — Nouvel événement" };

export default async function NewEventPage() {
  const venues = await getAllVenues();
  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href="/admin/events" className="inline-flex items-center gap-2 text-sm text-nautilus-gray hover:text-nautilus-white transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>
        <h1 className="font-display text-3xl font-bold text-nautilus-white">
          Nouvel événement
        </h1>
      </div>
      <EventForm venues={venues} />
    </div>
  );
}
