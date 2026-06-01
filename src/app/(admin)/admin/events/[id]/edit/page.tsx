export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db/client";
import { getAllVenues } from "@/services/venues.service";
import { EventForm } from "@/components/admin/event-form";

export const metadata: Metadata = { title: "Admin — Modifier événement" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: PageProps) {
  const { id } = await params;
  const [event, venues] = await Promise.all([
    prisma.event.findUnique({
      where: { id },
      include: { ticketTypes: true },
    }),
    getAllVenues(),
  ]);

  if (!event) notFound();

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href="/admin/events" className="inline-flex items-center gap-2 text-sm text-nautilus-gray hover:text-nautilus-white transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>
        <h1 className="font-display text-3xl font-bold text-nautilus-white">
          Modifier : {event.title}
        </h1>
      </div>
      <EventForm venues={venues} event={event} />
    </div>
  );
}
