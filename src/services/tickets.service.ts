import { prisma } from "@/lib/db/client";
import { stripe } from "@/lib/stripe";
import type { TicketWithEvent } from "@/types";

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

export async function createPaymentIntent(
  ticketTypeId: string,
  quantity: number,
  userId: string
) {
  const ticketType = await prisma.ticketType.findUnique({
    where: { id: ticketTypeId },
    include: { event: true },
  });

  if (!ticketType) throw new Error("Ticket type not found");
  if (ticketType.event.status !== "PUBLISHED")
    throw new Error("Event not available");

  const available = ticketType.quantity - ticketType.sold;
  if (available < quantity) throw new Error("Not enough tickets available");

  const amount = ticketType.price * quantity;

  const intent = await stripe.paymentIntents.create({
    amount,
    currency: ticketType.currency.toLowerCase(),
    metadata: {
      ticketTypeId,
      eventId: ticketType.eventId,
      userId,
      quantity: String(quantity),
    },
    automatic_payment_methods: { enabled: true },
  });

  return { clientSecret: intent.client_secret, amount, paymentIntentId: intent.id };
}

export async function confirmTicketPurchase(
  paymentIntentId: string,
  userId: string
) {
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (intent.status !== "succeeded")
    throw new Error("Payment not confirmed");

  const existing = await prisma.ticket.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
  });
  if (existing) return existing;

  const { ticketTypeId, eventId, quantity } = intent.metadata as {
    ticketTypeId: string;
    eventId: string;
    quantity: string;
  };
  const qty = parseInt(quantity, 10);

  return prisma.$transaction(async (tx) => {
    const ticketType = await tx.ticketType.findUnique({
      where: { id: ticketTypeId },
    });
    if (!ticketType) throw new Error("Ticket type not found");
    if (ticketType.sold + qty > ticketType.quantity)
      throw new Error("Sold out");

    await tx.ticketType.update({
      where: { id: ticketTypeId },
      data: { sold: { increment: qty } },
    });

    const tickets = await Promise.all(
      Array.from({ length: qty }).map(() =>
        tx.ticket.create({
          data: {
            ticketTypeId,
            eventId,
            userId,
            amountPaid: intent.amount / qty,
            stripePaymentIntentId: paymentIntentId,
            stripeChargeId:
              typeof intent.latest_charge === "string"
                ? intent.latest_charge
                : null,
          },
        })
      )
    );

    return tickets;
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
