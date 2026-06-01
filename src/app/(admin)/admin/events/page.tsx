export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllEventsAdmin } from "@/services/events.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Plus, Globe, Lock } from "lucide-react";
import { EventPublishButton } from "@/components/admin/event-publish-button";

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
  const { data: events, total } = await getAllEventsAdmin({ perPage: 50 });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-nautilus-white mb-1">
            Événements
          </h1>
          <p className="text-nautilus-gray text-sm">{total} événements</p>
        </div>
      </div>

      <div className="rounded-2xl border border-nautilus-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-nautilus-border bg-nautilus-dark">
              <th className="text-left px-6 py-3 text-xs uppercase tracking-wider text-nautilus-gray font-medium">
                Événement
              </th>
              <th className="text-left px-6 py-3 text-xs uppercase tracking-wider text-nautilus-gray font-medium hidden md:table-cell">
                Date
              </th>
              <th className="text-left px-6 py-3 text-xs uppercase tracking-wider text-nautilus-gray font-medium hidden lg:table-cell">
                Salle
              </th>
              <th className="text-left px-6 py-3 text-xs uppercase tracking-wider text-nautilus-gray font-medium">
                Statut
              </th>
              <th className="text-left px-6 py-3 text-xs uppercase tracking-wider text-nautilus-gray font-medium">
                Visibilité
              </th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-nautilus-border">
            {events.map((event) => {
              const config = statusConfig[event.status] ?? { label: event.status, variant: "secondary" as const };
              return (
                <tr key={event.id} className="hover:bg-nautilus-dark/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-nautilus-white">{event.title}</p>
                    <p className="text-xs text-nautilus-gray mt-0.5">{event.slug}</p>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <p className="text-sm text-nautilus-gray">{formatDate(event.startDate)}</p>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <p className="text-sm text-nautilus-gray">{event.venue.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-xs text-nautilus-gray">
                      {event.isPublic ? (
                        <>
                          <Globe className="h-3.5 w-3.5 text-green-400" />
                          Public
                        </>
                      ) : (
                        <>
                          <Lock className="h-3.5 w-3.5 text-nautilus-gray" />
                          Privé
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {event.status === "APPROVED" && (
                      <EventPublishButton
                        eventId={event.id}
                        currentIsPublic={event.isPublic}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {events.length === 0 && (
          <p className="text-center text-nautilus-gray py-12 text-sm">
            Aucun événement
          </p>
        )}
      </div>
    </div>
  );
}
