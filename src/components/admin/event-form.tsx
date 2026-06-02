"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Globe, Lock } from "lucide-react";
import type { Venue, Event, TicketType } from "@prisma/client";
import { ImageUploadField } from "@/components/admin/image-upload-field";

const ticketSchema = z.object({
  name: z.string().min(1),
  price: z.number().min(0),
  quantity: z.number().int().min(1),
  description: z.string().optional(),
});

const formSchema = z.object({
  title: z.string().min(2).max(140),
  description: z.string().min(10).max(200),
  longDescription: z.string().max(10000).optional(),
  coverImage: z.string().url().optional().or(z.literal("")),
  startDate: z.string().min(1, "Date requise"),
  endDate: z.string().min(1, "Date requise"),
  venueId: z.string().cuid("Salle requise"),
  conditions: z.string().max(255).optional(),
  isPublic: z.boolean(),
  ticketTypes: z.array(ticketSchema).min(1),
});

type FormValues = z.infer<typeof formSchema>;

interface EventFormProps {
  venues: Venue[];
  event?: Event & { ticketTypes: TicketType[] };
}

function toDatetimeLocal(date: Date): string {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function EventForm({ venues, event }: EventFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isEdit = !!event;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: event?.title ?? "",
      description: event?.description ?? "",
      longDescription: event?.longDescription ?? "",
      coverImage: event?.coverImage ?? "",
      startDate: event ? toDatetimeLocal(event.startDate) : "",
      endDate: event ? toDatetimeLocal(event.endDate) : "",
      venueId: event?.venueId ?? "",
      conditions: event?.conditions ?? "",
      isPublic: event?.isPublic ?? false,
      ticketTypes: event?.ticketTypes.map((tt) => ({
        name: tt.name,
        price: tt.price / 100,
        quantity: tt.quantity,
        description: tt.description ?? "",
      })) ?? [{ name: "Entrée", price: 0, quantity: 200, description: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "ticketTypes" });
  const isPublic = watch("isPublic");

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        coverImage: data.coverImage || undefined,
        ticketTypes: data.ticketTypes.map((tt) => ({
          ...tt,
          price: Math.round(tt.price * 100), // convert to cents
        })),
      };

      const url = isEdit ? `/api/admin/events/${event.id}` : "/api/admin/events";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = (await res.json()) as { success: boolean; error?: string };
      if (!res.ok) throw new Error(body.error ?? "Erreur");

      toast.success(isEdit ? "Événement mis à jour" : "Événement créé");
      router.push("/admin/events");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl" noValidate>
      {/* Infos générales */}
      <div className="rounded-2xl border border-nautilus-border bg-nautilus-card p-6 space-y-5">
        <h2 className="font-display text-lg font-semibold text-nautilus-white">
          Informations générales
        </h2>

        <div className="space-y-2">
          <Label>Titre *</Label>
          <Input placeholder="Nom de l'événement" error={errors.title?.message} {...register("title")} />
        </div>

        <div className="space-y-2">
          <Label>Description courte * <span className="text-nautilus-gray text-xs">(max 200 car.)</span></Label>
          <Textarea rows={2} placeholder="Résumé en une ou deux phrases" error={errors.description?.message} {...register("description")} />
        </div>

        <div className="space-y-2">
          <Label>Description complète</Label>
          <Textarea rows={6} placeholder="Détails de l'événement..." {...register("longDescription")} />
        </div>

        <div className="space-y-2">
          <ImageUploadField
            label="Image de couverture"
            value={watch("coverImage") ?? ""}
            onChange={(url) => setValue("coverImage", url)}
          />
        </div>

        <div className="space-y-2">
          <Label>Conditions / Tarif</Label>
          <Input placeholder="Ex: 6€, Entrée libre, Sur invitation..." {...register("conditions")} />
        </div>
      </div>

      {/* Date & Salle */}
      <div className="rounded-2xl border border-nautilus-border bg-nautilus-card p-6 space-y-5">
        <h2 className="font-display text-lg font-semibold text-nautilus-white">Date & Salle</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Début *</Label>
            <Input type="datetime-local" error={errors.startDate?.message} {...register("startDate")} />
          </div>
          <div className="space-y-2">
            <Label>Fin *</Label>
            <Input type="datetime-local" error={errors.endDate?.message} {...register("endDate")} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Salle *</Label>
          <Select
            defaultValue={event?.venueId ?? ""}
            onValueChange={(v) => setValue("venueId", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir une salle" />
            </SelectTrigger>
            <SelectContent>
              {venues.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name} — {v.capacity} pers.
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.venueId && <p className="text-xs text-red-400">{errors.venueId.message}</p>}
        </div>
      </div>

      {/* Visibilité */}
      <div className="rounded-2xl border border-nautilus-border bg-nautilus-card p-6">
        <h2 className="font-display text-lg font-semibold text-nautilus-white mb-4">Visibilité</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { val: false, icon: Lock, label: "Privé", desc: "Visible uniquement dans l'admin" },
            { val: true, icon: Globe, label: "Public", desc: "Visible sur le site + OpenAgenda" },
          ].map(({ val, icon: Icon, label, desc }) => (
            <button
              key={String(val)}
              type="button"
              onClick={() => setValue("isPublic", val)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-left ${
                isPublic === val
                  ? "border-nautilus-gold bg-nautilus-gold/5 text-nautilus-white"
                  : "border-nautilus-border text-nautilus-gray hover:border-nautilus-gold/50"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm font-medium">{label}</span>
              <span className="text-xs text-center text-nautilus-gray">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Billets */}
      <div className="rounded-2xl border border-nautilus-border bg-nautilus-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-nautilus-white">Billets</h2>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => append({ name: "Tarif", price: 0, quantity: 100, description: "" })}
          >
            <Plus className="h-3.5 w-3.5" /> Ajouter
          </Button>
        </div>

        {fields.map((field, i) => (
          <div key={field.id} className="grid grid-cols-4 gap-3 p-3 rounded-lg bg-nautilus-dark border border-nautilus-border">
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Nom</Label>
              <Input className="h-8 text-sm" {...register(`ticketTypes.${i}.name`)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Prix (€)</Label>
              <Input
                className="h-8 text-sm"
                type="number"
                step="0.01"
                min="0"
                {...register(`ticketTypes.${i}.price`, { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Quantité</Label>
              <div className="flex gap-1">
                <Input
                  className="h-8 text-sm"
                  type="number"
                  min="1"
                  {...register(`ticketTypes.${i}.quantity`, { valueAsNumber: true })}
                />
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-red-400 hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={isLoading}>
          {isEdit ? "Enregistrer les modifications" : "Créer l'événement"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
