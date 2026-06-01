import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/client";
import { CheckoutClient } from "@/components/public/checkout-client";

export const metadata: Metadata = {
  title: "Paiement",
  description: "Finalisez votre achat de billets.",
};

interface PageProps {
  searchParams: Promise<{ eventId?: string; ticketTypeId?: string; quantity?: string }>;
}

export default async function CheckoutPage({ searchParams }: PageProps) {
  const session = await requireAuth();
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
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6 lg:px-8 bg-nautilus-black">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-nautilus-white mb-2">
          Finaliser la commande
        </h1>
        <p className="text-nautilus-gray mb-10">
          Vérifiez les détails avant de payer.
        </p>
        <CheckoutClient
          event={event as typeof event & { venue: { name: string } }}
          ticketType={ticketType}
          quantity={qty}
          userId={session.user.id}
          userEmail={session.user.email ?? ""}
        />
      </div>
    </div>
  );
}
