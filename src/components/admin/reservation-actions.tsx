"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Check, X, Globe, Lock } from "lucide-react";

interface ReservationActionsProps {
  reservationId: string;
}

export function ReservationActions({ reservationId }: ReservationActionsProps) {
  const router = useRouter();
  const [approveOpen, setApproveOpen] = useState(false);
  const [refuseOpen, setRefuseOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/reservations/${reservationId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic, adminNotes }),
      });
      if (!res.ok) throw new Error("Erreur");
      toast.success(`Réservation approuvée — événement ${isPublic ? "public" : "privé"}`);
      setApproveOpen(false);
      router.refresh();
    } catch {
      toast.error("Erreur lors de l'approbation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefuse = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/reservations/${reservationId}/refuse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes }),
      });
      if (!res.ok) throw new Error("Erreur");
      toast.success("Réservation refusée");
      setRefuseOpen(false);
      router.refresh();
    } catch {
      toast.error("Erreur lors du refus");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setRefuseOpen(true)}
          className="border-red-800/50 text-red-400 hover:bg-red-900/20"
        >
          <X className="h-3.5 w-3.5" />
          Refuser
        </Button>
        <Button size="sm" onClick={() => setApproveOpen(true)}>
          <Check className="h-3.5 w-3.5" />
          Approuver
        </Button>
      </div>

      {/* Approve dialog */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approuver la réservation</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-sm text-nautilus-gray">
              Choisissez la visibilité de l'événement associé :
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsPublic(false)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  !isPublic
                    ? "border-nautilus-gold bg-nautilus-gold/5 text-nautilus-white"
                    : "border-nautilus-border text-nautilus-gray hover:border-nautilus-gold/50"
                }`}
              >
                <Lock className="h-5 w-5" />
                <span className="text-sm font-medium">Privé</span>
                <span className="text-xs text-center text-nautilus-gray">
                  Visible uniquement par l'admin
                </span>
              </button>
              <button
                onClick={() => setIsPublic(true)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  isPublic
                    ? "border-nautilus-gold bg-nautilus-gold/5 text-nautilus-white"
                    : "border-nautilus-border text-nautilus-gray hover:border-nautilus-gold/50"
                }`}
              >
                <Globe className="h-5 w-5" />
                <span className="text-sm font-medium">Public</span>
                <span className="text-xs text-center text-nautilus-gray">
                  Visible + sync OpenAgenda
                </span>
              </button>
            </div>

            <div className="space-y-2">
              <Label>Note pour l'artiste (optionnel)</Label>
              <Textarea
                placeholder="Message de confirmation..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setApproveOpen(false)}>Annuler</Button>
            <Button onClick={handleApprove} loading={isLoading}>
              <Check className="h-4 w-4" />
              Confirmer l'approbation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refuse dialog */}
      <Dialog open={refuseOpen} onOpenChange={setRefuseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refuser la réservation</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Raison du refus (optionnel)</Label>
              <Textarea
                placeholder="Expliquez la raison du refus à l'artiste..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setRefuseOpen(false)}>Annuler</Button>
            <Button variant="destructive" onClick={handleRefuse} loading={isLoading}>
              Confirmer le refus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
