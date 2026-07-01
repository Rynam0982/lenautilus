import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, ArrowRight, Mail } from "lucide-react";
import { confirmTicketPurchase } from "@/services/tickets.service";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Commande confirmée" };

interface PageProps {
  searchParams: Promise<{ intent?: string; free?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const { intent, free } = await searchParams;

  // Webhook is the source of truth, but confirm here too so the buyer sees an
  // immediate result even before Stripe calls back. No-ops if already created.
  if (intent) {
    try {
      await confirmTicketPurchase(intent);
    } catch {
      /* webhook will reconcile */
    }
  }

  const isFree = free === "1";

  return (
    <div className="flex min-h-screen items-center justify-center bg-nautilus-black px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-nautilus-gold/40 bg-nautilus-gold/10">
            <CheckCircle className="h-10 w-10 text-nautilus-gold" />
          </div>
        </div>

        <h1 className="font-display text-4xl uppercase text-nautilus-white mb-3">
          {isFree ? "Places réservées !" : "Commande confirmée !"}
        </h1>

        <p className="mb-8 flex items-center justify-center gap-2 text-nautilus-gray">
          <Mail className="h-4 w-4 text-nautilus-gold" />
          Vos billets ont été envoyés par e-mail.
        </p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/events">
              Voir l&apos;agenda
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
