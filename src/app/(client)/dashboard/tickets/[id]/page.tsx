import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { requireAuth } from "@/lib/auth/guards";
import { getTicketByCode, getUserTickets } from "@/services/tickets.service";
import { prisma } from "@/lib/db/client";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateRange, formatPrice } from "@/lib/utils";
import { ArrowLeft, Calendar, MapPin, Ticket } from "lucide-react";
import { TicketQRCode } from "@/components/client/ticket-qrcode";
import { RefundDialog } from "@/components/client/refund-dialog";

export const metadata: Metadata = { title: "Mon billet" };

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ action?: string }>;
}

export default async function TicketDetailPage({ params, searchParams }: PageProps) {
  const session = await requireAuth();
  const { id } = await params;
  const { action } = await searchParams;

  const ticket = await prisma.ticket.findFirst({
    where: { id, userId: session.user.id },
    include: { event: { include: { venue: true } }, ticketType: true },
  });

  if (!ticket) notFound();

  const isPast = new Date(ticket.event.endDate) < new Date();
  const canRefund = ticket.status === "VALID" && !isPast;

  const statusVariant: Record<string, "success" | "secondary" | "danger" | "warning"> = {
    VALID: "success",
    USED: "secondary",
    CANCELLED: "danger",
    REFUNDED: "warning",
  };

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <Link
          href="/dashboard/tickets"
          className="inline-flex items-center gap-2 text-sm text-nautilus-gray hover:text-nautilus-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Mes billets
        </Link>

        {/* Ticket card */}
        <div className="rounded-3xl border border-nautilus-border bg-nautilus-card overflow-hidden">
          {/* Event cover */}
          <div className="relative h-48">
            {ticket.event.coverImage ? (
              <Image
                src={ticket.event.coverImage}
                alt={ticket.event.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full bg-gradient-to-br from-nautilus-muted to-nautilus-dark" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-nautilus-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <Badge variant={statusVariant[ticket.status] ?? "secondary"} className="text-xs">
                {ticket.status === "VALID" ? "Valide" : ticket.status === "USED" ? "Utilisé" : ticket.status === "REFUNDED" ? "Remboursé" : "Annulé"}
              </Badge>
            </div>
          </div>

          <div className="p-6">
            <h1 className="font-display text-2xl font-bold text-nautilus-white mb-1">
              {ticket.event.title}
            </h1>
            <p className="text-nautilus-gold text-sm mb-5">{ticket.ticketType.name}</p>

            <div className="space-y-3 text-sm mb-6">
              <div className="flex items-center gap-3 text-nautilus-gray">
                <Calendar className="h-4 w-4 text-nautilus-gold shrink-0" />
                {formatDateRange(ticket.event.startDate, ticket.event.endDate)}
              </div>
              <div className="flex items-center gap-3 text-nautilus-gray">
                <MapPin className="h-4 w-4 text-nautilus-gold shrink-0" />
                {ticket.event.venue.name}
                {ticket.event.venue.address && (
                  <span className="text-nautilus-gray/60"> — {ticket.event.venue.address}</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-nautilus-gray">
                <Ticket className="h-4 w-4 text-nautilus-gold shrink-0" />
                {ticket.amountPaid === 0 ? "Entrée gratuite" : formatPrice(ticket.amountPaid)}
              </div>
            </div>

            {/* Dashed separator */}
            <div className="relative my-6">
              <div className="border-t border-dashed border-nautilus-border" />
              <div className="absolute -left-6 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-nautilus-black border border-nautilus-border" />
              <div className="absolute -right-6 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-nautilus-black border border-nautilus-border" />
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center">
              <TicketQRCode code={ticket.code} />
              <p className="mt-3 font-mono text-xs text-nautilus-gray tracking-widest">
                {ticket.code.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Refund section */}
        {canRefund && (
          <div className="mt-6">
            <RefundDialog ticketId={ticket.id} defaultOpen={action === "refund"} />
          </div>
        )}
      </div>
    </div>
  );
}
