"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

export function OpenAgendaSyncButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/openagenda/sync", { method: "POST" });
      const data = (await res.json()) as {
        success: boolean;
        data?: { imported: number; skipped: number; errors: number };
        error?: string;
      };

      if (!res.ok) throw new Error(data.error ?? "Erreur");

      const { imported, skipped, errors } = data.data!;
      toast.success(
        `Import terminé : ${imported} importés, ${skipped} ignorés, ${errors} erreurs`
      );
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors du sync");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleSync} loading={isLoading}>
      <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
      Lancer l'import OpenAgenda
    </Button>
  );
}
