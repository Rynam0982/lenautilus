import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { CheckoutClient } from "@/components/public/checkout-client";

export const metadata: Metadata = {
  title: "Réservation",
  description: "Finalisez votre réservation de billets.",
};

interface PageProps {
  searchParams: Promise<{ eventId?: string; ticketTypeId?: string; quantity?: string }>;
}

export default async function CheckoutPage({ searchParams }: PageProps) {
  const { eventId, ticketTypeId, quantity } = await searchParams;

  if (!eventId || !ticketTypeId || !quantity) redirect("/events");

  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty < 1 || qty > 10) redirect("/events");

  const [event, ticketType] = await Promise.all([
    prisma.event.findFirst({
      where: { id: eventId, isPublic: true, status: "PUBLISHED" },
      include: { venue: true },
    }),
    prisma.ticketType.findFirst({
      where: { id: ticketTypeId, eventId },
    }),
  ]);

  if (!event || !ticketType) redirect("/events");

  const available = ticketType.quantity - ticketType.sold;
  if (available < qty) redirect(`/events/${event.slug}`);

  return (
    <div className="min-h-screen bg-nautilus-black px-4 pb-24 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <p className="kicker m-0 mb-3">Billetterie</p>
        <h1 className="font-display text-4xl uppercase text-nautilus-white">
          Finaliser
        </h1>
        <p className="mb-10 mt-2 font-mono text-[13px] text-nautilus-gray">
          {ticketType.price > 0
            ? "Vérifiez les détails avant de payer."
            : "Indiquez votre e-mail pour recevoir vos billets."}
        </p>
        <CheckoutClient
          event={event}
          ticketType={ticketType}
          quantity={qty}
        />
      </div>
    </div>
  );
}
