"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface RefundDialogProps {
  ticketId: string;
  defaultOpen?: boolean;
}

export function RefundDialog({ ticketId, defaultOpen = false }: RefundDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen);
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRefund = async () => {
    if (reason.trim().length < 10) {
      toast.error("Veuillez préciser la raison (minimum 10 caractères)");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/client/tickets/${ticketId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Erreur lors du remboursement");
      }

      toast.success("Demande de remboursement envoyée");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full border-red-800/50 text-red-400 hover:bg-red-900/20 hover:border-red-700 hover:text-red-300">
          Demander un remboursement
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Demande de remboursement</DialogTitle>
          <DialogDescription>
            Expliquez la raison de votre demande. Le remboursement sera traité sous 5-10 jours ouvrés.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Label htmlFor="reason">Raison</Label>
          <Textarea
            id="reason"
            placeholder="Je ne peux pas assister à l'événement car..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleRefund}
            loading={isLoading}
          >
            Confirmer le remboursement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
