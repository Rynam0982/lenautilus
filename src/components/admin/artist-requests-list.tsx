"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X, Loader2, Mail } from "lucide-react";
import type { ArtistRequest } from "@prisma/client";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "En attente",
  APPROVED: "Compte créé",
  REFUSED: "Refusée",
  CANCELLED: "Annulée",
};

export function ArtistRequestsList({ requests }: { requests: ArtistRequest[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function act(requestId: string, action: "create" | "refuse") {
    if (action === "refuse" && !confirm("Refuser cette demande ?")) return;
    setBusyId(requestId);
    try {
      const res = await fetch("/api/admin/artists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? "Erreur");
      toast.success(
        action === "create"
          ? "Compte créé — e-mail d'activation envoyé."
          : "Demande refusée."
      );
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setBusyId(null);
    }
  }

  if (requests.length === 0) {
    return (
      <p className="rounded-xl border border-nautilus-border bg-nautilus-card p-8 text-center text-sm text-nautilus-gray">
        Aucune demande de compte artiste pour le moment.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((r) => {
        const busy = busyId === r.id;
        const pending = r.status === "PENDING";
        return (
          <div
            key={r.id}
            className="rounded-xl border border-nautilus-border bg-nautilus-card p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-lg text-nautilus-white">
                  {r.firstName} {r.lastName}
                </p>
                <p className="flex items-center gap-1.5 text-sm text-nautilus-gray">
                  <Mail className="h-3.5 w-3.5" />
                  {r.email}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-wide ${
                  pending
                    ? "bg-nautilus-gold/15 text-nautilus-gold"
                    : r.status === "APPROVED"
                      ? "bg-green-500/15 text-green-400"
                      : "bg-nautilus-muted text-nautilus-gray"
                }`}
              >
                {STATUS_LABEL[r.status] ?? r.status}
              </span>
            </div>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-nautilus-gray-light">
              {r.description}
            </p>

            {pending && (
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => act(r.id, "create")}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-full bg-nautilus-gold px-5 py-2.5 text-sm font-bold text-nautilus-black transition-colors hover:bg-nautilus-gold-light disabled:opacity-60"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Créer le compte
                </button>
                <button
                  onClick={() => act(r.id, "refuse")}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-full border border-nautilus-border-strong px-5 py-2.5 text-sm font-semibold text-nautilus-gray transition-colors hover:border-red-500/50 hover:text-red-400 disabled:opacity-60"
                >
                  <X className="h-4 w-4" />
                  Refuser
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
