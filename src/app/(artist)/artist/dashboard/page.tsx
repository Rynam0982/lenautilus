export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { requireArtist } from "@/lib/auth/guards";
import { getArtistReservations } from "@/services/reservations.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Plus, Calendar, MapPin, Clock } from "lucide-react";

export const metadata: Metadata = { title: "Espace artiste" };

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "danger" | "secondary" }> = {
  PENDING: { label: "En attente", variant: "warning" },
  APPROVED: { label: "Approuvée", variant: "success" },
  REFUSED: { label: "Refusée", variant: "danger" },
  CANCELLED: { label: "Annulée", variant: "secondary" },
};

export default async function ArtistDashboardPage() {
  const session = await requireArtist();
  const reservations = await getArtistReservations(session.user.id);

  const pending = reservations.filter((r) => r.status === "PENDING");
  const approved = reservations.filter((r) => r.status === "APPROVED");

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-display text-4xl font-bold text-nautilus-white">
              Espace artiste
            </h1>
            <p className="text-nautilus-gray mt-1">
              Gérez vos réservations et événements
            </p>
          </div>
          <Button asChild>
            <Link href="/artist/reservations/new">
              <Plus className="h-4 w-4" />
              Nouvelle demande
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total", value: reservations.length },
            { label: "En attente", value: pending.length },
            { label: "Approuvées", value: approved.length },
            {
              label: "Refusées",
              value: reservations.filter((r) => r.status === "REFUSED").length,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-nautilus-border bg-nautilus-card p-5 text-center"
            >
              <p className="font-display text-3xl font-bold text-nautilus-white mb-1">
                {stat.value}
              </p>
              <p className="text-xs text-nautilus-gray">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Reservations list */}
        <h2 className="font-display text-2xl font-semibold text-nautilus-white mb-5">
          Mes demandes
        </h2>

        {reservations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-nautilus-border p-16 text-center">
            <p className="text-nautilus-gray mb-4">Aucune demande de réservation</p>
            <Button asChild>
              <Link href="/artist/reservations/new">
                <Plus className="h-4 w-4" />
                Faire une demande
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((res) => {
              const config = statusConfig[res.status] ?? { label: res.status, variant: "secondary" as const };
              return (
                <div
                  key={res.id}
                  className="rounded-2xl border border-nautilus-border bg-nautilus-card p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-display text-lg font-semibold text-nautilus-white">
                          {res.event?.title ?? "Événement en cours de création"}
                        </h3>
                        <Badge variant={config.variant}>{config.label}</Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-nautilus-gray">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-nautilus-gold" />
                          {res.venue.name}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-nautilus-gold" />
                          {formatDate(res.startDate)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-nautilus-gold" />
                          {new Date(res.startDate).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          —{" "}
                          {new Date(res.endDate).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {res.adminNotes && res.status === "REFUSED" && (
                        <div className="mt-3 p-3 rounded-lg bg-red-900/10 border border-red-800/30">
                          <p className="text-xs text-red-400">
                            <strong>Note admin :</strong> {res.adminNotes}
                          </p>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-nautilus-gray shrink-0">
                      {formatDate(res.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
