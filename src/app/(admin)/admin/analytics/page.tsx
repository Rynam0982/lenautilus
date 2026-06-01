export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { prisma } from "@/lib/db/client";
import { formatPrice, formatDate } from "@/lib/utils";
import { TrendingUp, Ticket, Users, CalendarDays } from "lucide-react";

export const metadata: Metadata = { title: "Admin — Analytiques" };

export default async function AdminAnalyticsPage() {
  const [
    revenueByMonth,
    topEvents,
    ticketsByStatus,
    usersByRole,
  ] = await Promise.all([
    prisma.ticket.groupBy({
      by: ["purchasedAt"],
      where: { status: { in: ["VALID", "USED"] } },
      _sum: { amountPaid: true },
      _count: { id: true },
      orderBy: { purchasedAt: "desc" },
    }),
    prisma.event.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { tickets: { _count: "desc" } },
      take: 5,
      include: {
        _count: { select: { tickets: true } },
        venue: { select: { name: true } },
      },
    }),
    prisma.ticket.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.user.groupBy({
      by: ["role"],
      _count: { id: true },
    }),
  ]);

  const totalRevenue = revenueByMonth.reduce(
    (sum, r) => sum + (r._sum.amountPaid ?? 0),
    0
  );
  const totalTickets = revenueByMonth.reduce((sum, r) => sum + r._count.id, 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-nautilus-white mb-1">
          Analytiques
        </h1>
        <p className="text-nautilus-gray text-sm">Vue d'ensemble des performances</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
        <KPICard
          icon={TrendingUp}
          label="Revenus totaux"
          value={formatPrice(totalRevenue)}
        />
        <KPICard
          icon={Ticket}
          label="Billets vendus"
          value={String(totalTickets)}
        />
        <KPICard
          icon={Users}
          label="Utilisateurs"
          value={String(usersByRole.reduce((s, r) => s + r._count.id, 0))}
        />
        <KPICard
          icon={CalendarDays}
          label="Billets valides"
          value={String(
            ticketsByStatus.find((t) => t.status === "VALID")?._count.id ?? 0
          )}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top events */}
        <div className="rounded-2xl border border-nautilus-border bg-nautilus-card">
          <div className="px-6 py-4 border-b border-nautilus-border">
            <h2 className="font-display text-lg font-semibold text-nautilus-white">
              Top événements
            </h2>
          </div>
          <div className="divide-y divide-nautilus-border">
            {topEvents.length === 0 ? (
              <p className="px-6 py-8 text-sm text-nautilus-gray text-center">Aucune donnée</p>
            ) : (
              topEvents.map((event, i) => (
                <div key={event.id} className="flex items-center gap-4 px-6 py-4">
                  <span className="text-nautilus-gold font-bold text-sm w-5">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-nautilus-white truncate">{event.title}</p>
                    <p className="text-xs text-nautilus-gray">{event.venue.name}</p>
                  </div>
                  <span className="text-sm font-medium text-nautilus-white shrink-0">
                    {event._count.tickets} billet{event._count.tickets > 1 ? "s" : ""}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tickets by status */}
        <div className="rounded-2xl border border-nautilus-border bg-nautilus-card">
          <div className="px-6 py-4 border-b border-nautilus-border">
            <h2 className="font-display text-lg font-semibold text-nautilus-white">
              Billets par statut
            </h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            {ticketsByStatus.map((ts) => {
              const labels: Record<string, string> = {
                VALID: "Valides",
                USED: "Utilisés",
                CANCELLED: "Annulés",
                REFUNDED: "Remboursés",
              };
              const total = ticketsByStatus.reduce((s, t) => s + t._count.id, 0);
              const pct = total ? Math.round((ts._count.id / total) * 100) : 0;
              return (
                <div key={ts.status}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-nautilus-gray">{labels[ts.status] ?? ts.status}</span>
                    <span className="text-nautilus-white font-medium">
                      {ts._count.id} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-nautilus-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-nautilus-gold"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Users by role */}
        <div className="rounded-2xl border border-nautilus-border bg-nautilus-card">
          <div className="px-6 py-4 border-b border-nautilus-border">
            <h2 className="font-display text-lg font-semibold text-nautilus-white">
              Utilisateurs par rôle
            </h2>
          </div>
          <div className="px-6 py-6 space-y-4">
            {usersByRole.map((r) => {
              const labels: Record<string, string> = {
                ADMIN: "Administrateurs",
                ARTIST: "Artistes",
                CLIENT: "Clients",
              };
              const total = usersByRole.reduce((s, u) => s + u._count.id, 0);
              const pct = total ? Math.round((r._count.id / total) * 100) : 0;
              return (
                <div key={r.role}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-nautilus-gray">{labels[r.role] ?? r.role}</span>
                    <span className="text-nautilus-white font-medium">
                      {r._count.id}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-nautilus-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-nautilus-gold"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-nautilus-border bg-nautilus-card p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nautilus-gold/10 mb-4">
        <Icon className="h-5 w-5 text-nautilus-gold" />
      </div>
      <p className="font-display text-3xl font-bold text-nautilus-white mb-1">{value}</p>
      <p className="text-sm text-nautilus-gray">{label}</p>
    </div>
  );
}
