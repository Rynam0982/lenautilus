"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Calendar, MapPin, Ticket, Shield } from "lucide-react";
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
  userId: string;
  userEmail: string;
}

export function CheckoutClient(props: CheckoutClientProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(true);

  useEffect(() => {
    const create = async () => {
      try {
        const res = await fetch("/api/payments/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticketTypeId: props.ticketType.id,
            quantity: props.quantity,
          }),
        });
        if (!res.ok) throw new Error("Impossible de créer la session de paiement");
        const data = (await res.json()) as {
          clientSecret: string;
          paymentIntentId: string;
        };
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur");
      } finally {
        setIsCreating(false);
      }
    };
    create();
  }, [props.ticketType.id, props.quantity]);

  if (isCreating) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-48 rounded-2xl" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="rounded-2xl border border-red-800/50 bg-red-900/10 p-8 text-center">
        <p className="text-red-400">Impossible de charger le paiement. Réessayez plus tard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order summary */}
      <div className="rounded-2xl border border-nautilus-border bg-nautilus-card p-6">
        <h2 className="font-display text-lg font-semibold text-nautilus-white mb-5">
          Récapitulatif
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <Ticket className="h-4 w-4 text-nautilus-gold shrink-0 mt-0.5" />
            <div>
              <p className="text-nautilus-white font-medium">{props.event.title}</p>
              <p className="text-nautilus-gray">
                {props.ticketType.name} × {props.quantity}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-nautilus-gold shrink-0" />
            <p className="text-nautilus-gray">{formatDate(props.event.startDate)}</p>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-nautilus-gold shrink-0" />
            <p className="text-nautilus-gray">{props.event.venue.name}</p>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="flex items-center justify-between">
          <span className="text-sm text-nautilus-gray">Total</span>
          <span className="font-display text-2xl font-semibold text-nautilus-white">
            {formatPrice(props.ticketType.price * props.quantity)}
          </span>
        </div>
      </div>

      {/* Stripe payment form */}
      <div className="rounded-2xl border border-nautilus-border bg-nautilus-card p-6">
        <h2 className="font-display text-lg font-semibold text-nautilus-white mb-5">
          Paiement
        </h2>
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: "night",
              variables: {
                colorPrimary: "#c9a84c",
                colorBackground: "#111111",
                colorText: "#f5f5f0",
                colorDanger: "#f87171",
                fontFamily: "system-ui, sans-serif",
                borderRadius: "8px",
              },
            },
          }}
        >
          <PaymentForm
            paymentIntentId={paymentIntentId!}
            eventSlug={props.event.slug}
          />
        </Elements>
      </div>

      {/* Security note */}
      <div className="flex items-center gap-2 text-xs text-nautilus-gray justify-center">
        <Shield className="h-3.5 w-3.5 text-nautilus-gold" />
        Paiement 100% sécurisé par Stripe. Vos données sont protégées.
      </div>
    </div>
  );
}

function PaymentForm({
  paymentIntentId,
  eventSlug,
}: {
  paymentIntentId: string;
  eventSlug: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?intent=${paymentIntentId}`,
      },
    });

    if (error) {
      toast.error(error.message ?? "Paiement refusé");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button
        type="submit"
        size="lg"
        className="w-full mt-2"
        disabled={!stripe || !elements}
        loading={isProcessing}
      >
        {isProcessing ? "Traitement..." : "Payer et confirmer"}
      </Button>
    </form>
  );
}
