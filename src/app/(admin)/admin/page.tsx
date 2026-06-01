export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { prisma } from "@/lib/db/client";
import { formatPrice } from "@/lib/utils";
import {
  CalendarDays,
  Users,
  Ticket,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "Admin — Tableau de bord" };

async function getStats() {
  const [
    totalEvents,
    publishedEvents,
    totalUsers,
    totalTickets,
    pendingReservations,
    revenue,
  ] = await Promise.all([
    prisma.event.count(),
    prisma.event.count({ where: { status: "PUBLISHED" } }),
    prisma.user.count(),
    prisma.ticket.count({ where: { status: { in: ["VALID", "USED"] } } }),
    prisma.venueReservation.count({ where: { status: "PENDING" } }),
    prisma.ticket.aggregate({
      where: { status: { in: ["VALID", "USED"] } },
      _sum: { amountPaid: true },
    }),
  ]);

  return {
    totalEvents,
    publishedEvents,
    totalUsers,
    totalTickets,
    pendingReservations,
    revenue: revenue._sum.amountPaid ?? 0,
  };
}

async function getRecentActivity() {
  const logs = await prisma.auditLog.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } }, event: { select: { title: true, slug: true } } },
  });
  return logs;
}

export default async function AdminDashboardPage() {
  const [stats, activity] = await Promise.all([getStats(), getRecentActivity()]);

  const statCards = [
    { label: "Événements publiés", value: stats.publishedEvents, sub: `${stats.totalEvents} total`, icon: CalendarDays, href: "/admin/events" },
    { label: "Utilisateurs", value: stats.totalUsers, sub: "inscrits", icon: Users, href: "/admin/users" },
    { label: "Billets vendus", value: stats.totalTickets, sub: "actifs", icon: Ticket, href: "/admin/events" },
    { label: "Revenus", value: formatPrice(stats.revenue), sub: "total net", icon: TrendingUp, href: "/admin/analytics" },
  ];

  const actionLabels: Record<string, string> = {
    EVENT_CREATED: "Événement créé",
    EVENT_UPDATED: "Événement modifié",
    EVENT_APPROVED: "Événement approuvé",
    EVENT_REFUSED: "Événement refusé",
    EVENT_PUBLISHED: "Événement publié",
    EVENT_CANCELLED: "Événement annulé",
    RESERVATION_CREATED: "Réservation soumise",
    RESERVATION_APPROVED: "Réservation approuvée",
    RESERVATION_REFUSED: "Réservation refusée",
    TICKET_PURCHASED: "Billet acheté",
    TICKET_REFUNDED: "Billet remboursé",
    OPENAGENDA_SYNCED: "Sync OpenAgenda",
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-nautilus-white mb-1">
          Tableau de bord
        </h1>
        <p className="text-nautilus-gray text-sm">Vue d'ensemble de la plateforme</p>
      </div>

      {/* Pending reservations alert */}
      {stats.pendingReservations > 0 && (
        <Link
          href="/admin/reservations"
          className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-nautilus-gold/10 border border-nautilus-gold/30 hover:bg-nautilus-gold/15 transition-colors"
        >
          <Clock className="h-5 w-5 text-nautilus-gold shrink-0" />
          <p className="text-sm text-nautilus-white">
            <strong className="text-nautilus-gold">{stats.pendingReservations}</strong>{" "}
            demande{stats.pendingReservations > 1 ? "s" : ""} de réservation en attente de traitement
          </p>
        </Link>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-2xl border border-nautilus-border bg-nautilus-card p-6 hover:border-nautilus-gold/30 transition-colors group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nautilus-gold/10">
                <card.icon className="h-5 w-5 text-nautilus-gold" />
              </div>
            </div>
            <p className="font-display text-3xl font-bold text-nautilus-white mb-1">
              {card.value}
            </p>
            <p className="text-sm text-nautilus-gray">{card.label}</p>
            <p className="text-xs text-nautilus-gray/60 mt-0.5">{card.sub}</p>
          </Link>
        ))}
      </div>

      {/* Recent activity */}
      <div className="rounded-2xl border border-nautilus-border bg-nautilus-card">
        <div className="px-6 py-4 border-b border-nautilus-border">
          <h2 className="font-display text-lg font-semibold text-nautilus-white">
            Activité récente
          </h2>
        </div>
        <div className="divide-y divide-nautilus-border">
          {activity.length === 0 ? (
            <p className="px-6 py-8 text-sm text-nautilus-gray text-center">
              Aucune activité récente
            </p>
          ) : (
            activity.map((log) => (
              <div key={log.id} className="flex items-center gap-4 px-6 py-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-nautilus-gold/10 shrink-0">
                  <CheckCircle className="h-4 w-4 text-nautilus-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-nautilus-white">
                    {actionLabels[log.action] ?? log.action}
                    {log.event && (
                      <span className="text-nautilus-gold">
                        {" "}— {log.event.title}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-nautilus-gray">
                    par {log.user.name ?? log.user.email}
                  </p>
                </div>
                <time className="text-xs text-nautilus-gray shrink-0">
                  {new Date(log.createdAt).toLocaleString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
