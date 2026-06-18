"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

/** Downloads the event cover, optimized server-side to the best size/quality. */
export function DownloadCoverButton({ eventId, title }: { eventId: string; title: string }) {
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/cover`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-couverture.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Téléchargement impossible.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg border border-nautilus-border bg-nautilus-card px-4 py-2 text-sm text-nautilus-gray-light hover:text-nautilus-white hover:border-nautilus-gold/40 transition-colors disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      Télécharger la couverture
    </button>
  );
}
