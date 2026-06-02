export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllEventsAdmin } from "@/services/events.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatPrice } from "@/lib/utils";
import { Plus, Globe, Lock, Pencil, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { EventPublishButton } from "@/components/admin/event-publish-button";
import { EventDeleteButton } from "@/components/admin/event-delete-button";
import type { EventStatus } from "@prisma/client";

export const metadata: Metadata = { title: "Admin — Événements" };

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "secondary" | "danger" }> = {
  DRAFT: { label: "Brouillon", variant: "secondary" },
  PENDING_APPROVAL: { label: "En attente", variant: "warning" },
  APPROVED: { label: "Approuvé", variant: "success" },
  PUBLISHED: { label: "Publié", variant: "success" },
  CANCELLED: { label: "Annulé", variant: "danger" },
  PAST: { label: "Passé", variant: "secondary" },
};

const statusOptions = [
  { value: "", label: "Tous" },
  { value: "PUBLISHED", label: "Publiés" },
  { value: "APPROVED", label: "Approuvés" },
  { value: "DRAFT", label: "Brouillons" },
  { value: "PENDING_APPROVAL", label: "En attente" },
  { value: "CANCELLED", label: "Annulés" },
];

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}

export default async function AdminEventsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const search = params.search;
  const status = params.status as EventStatus | undefined;

  const { data: events, total, totalPages } = await getAllEventsAdmin({
    page,
    perPage: 20,
    search,
    status: status || undefined,
  });

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const p = { page: String(page), search, status, ...overrides };
    const qs = Object.entries(p)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join("&");
    return `/admin/events${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-nautilus-white mb-1">Événements</h1>
          <p className="text-nautilus-gray text-sm">{total} événement{total !== 1 ? "s" : ""}</p>
        </div>
        <Button asChild>
          <Link href="/admin/events/new">
            <Plus className="h-4 w-4" /> Nouvel événement
          </Link>
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-xl border border-nautilus-border bg-nautilus-card">
        {/* Search */}
        <form method="GET" action="/admin/events" className="relative flex-1 min-w-[220px] max-w-xs">
          {status && <input type="hidden" name="status" value={status} />}
          <input type="hidden" name="page" value="1" />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-nautilus-gray pointer-events-none" />
          <input
            name="search"
            defaultValue={search}
            placeholder="Rechercher par titre…"
            className="w-full h-9 pl-8 pr-3 rounded-lg border border-nautilus-border bg-nautilus-dark text-sm text-nautilus-white placeholder:text-nautilus-gray/50 focus:border-nautilus-gold/60 focus:outline-none transition-colors"
          />
        </form>

        {/* Status filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {statusOptions.map((opt) => (
            <Link
              key={opt.value}
              href={buildHref({ status: opt.value || undefined, page: "1" })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                (status ?? "") === opt.value
                  ? "bg-nautilus-gold text-nautilus-black"
                  : "border border-nautilus-border text-nautilus-gray hover:border-nautilus-gold/50 hover:text-nautilus-white"
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
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
          <p className="text-center text-nautilus-gray py-12 text-sm">Aucun événement trouvé</p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-xs text-nautilus-gray">
            Page {page} sur {totalPages} — {total} événement{total !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            {page > 1 ? (
              <Link
                href={buildHref({ page: String(page - 1) })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-nautilus-border text-sm text-nautilus-gray hover:border-nautilus-gold/50 hover:text-nautilus-white transition-colors"
              >
                <ChevronLeft className="h-4 w-4" /> Précédent
              </Link>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-nautilus-border text-sm text-nautilus-gray/30 cursor-not-allowed">
                <ChevronLeft className="h-4 w-4" /> Précédent
              </span>
            )}

            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                let p: number;
                if (totalPages <= 7) {
                  p = i + 1;
                } else if (page <= 4) {
                  p = i + 1;
                } else if (page >= totalPages - 3) {
                  p = totalPages - 6 + i;
                } else {
                  p = page - 3 + i;
                }
                return (
                  <Link
                    key={p}
                    href={buildHref({ page: String(p) })}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? "bg-nautilus-gold text-nautilus-black"
                        : "border border-nautilus-border text-nautilus-gray hover:border-nautilus-gold/50 hover:text-nautilus-white"
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
            </div>

            {page < totalPages ? (
              <Link
                href={buildHref({ page: String(page + 1) })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-nautilus-border text-sm text-nautilus-gray hover:border-nautilus-gold/50 hover:text-nautilus-white transition-colors"
              >
                Suivant <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-nautilus-border text-sm text-nautilus-gray/30 cursor-not-allowed">
                Suivant <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
