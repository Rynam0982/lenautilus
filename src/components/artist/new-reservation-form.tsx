"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { reservationSchema, type ReservationInput } from "@/lib/validators/event";
import { toast } from "sonner";
import type { Venue } from "@prisma/client";
import { AlertCircle } from "lucide-react";
import { ImageUploadField } from "@/components/admin/image-upload-field";

interface NewReservationFormProps {
  venues: Venue[];
}

export function NewReservationForm({ venues }: NewReservationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [minDate, setMinDate] = useState("");

  useEffect(() => {
    // Format for datetime-local min attribute: "YYYY-MM-DDTHH:mm"
    setMinDate(new Date().toISOString().slice(0, 16));
  }, []);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReservationInput>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      venueId: "",
      startDate: "",
      endDate: "",
      notes: "",
      eventDetails: {
        title: "",
        description: "",
        longDescription: "",
        coverImage: undefined, // "" fails z.string().url() even on optional fields
        categories: [],
      },
    },
  });

  const onSubmit = async (data: ReservationInput) => {
    setIsLoading(true);
    try {
      // Convert datetime-local format to full UTC ISO before sending to API
      const payload = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      };

      const res = await fetch("/api/artist/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = (await res.json()) as { success: boolean; error?: string };

      if (!res.ok) {
        if (res.status === 409) {
          toast.error("Créneau indisponible", {
            description:
              "La salle est déjà réservée pour ce créneau (réservation en attente ou approuvée). Veuillez choisir une autre date.",
          });
        } else if (body.error) {
          toast.error("Demande refusée", { description: body.error });
        } else {
          toast.error("Une erreur est survenue lors de l'envoi de la demande");
        }
        return;
      }

      toast.success("Demande envoyée !", {
        description: "Notre équipe vous contactera rapidement.",
      });
      router.push("/artist/dashboard");
    } catch {
      toast.error("Une erreur est survenue", {
        description: "Vérifiez votre connexion et réessayez.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      {/* Venue & dates */}
      <div className="rounded-2xl border border-nautilus-border bg-nautilus-card p-6 space-y-5">
        <h2 className="font-display text-lg font-semibold text-nautilus-white">
          Salle & créneau
        </h2>

        <div className="space-y-2">
          <Label>Salle</Label>
          <Controller
            name="venueId"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une salle" />
                </SelectTrigger>
                <SelectContent>
                  {venues.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name} — {v.capacity.toLocaleString("fr-FR")} pers.
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.venueId && (
            <p className="text-xs text-red-400">{errors.venueId.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Début</Label>
            <Input
              id="startDate"
              type="datetime-local"
              min={minDate}
              error={errors.startDate?.message}
              {...register("startDate")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">Fin</Label>
            <Input
              id="endDate"
              type="datetime-local"
              min={minDate}
              error={errors.endDate?.message}
              {...register("endDate")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes pour l'équipe (optionnel)</Label>
          <Textarea
            id="notes"
            placeholder="Besoins techniques, configuration de scène, etc."
            rows={3}
            {...register("notes")}
          />
        </div>
      </div>

      {/* Event details */}
      <div className="rounded-2xl border border-nautilus-border bg-nautilus-card p-6 space-y-5">
        <h2 className="font-display text-lg font-semibold text-nautilus-white">
          Informations sur l'événement
        </h2>

        <div className="space-y-2">
          <Label htmlFor="title">Titre de l'événement *</Label>
          <Input
            id="title"
            placeholder="Concert de..."
            error={errors.eventDetails?.title?.message}
            {...register("eventDetails.title")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description courte *</Label>
          <Textarea
            id="description"
            placeholder="Une soirée musicale exceptionnelle..."
            rows={3}
            error={errors.eventDetails?.description?.message}
            {...register("eventDetails.description")}
          />
          <p className="text-xs text-nautilus-gray">Maximum 200 caractères</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="longDescription">Description complète (optionnel)</Label>
          <Textarea
            id="longDescription"
            placeholder="Décrivez l'événement en détail..."
            rows={5}
            {...register("eventDetails.longDescription")}
          />
        </div>

        <div className="space-y-2">
          <ImageUploadField
            label="Affiche / image de couverture (optionnel)"
            value={watch("eventDetails.coverImage") ?? ""}
            onChange={(url) => setValue("eventDetails.coverImage", url || undefined)}
          />
          {errors.eventDetails?.coverImage && (
            <p className="text-xs text-red-400">{errors.eventDetails.coverImage.message}</p>
          )}
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-nautilus-gold/5 border border-nautilus-gold/20">
        <AlertCircle className="h-4 w-4 text-nautilus-gold shrink-0 mt-0.5" />
        <p className="text-sm text-nautilus-gray">
          Votre demande sera examinée par notre équipe. Vous serez notifié de la décision par email. La visibilité publique et la billetterie sont définies par l'administration.
        </p>
      </div>

      <Button type="submit" size="lg" className="w-full" loading={isLoading}>
        Envoyer la demande
      </Button>
    </form>
  );
}
