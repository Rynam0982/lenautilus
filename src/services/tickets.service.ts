import { prisma } from "@/lib/db/client";
import { stripe } from "@/lib/stripe";
import { sendTicketEmail } from "@/lib/email";
import type { TicketWithEvent } from "@/types";

/** Max free tickets a single email may claim for one event (anti-abuse). */
export const FREE_TICKET_LIMIT_PER_EMAIL = 4;

type Buyer = { email: string; name?: string | null };

export async function getUserTickets(userId: string): Promise<TicketWithEvent[]> {
  const tickets = await prisma.ticket.findMany({
    where: { userId },
    include: {
      event: { include: { venue: true } },
      ticketType: true,
    },
    orderBy: { purchasedAt: "desc" },
  });
  return tickets as TicketWithEvent[];
}

export async function getTicketByCode(
  code: string,
  userId: string
): Promise<TicketWithEvent | null> {
  const ticket = await prisma.ticket.findFirst({
    where: { code, userId },
    include: {
      event: { include: { venue: true } },
      ticketType: true,
    },
  });
  return ticket as TicketWithEvent | null;
}

/** Paid checkout — guest only needs to provide an email (receipt + e-ticket). */
export async function createPaymentIntent(
  ticketTypeId: string,
  quantity: number,
  buyer: Buyer
) {
  const ticketType = await prisma.ticketType.findUnique({
    where: { id: ticketTypeId },
    include: { event: true },
  });

  if (!ticketType) throw new Error("Tarif introuvable");
  if (ticketType.event.status !== "PUBLISHED")
    throw new Error("Événement indisponible");
  if (ticketType.price <= 0) throw new Error("Ce tarif est gratuit");

  const available = ticketType.quantity - ticketType.sold;
  if (available < quantity) throw new Error("Plus assez de billets disponibles");

  const amount = ticketType.price * quantity;

  const intent = await stripe.paymentIntents.create({
    amount,
    currency: ticketType.currency.toLowerCase(),
    receipt_email: buyer.email,
    metadata: {
      ticketTypeId,
      eventId: ticketType.eventId,
      buyerEmail: buyer.email,
      buyerName: buyer.name ?? "",
      quantity: String(quantity),
    },
    automatic_payment_methods: { enabled: true },
  });

  return { clientSecret: intent.client_secret, amount, paymentIntentId: intent.id };
}

/** Webhook-driven: materialise paid tickets from a succeeded PaymentIntent. */
export async function confirmTicketPurchase(paymentIntentId: string) {
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (intent.status !== "succeeded") throw new Error("Paiement non confirmé");

  const existing = await prisma.ticket.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
  });
  if (existing) return [existing];

  const { ticketTypeId, eventId, quantity, buyerEmail, buyerName } =
    intent.metadata as {
      ticketTypeId: string;
      eventId: string;
      quantity: string;
      buyerEmail?: string;
      buyerName?: string;
    };
  const qty = parseInt(quantity, 10);

  const tickets = await prisma.$transaction(async (tx) => {
    const ticketType = await tx.ticketType.findUnique({
      where: { id: ticketTypeId },
    });
    if (!ticketType) throw new Error("Tarif introuvable");
    if (ticketType.sold + qty > ticketType.quantity) throw new Error("Complet");

    await tx.ticketType.update({
      where: { id: ticketTypeId },
      data: { sold: { increment: qty } },
    });

    return Promise.all(
      Array.from({ length: qty }).map(() =>
        tx.ticket.create({
          data: {
            ticketTypeId,
            eventId,
            buyerEmail: buyerEmail || null,
            buyerName: buyerName || null,
            amountPaid: Math.round(intent.amount / qty),
            stripePaymentIntentId: paymentIntentId,
            stripeChargeId:
              typeof intent.latest_charge === "string"
                ? intent.latest_charge
                : null,
          },
        })
      )
    );
  });

  if (buyerEmail) await emailTickets(buyerEmail, buyerName ?? null, eventId, tickets.map((t) => t.code), qty);
  return tickets;
}

/** Free tickets — claimed directly (no Stripe), capped per email per event. */
export async function createFreeTickets(
  ticketTypeId: string,
  quantity: number,
  buyer: Buyer
) {
  const email = buyer.email.trim().toLowerCase();

  const ticketType = await prisma.ticketType.findUnique({
    where: { id: ticketTypeId },
    include: { event: true },
  });
  if (!ticketType) throw new Error("Tarif introuvable");
  if (ticketType.event.status !== "PUBLISHED")
    throw new Error("Événement indisponible");
  if (ticketType.price > 0) throw new Error("Ce tarif est payant");

  const available = ticketType.quantity - ticketType.sold;
  if (available < quantity) throw new Error("Plus assez de places disponibles");

  // Anti-abuse: cap total free tickets per email for this event.
  const alreadyClaimed = await prisma.ticket.count({
    where: {
      eventId: ticketType.eventId,
      buyerEmail: email,
      status: { in: ["VALID", "USED"] },
    },
  });
  if (alreadyClaimed + quantity > FREE_TICKET_LIMIT_PER_EMAIL) {
    throw new Error(
      `Limite de ${FREE_TICKET_LIMIT_PER_EMAIL} places gratuites par adresse e-mail pour cet événement.`
    );
  }

  const tickets = await prisma.$transaction(async (tx) => {
    const fresh = await tx.ticketType.findUnique({ where: { id: ticketTypeId } });
    if (!fresh || fresh.sold + quantity > fresh.quantity)
      throw new Error("Plus assez de places disponibles");

    await tx.ticketType.update({
      where: { id: ticketTypeId },
      data: { sold: { increment: quantity } },
    });

    return Promise.all(
      Array.from({ length: quantity }).map(() =>
        tx.ticket.create({
          data: {
            ticketTypeId,
            eventId: ticketType.eventId,
            buyerEmail: email,
            buyerName: buyer.name ?? null,
            amountPaid: 0,
          },
        })
      )
    );
  });

  await emailTickets(email, buyer.name ?? null, ticketType.eventId, tickets.map((t) => t.code), quantity);
  return tickets;
}

async function emailTickets(
  email: string,
  name: string | null,
  eventId: string,
  codes: string[],
  quantity: number
) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { venue: true },
  });
  if (!event) return;
  await sendTicketEmail({
    to: email,
    name,
    eventTitle: event.title,
    venueName: event.venue.name,
    startDate: event.startDate,
    quantity,
    codes,
  });
}

export async function requestRefund(ticketId: string, userId: string, reason: string) {
  const ticket = await prisma.ticket.findFirst({
    where: { id: ticketId, userId },
    include: { event: true },
  });

  if (!ticket) throw new Error("Ticket not found");
  if (ticket.status !== "VALID") throw new Error("Ticket not refundable");
  if (ticket.event.startDate < new Date())
    throw new Error("Cannot refund past events");

  if (!ticket.stripeChargeId && !ticket.stripePaymentIntentId)
    throw new Error("No payment found");

  const refund = await stripe.refunds.create({
    ...(ticket.stripeChargeId
      ? { charge: ticket.stripeChargeId }
      : { payment_intent: ticket.stripePaymentIntentId! }),
    amount: ticket.amountPaid,
    reason: "requested_by_customer",
    metadata: { ticketId, userId, reason },
  });

  await prisma.$transaction([
    prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: "REFUNDED",
        refundedAt: new Date(),
        refundAmount: ticket.amountPaid,
        stripeRefundId: refund.id,
      },
    }),
    prisma.ticketType.update({
      where: { id: ticket.ticketTypeId },
      data: { sold: { decrement: 1 } },
    }),
  ]);

  return refund;
}
