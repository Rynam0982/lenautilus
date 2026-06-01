import { z } from "zod";

export const ticketTypeSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  price: z.number().int().min(0),
  quantity: z.number().int().min(1).max(10000),
  saleStartAt: z.string().datetime().optional(),
  saleEndAt: z.string().datetime().optional(),
});

export const createEventSchema = z.object({
  title: z.string().min(2).max(140),
  description: z.string().min(10).max(200),
  longDescription: z.string().max(10000).optional(),
  coverImage: z.string().url().optional(),
  gallery: z.array(z.string().url()).max(10).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  venueId: z.string().cuid(),
  categories: z.array(z.string()).max(5).optional(),
  keywords: z.array(z.string()).max(10).optional(),
  conditions: z.string().max(255).optional(),
  ageMin: z.number().int().min(0).max(120).optional(),
  ageMax: z.number().int().min(0).max(120).optional(),
  ticketTypes: z.array(ticketTypeSchema).min(1).max(10).optional(),
});

export const updateEventSchema = createEventSchema.partial().extend({
  id: z.string().cuid(),
});

export const adminUpdateEventSchema = updateEventSchema.extend({
  isPublic: z.boolean().optional(),
  status: z
    .enum([
      "DRAFT",
      "PENDING_APPROVAL",
      "APPROVED",
      "PUBLISHED",
      "CANCELLED",
      "PAST",
    ])
    .optional(),
});

// Accepts both datetime-local format ("2026-07-05T02:34") and full ISO strings
const dateField = (label: string) =>
  z
    .string()
    .min(1, `La date de ${label} est requise`)
    .refine((val) => !isNaN(new Date(val).getTime()), {
      message: `La date de ${label} est invalide`,
    });

export const reservationSchema = z
  .object({
    venueId: z.string().cuid({ message: "Veuillez sélectionner une salle" }),
    startDate: dateField("début"),
    endDate: dateField("fin"),
    notes: z.string().max(2000, "Maximum 2000 caractères").optional(),
    eventDetails: z.object({
      title: z
        .string()
        .min(2, "Le titre doit contenir au moins 2 caractères")
        .max(140, "Le titre ne peut pas dépasser 140 caractères"),
      description: z
        .string()
        .min(10, "La description doit contenir au moins 10 caractères")
        .max(200, "La description ne peut pas dépasser 200 caractères"),
      longDescription: z.string().max(10000).optional(),
      categories: z.array(z.string()).max(5).optional(),
      coverImage: z.string().url("URL de l'image invalide").optional(),
    }),
  })
  .superRefine((data, ctx) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const now = new Date();

    if (!isNaN(start.getTime()) && start <= now) {
      ctx.addIssue({
        code: "custom",
        path: ["startDate"],
        message: "La date de début doit être dans le futur",
      });
    }

    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end <= start) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "La date de fin doit être après la date de début",
      });
    }
  });

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type AdminUpdateEventInput = z.infer<typeof adminUpdateEventSchema>;
export type ReservationInput = z.infer<typeof reservationSchema>;
export type TicketTypeInput = z.infer<typeof ticketTypeSchema>;
