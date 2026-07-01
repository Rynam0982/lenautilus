"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Calendar, MapPin, Ticket, Shield, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import type { Event, Venue, TicketType } from "@prisma/client";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);

interface CheckoutClientProps {
  event: Event & { venue: Venue };
  ticketType: TicketType;
  quantity: number;
}

export function CheckoutClient({ event, ticketType, quantity }: CheckoutClientProps) {
  const router = useRouter();
  const isFree = ticketType.price <= 0;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const total = ticketType.price * quantity;

  async function handleInfoSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      if (isFree) {
        const res = await fetch("/api/tickets/free", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticketTypeId: ticketType.id, quantity, email, name }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error ?? "Erreur");
        router.push("/checkout/success?free=1");
        return;
      }

      const res = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketTypeId: ticketType.id, quantity, email, name }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error ?? "Erreur");
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Order summary */}
      <div className="rounded-[18px] border border-nautilus-border bg-nautilus-card p-6">
        <h2 className="mb-5 font-display text-xl uppercase text-nautilus-white">
          Récapitulatif
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-nautilus-gold" />
            <div>
              <p className="font-medium text-nautilus-white">{event.title}</p>
              <p className="text-nautilus-gray">
                {ticketType.name} × {quantity}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 shrink-0 text-nautilus-gold" />
            <p className="text-nautilus-gray">{formatDate(event.startDate)}</p>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 shrink-0 text-nautilus-gold" />
            <p className="text-nautilus-gray">{event.venue.name}</p>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-nautilus-gray">
            Total
          </span>
          <span className="font-display text-[34px] leading-none text-nautilus-gold">
            {isFree ? "Gratuit" : formatPrice(total)}
          </span>
        </div>
      </div>

      {/* Step 1 — buyer info (until a paid intent is created) */}
      {!clientSecret ? (
        <form
          onSubmit={handleInfoSubmit}
          className="space-y-4 rounded-[18px] border border-nautilus-border bg-nautilus-card p-6"
        >
          <h2 className="font-display text-xl uppercase text-nautilus-white">
            Vos informations
          </h2>
          <div>
            <label className="mb-1 block font-mono text-[11px] uppercase tracking-[0.1em] text-nautilus-gray">
              Nom (optionnel)
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom"
              className="w-full rounded-xl border border-nautilus-border-strong bg-transparent px-4 py-3 text-sm text-nautilus-white placeholder:text-nautilus-gray/60 focus:border-nautilus-gold/70 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-[11px] uppercase tracking-[0.1em] text-nautilus-gray">
              E-mail (réception des billets)
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.fr"
              className="w-full rounded-xl border border-nautilus-border-strong bg-transparent px-4 py-3 text-sm text-nautilus-white placeholder:text-nautilus-gray/60 focus:border-nautilus-gold/70 focus:outline-none"
            />
          </div>
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            {isFree ? "Réserver mes places" : "Continuer vers le paiement"}
          </Button>
          <p className="flex items-center justify-center gap-2 text-center text-xs text-nautilus-gray">
            <Mail className="h-3.5 w-3.5 text-nautilus-gold" />
            Vos billets arrivent par e-mail, aucun compte requis.
          </p>
        </form>
      ) : (
        <div className="rounded-[18px] border border-nautilus-border bg-nautilus-card p-6">
          <h2 className="mb-5 font-display text-xl uppercase text-nautilus-white">
            Paiement
          </h2>
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "night",
                variables: {
                  colorPrimary: "#a855f7",
                  colorBackground: "#15121d",
                  colorText: "#f3f0f7",
                  colorDanger: "#f87171",
                  fontFamily: "system-ui, sans-serif",
                  borderRadius: "10px",
                },
              },
            }}
          >
            <PaymentForm
              paymentIntentId={paymentIntentId!}
              email={email}
            />
          </Elements>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 text-xs text-nautilus-gray">
        <Shield className="h-3.5 w-3.5 text-nautilus-gold" />
        Paiement 100% sécurisé par Stripe.
      </div>
    </div>
  );
}

function PaymentForm({
  paymentIntentId,
  email,
}: {
  paymentIntentId: string;
  email: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?intent=${paymentIntentId}`,
        receipt_email: email,
      },
    });

    if (error) {
      toast.error(error.message ?? "Paiement refusé");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement options={{ defaultValues: { billingDetails: { email } } }} />
      <Button
        type="submit"
        size="lg"
        className="mt-2 w-full"
        disabled={!stripe || !elements}
        loading={isProcessing}
      >
        {isProcessing ? "Traitement..." : "Payer et confirmer"}
      </Button>
    </form>
  );
}
