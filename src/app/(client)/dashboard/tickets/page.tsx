export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/guards";
import { getUserTickets } from "@/services/tickets.service";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatPrice } from "@/lib/utils";
import { Ticket, Calendar, MapPin, QrCode } from "lucide-react";
import Image from "next/image";

export const metadata: Metadata = { title: "Mes billets" };

export default async function TicketsPage() {
  const session = await requireAuth();
  const tickets = await getUserTickets(session.user.id);

  const statusLabel: Record<string, string> = {
    VALID: "Valide",
    USED: "Utilisé",
    CANCELLED: "Annulé",
    REFUNDED: "Remboursé",
  };

  const statusVariant: Record<
    string,
    "success" | "secondary" | "danger" | "warning"
  > = {
    VALID: "success",
    USED: "secondary",
    CANCELLED: "danger",
    REFUNDED: "warning",
  };

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="font-display text-4xl font-bold text-nautilus-white mb-2">
            Mes billets
          </h1>
          <p className="text-nautilus-gray">{tickets.length} billet{tickets.length !== 1 ? "s" : ""}</p>
        </div>

        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Ticket className="h-12 w-12 text-nautilus-muted mb-4" />
            <p className="text-nautilus-gray mb-2">Aucun billet pour le moment</p>
            <Link href="/events" className="text-nautilus-gold hover:underline text-sm">
              Découvrir les événements →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex gap-5 p-5 rounded-2xl border border-nautilus-border bg-nautilus-card hover:border-nautilus-gold/30 transition-colors"
              >
                {/* Event image */}
                <div className="relative h-20 w-20 shrink-0 rounded-xl overflow-hidden">
                  {ticket.event.coverImage ? (
                    <Image
                      src={ticket.event.coverImage}
                      alt={ticket.event.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-nautilus-muted" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/events/${ticket.event.slug}`}
                        className="font-display text-lg font-semibold text-nautilus-white hover:text-nautilus-gold transition-colors"
                      >
                        {ticket.event.title}
                      </Link>
                      <p className="text-sm text-nautilus-gray mt-0.5">
                        {ticket.ticketType.name}
                      </p>
                    </div>
                    <Badge variant={statusVariant[ticket.status] ?? "secondary"}>
                      {statusLabel[ticket.status] ?? ticket.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-nautilus-gray">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-nautilus-gold" />
                      {formatDate(ticket.event.startDate)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-nautilus-gold" />
                      {ticket.event.venue.name}
                    </span>
                    <span className="ml-auto font-medium text-nautilus-white">
                      {ticket.amountPaid === 0 ? "Gratuit" : formatPrice(ticket.amountPaid)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    <Link
                      href={`/dashboard/tickets/${ticket.id}`}
                      className="flex items-center gap-1.5 text-xs text-nautilus-gold hover:underline"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      Voir le billet
                    </Link>
                    {ticket.status === "VALID" &&
                      new Date(ticket.event.startDate) > new Date() && (
                        <Link
                          href={`/dashboard/tickets/${ticket.id}?action=refund`}
                          className="text-xs text-nautilus-gray hover:text-red-400 transition-colors"
                        >
                          Demander un remboursement
                        </Link>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
