"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Globe, Lock } from "lucide-react";

interface EventPublishButtonProps {
  eventId: string;
  currentIsPublic: boolean;
}

export function EventPublishButton({ eventId, currentIsPublic }: EventPublishButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const publish = async (isPublic: boolean) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic }),
      });
      if (!res.ok) throw new Error("Erreur");
      toast.success(`Événement publié en mode ${isPublic ? "public" : "privé"}`);
      router.refresh();
    } catch {
      toast.error("Erreur lors de la publication");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => publish(false)}
        loading={isLoading}
        className="text-xs"
      >
        <Lock className="h-3 w-3" />
        Privé
      </Button>
      <Button
        size="sm"
        onClick={() => publish(true)}
        loading={isLoading}
        className="text-xs"
      >
        <Globe className="h-3 w-3" />
        Public
      </Button>
    </div>
  );
}
