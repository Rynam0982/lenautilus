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

export const reservationSchema = z.object({
  venueId: z.string().cuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  notes: z.string().max(2000).optional(),
  eventDetails: z.object({
    title: z.string().min(2).max(140),
    description: z.string().min(10).max(200),
    longDescription: z.string().max(10000).optional(),
    categories: z.array(z.string()).max(5).optional(),
    coverImage: z.string().url().optional(),
  }),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type AdminUpdateEventInput = z.infer<typeof adminUpdateEventSchema>;
export type ReservationInput = z.infer<typeof reservationSchema>;
export type TicketTypeInput = z.infer<typeof ticketTypeSchema>;
