export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllEventsAdmin } from "@/services/events.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatPrice } from "@/lib/utils";
import { Plus, Globe, Lock, Pencil } from "lucide-react";
import { EventPublishButton } from "@/components/admin/event-publish-button";
import { EventDeleteButton } from "@/components/admin/event-delete-button";

export const metadata: Metadata = { title: "Admin — Événements" };

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "secondary" | "danger" }> = {
  DRAFT: { label: "Brouillon", variant: "secondary" },
  PENDING_APPROVAL: { label: "En attente", variant: "warning" },
  APPROVED: { label: "Approuvé", variant: "success" },
  PUBLISHED: { label: "Publié", variant: "success" },
  CANCELLED: { label: "Annulé", variant: "danger" },
  PAST: { label: "Passé", variant: "secondary" },
};

export default async function AdminEventsPage() {
  const { data: events, total } = await getAllEventsAdmin({ perPage: 100 });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-nautilus-white mb-1">Événements</h1>
          <p className="text-nautilus-gray text-sm">{total} événements</p>
        </div>
        <Button asChild>
          <Link href="/admin/events/new">
            <Plus className="h-4 w-4" /> Nouvel événement
          </Link>
        </Button>
      </div>

      <div className="rounded-2xl border border-nautilus-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-nautilus-border bg-nautilus-dark">
              {["Événement", "Date", "Salle", "Prix", "Statut", "Visibilité", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wider text-nautilus-gray font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-nautilus-border">
            {events.map((event) => {
              const config = statusConfig[event.status] ?? { label: event.status, variant: "secondary" as const };
              const minPrice = event.ticketTypes.reduce((m, tt) => Math.min(m, tt.price), Infinity);
              return (
                <tr key={event.id} className="hover:bg-nautilus-dark/50 transition-colors">
                  <td className="px-4 py-3 max-w-[220px]">
                    <p className="text-sm font-medium text-nautilus-white truncate">{event.title}</p>
                    <p className="text-xs text-nautilus-gray mt-0.5 truncate">{event.slug}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="text-sm text-nautilus-gray">{formatDate(event.startDate)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-nautilus-gray">{event.venue.name.split(" ").slice(0, 2).join(" ")}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-nautilus-gray">
                      {minPrice === 0 ? "Gratuit" : minPrice === Infinity ? "—" : formatPrice(minPrice)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-xs text-nautilus-gray">
                      {event.isPublic
                        ? <><Globe className="h-3.5 w-3.5 text-green-400" /> Public</>
                        : <><Lock className="h-3.5 w-3.5" /> Privé</>}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Button size="icon-sm" variant="ghost" asChild>
                        <Link href={`/admin/events/${event.id}/edit`}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      {event.status === "APPROVED" && (
                        <EventPublishButton eventId={event.id} currentIsPublic={event.isPublic} />
                      )}
                      <EventDeleteButton eventId={event.id} eventTitle={event.title} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {events.length === 0 && (
          <p className="text-center text-nautilus-gray py-12 text-sm">Aucun événement</p>
        )}
      </div>
    </div>
  );
}
