export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { prisma } from "@/lib/db/client";
import { OpenAgendaSyncButton } from "@/components/admin/openagenda-sync-button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { CheckCircle, XCircle } from "lucide-react";

export const metadata: Metadata = { title: "Admin — OpenAgenda" };

export default async function AdminOpenAgendaPage() {
  const [syncLogs, syncedEvents] = await Promise.all([
    prisma.openAgendaSyncLog.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
    }),
    prisma.event.count({ where: { openAgendaSynced: true } }),
  ]);

  const successCount = syncLogs.filter((l) => l.success).length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-nautilus-white mb-1">
          Synchronisation OpenAgenda
        </h1>
        <p className="text-nautilus-gray text-sm">
          {syncedEvents} événements synchronisés
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-nautilus-border bg-nautilus-card p-5">
          <p className="font-display text-3xl font-bold text-nautilus-white mb-1">
            {syncedEvents}
          </p>
          <p className="text-xs text-nautilus-gray">Événements sync.</p>
        </div>
        <div className="rounded-xl border border-nautilus-border bg-nautilus-card p-5">
          <p className="font-display text-3xl font-bold text-green-400 mb-1">
            {successCount}
          </p>
          <p className="text-xs text-nautilus-gray">Opérations réussies</p>
        </div>
        <div className="rounded-xl border border-nautilus-border bg-nautilus-card p-5">
          <p className="font-display text-3xl font-bold text-red-400 mb-1">
            {syncLogs.length - successCount}
          </p>
          <p className="text-xs text-nautilus-gray">Erreurs</p>
        </div>
      </div>

      {/* Actions */}
      <div className="rounded-2xl border border-nautilus-border bg-nautilus-card p-6 mb-8">
        <h2 className="font-display text-lg font-semibold text-nautilus-white mb-3">
          Import initial
        </h2>
        <p className="text-sm text-nautilus-gray mb-5">
          Importez tous les événements existants depuis OpenAgenda vers la base de données locale. Cette opération ne duplique pas les événements déjà importés.
        </p>
        <OpenAgendaSyncButton />
      </div>

      {/* Logs */}
      <div className="rounded-2xl border border-nautilus-border overflow-hidden">
        <div className="px-6 py-4 border-b border-nautilus-border">
          <h2 className="font-display text-lg font-semibold text-nautilus-white">
            Historique des synchronisations
          </h2>
        </div>
        <div className="divide-y divide-nautilus-border">
          {syncLogs.length === 0 ? (
            <p className="px-6 py-8 text-sm text-nautilus-gray text-center">
              Aucune synchronisation effectuée
            </p>
          ) : (
            syncLogs.map((log) => (
              <div key={log.id} className="flex items-center gap-4 px-6 py-3">
                {log.success ? (
                  <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-nautilus-white">{log.action}</p>
                  {log.error && (
                    <p className="text-xs text-red-400 mt-0.5 truncate">{log.error}</p>
                  )}
                </div>
                <time className="text-xs text-nautilus-gray shrink-0">
                  {formatDate(log.createdAt)}
                </time>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
