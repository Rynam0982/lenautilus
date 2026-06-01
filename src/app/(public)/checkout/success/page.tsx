import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, Ticket, ArrowRight } from "lucide-react";
import { requireAuth } from "@/lib/auth/guards";
import { confirmTicketPurchase } from "@/services/tickets.service";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Commande confirmée" };

interface PageProps {
  searchParams: Promise<{ intent?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const { intent } = await searchParams;
  const session = await requireAuth();

  let confirmed = false;
  if (intent) {
    try {
      await confirmTicketPurchase(intent, session.user.id);
      confirmed = true;
    } catch {
      confirmed = false;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-nautilus-black">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-900/30 border border-green-700/50">
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
        </div>

        <h1 className="font-display text-3xl font-bold text-nautilus-white mb-3">
          {confirmed ? "Commande confirmée !" : "Paiement reçu"}
        </h1>

        <p className="text-nautilus-gray mb-8">
          {confirmed
            ? "Vos billets sont disponibles dans votre espace personnel. Un email de confirmation a été envoyé."
            : "Votre paiement a bien été reçu. Vos billets seront disponibles dans quelques instants."}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/dashboard/tickets">
              <Ticket className="h-4 w-4" />
              Voir mes billets
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/events">
              Autres événements
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
