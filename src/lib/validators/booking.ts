import { z } from "zod";

export const purchaseTicketSchema = z.object({
  ticketTypeId: z.string().cuid(),
  quantity: z.number().int().min(1).max(10),
  paymentIntentId: z.string(),
});

export const refundTicketSchema = z.object({
  ticketId: z.string().cuid(),
  reason: z.string().min(10).max(500),
});

export type PurchaseTicketInput = z.infer<typeof purchaseTicketSchema>;
export type RefundTicketInput = z.infer<typeof refundTicketSchema>;
