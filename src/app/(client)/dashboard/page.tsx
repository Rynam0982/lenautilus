export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/guards";
import { getUserTickets } from "@/services/tickets.service";
import { Ticket, CalendarDays, ArrowRight } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";
import Image from "next/image";

export default async function DashboardPage() {
  const session = await requireAuth();

  // Artists and admins have dedicated dashboards — redirect them
  if (session.user.role === "ADMIN") redirect("/admin");
  if (session.user.role === "ARTIST") redirect("/artist/dashboard");

  const tickets = await getUserTickets(session.user.id);
  const upcoming = tickets.filter(
    (t) => t.status === "VALID" && new Date(t.event.startDate) > new Date()
  );

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-nautilus-gold mb-2">
            Mon espace
          </p>
          <h1 className="font-display text-4xl font-bold text-nautilus-white">
            Bonjour{session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""} 👋
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="rounded-2xl border border-nautilus-border bg-nautilus-card p-6">
            <p className="font-display text-3xl font-bold text-nautilus-white mb-1">
              {tickets.length}
            </p>
            <p className="text-sm text-nautilus-gray">Billet{tickets.length > 1 ? "s" : ""} total</p>
          </div>
          <div className="rounded-2xl border border-nautilus-border bg-nautilus-card p-6">
            <p className="font-display text-3xl font-bold text-nautilus-gold mb-1">
              {upcoming.length}
            </p>
            <p className="text-sm text-nautilus-gray">À venir</p>
          </div>
        </div>

        {/* Upcoming events */}
        {upcoming.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-nautilus-white">
                Mes prochains événements
              </h2>
              <Link
                href="/dashboard/tickets"
                className="text-sm text-nautilus-gold hover:underline flex items-center gap-1"
              >
                Tous les billets <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {upcoming.slice(0, 3).map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/dashboard/tickets/${ticket.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl border border-nautilus-border bg-nautilus-card hover:border-nautilus-gold/30 transition-colors"
                >
                  <div className="relative h-14 w-14 shrink-0 rounded-lg overflow-hidden">
                    {ticket.event.coverImage ? (
                      <Image
                        src={ticket.event.coverImage}
                        alt={ticket.event.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-nautilus-muted flex items-center justify-center">
                        <Ticket className="h-5 w-5 text-nautilus-gray" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-nautilus-white truncate">
                      {ticket.event.title}
                    </p>
                    <p className="text-xs text-nautilus-gray mt-0.5 flex items-center gap-1.5">
                      <CalendarDays className="h-3 w-3" />
                      {formatDate(ticket.event.startDate)}
                    </p>
                  </div>
                  <p className="text-xs text-nautilus-gray shrink-0">
                    {ticket.amountPaid === 0 ? "Gratuit" : formatPrice(ticket.amountPaid)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/dashboard/tickets"
            className="flex items-center gap-4 p-5 rounded-2xl border border-nautilus-border bg-nautilus-card hover:border-nautilus-gold/30 transition-colors group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nautilus-gold/10">
              <Ticket className="h-5 w-5 text-nautilus-gold" />
            </div>
            <div>
              <p className="text-sm font-medium text-nautilus-white group-hover:text-nautilus-gold transition-colors">
                Mes billets
              </p>
              <p className="text-xs text-nautilus-gray">{tickets.length} billet{tickets.length > 1 ? "s" : ""}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-nautilus-gray ml-auto" />
          </Link>
          <Link
            href="/events"
            className="flex items-center gap-4 p-5 rounded-2xl border border-nautilus-border bg-nautilus-card hover:border-nautilus-gold/30 transition-colors group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nautilus-gold/10">
              <CalendarDays className="h-5 w-5 text-nautilus-gold" />
            </div>
            <div>
              <p className="text-sm font-medium text-nautilus-white group-hover:text-nautilus-gold transition-colors">
                Découvrir les événements
              </p>
              <p className="text-xs text-nautilus-gray">Programme complet</p>
            </div>
            <ArrowRight className="h-4 w-4 text-nautilus-gray ml-auto" />
          </Link>
        </div>
      </div>
    </div>
  );
}
