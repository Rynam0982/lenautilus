export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { getAllReservationsAdmin } from "@/services/reservations.service";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { ReservationActions } from "@/components/admin/reservation-actions";
import { UserAvatar } from "@/components/ui/avatar";

export const metadata: Metadata = { title: "Admin — Réservations" };

const statusConfig: Record<string, { label: string; variant: "warning" | "success" | "danger" | "secondary" }> = {
  PENDING: { label: "En attente", variant: "warning" },
  APPROVED: { label: "Approuvée", variant: "success" },
  REFUSED: { label: "Refusée", variant: "danger" },
  CANCELLED: { label: "Annulée", variant: "secondary" },
};

export default async function AdminReservationsPage() {
  const reservations = await getAllReservationsAdmin();

  const pending = reservations.filter((r) => r.status === "PENDING");
  const others = reservations.filter((r) => r.status !== "PENDING");

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-nautilus-white mb-1">
          Réservations
        </h1>
        <p className="text-nautilus-gray text-sm">
          {pending.length} en attente · {reservations.length} total
        </p>
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm uppercase tracking-widest text-nautilus-gold mb-4">
            À traiter
          </h2>
          <div className="space-y-3">
            {pending.map((res) => (
              <ReservationCard key={res.id} reservation={res} />
            ))}
          </div>
        </div>
      )}

      {/* Others */}
      {others.length > 0 && (
        <div>
          <h2 className="text-sm uppercase tracking-widest text-nautilus-gray mb-4">
            Historique
          </h2>
          <div className="space-y-3">
            {others.map((res) => (
              <ReservationCard key={res.id} reservation={res} />
            ))}
          </div>
        </div>
      )}

      {reservations.length === 0 && (
        <p className="text-center text-nautilus-gray py-24">
          Aucune réservation pour le moment.
        </p>
      )}
    </div>
  );
}

function ReservationCard({ reservation }: { reservation: Awaited<ReturnType<typeof getAllReservationsAdmin>>[number] }) {
  const config = statusConfig[reservation.status] ?? { label: reservation.status, variant: "secondary" as const };

  return (
    <div className="rounded-2xl border border-nautilus-border bg-nautilus-card p-5">
      <div className="flex items-start gap-4">
        <UserAvatar
          name={reservation.artist.user.name}
          image={reservation.artist.user.image}
          className="h-10 w-10 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <p className="font-medium text-nautilus-white">
              {reservation.artist.stageName}
            </p>
            <Badge variant={config.variant}>{config.label}</Badge>
          </div>
          <p className="text-sm text-nautilus-gray mb-2">
            {reservation.event?.title ?? "Sans titre"}
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-nautilus-gray">
            <span>{reservation.venue.name}</span>
            <span>{formatDate(reservation.startDate)}</span>
            <span>
              {new Date(reservation.startDate).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              {" — "}
              {new Date(reservation.endDate).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          {reservation.notes && (
            <p className="mt-2 text-xs text-nautilus-gray/70 italic">
              &ldquo;{reservation.notes}&rdquo;
            </p>
          )}
        </div>

        {reservation.status === "PENDING" && (
          <ReservationActions reservationId={reservation.id} />
        )}
      </div>
    </div>
  );
}
