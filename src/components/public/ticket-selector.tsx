"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import type { EventWithDetails } from "@/types";
import type { TicketType } from "@prisma/client";

interface TicketSelectorProps {
  event: EventWithDetails;
  ticketTypes: TicketType[];
  isSoldOut: boolean;
}

export function TicketSelector({
  event,
  ticketTypes,
  isSoldOut,
}: TicketSelectorProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(
    ticketTypes[0]?.id ?? null
  );
  const [quantity, setQuantity] = useState(1);

  const selectedType = ticketTypes.find((tt) => tt.id === selected);
  const available = selectedType
    ? selectedType.quantity - selectedType.sold
    : 0;
  const maxQty = Math.min(10, available);

  const total = selectedType ? selectedType.price * quantity : 0;
  const isFree = selectedType ? selectedType.price <= 0 : false;

  const handleCheckout = () => {
    const params = new URLSearchParams({
      eventId: event.id,
      ticketTypeId: selected!,
      quantity: String(quantity),
    });
    router.push(`/checkout?${params}`);
  };

  const isPast = new Date(event.endDate) < new Date();

  return (
    <div className="rounded-[18px] border border-nautilus-muted bg-nautilus-card p-6">
      <div className="mb-1 flex items-baseline justify-between">
        <h3 className="font-display text-2xl uppercase text-nautilus-white">
          Billetterie
        </h3>
        {!isPast && !isSoldOut && (
          <span className="font-mono text-[11px] text-[#7fe3a9]">● En vente</span>
        )}
      </div>
      <p className="mb-5 font-mono text-[11.5px] text-nautilus-gray">
        Sélectionnez vos places
      </p>

      {isPast ? (
        <div className="text-center py-6">
          <p className="text-nautilus-gray text-sm">Cet événement est terminé.</p>
        </div>
      ) : isSoldOut ? (
        <div className="text-center py-6">
          <Badge variant="danger" className="mb-2">Complet</Badge>
          <p className="text-nautilus-gray text-sm">Plus de billets disponibles.</p>
        </div>
      ) : (
        <>
          {/* Ticket type selection */}
          <div className="space-y-3 mb-6">
            {ticketTypes.map((tt) => {
              const avail = tt.quantity - tt.sold;
              const soldOut = avail <= 0;
              return (
                <label
                  key={tt.id}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    soldOut
                      ? "border-nautilus-border opacity-50 cursor-not-allowed"
                      : selected === tt.id
                      ? "border-nautilus-gold bg-nautilus-gold/5"
                      : "border-nautilus-border hover:border-nautilus-gold/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="ticketType"
                      value={tt.id}
                      checked={selected === tt.id}
                      onChange={() => {
                        if (!soldOut) {
                          setSelected(tt.id);
                          setQuantity(1);
                        }
                      }}
                      disabled={soldOut}
                      className="accent-nautilus-gold"
                    />
                    <div>
                      <p className="text-sm font-medium text-nautilus-white">{tt.name}</p>
                      {tt.description && (
                        <p className="text-xs text-nautilus-gray mt-0.5">{tt.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-nautilus-gold">
                      {tt.price === 0 ? "Gratuit" : formatPrice(tt.price)}
                    </p>
                    {avail <= 10 && avail > 0 && (
                      <p className="text-xs text-amber-400 mt-0.5">
                        {avail} restant{avail > 1 ? "s" : ""}
                      </p>
                    )}
                    {soldOut && (
                      <p className="text-xs text-red-400 mt-0.5">Complet</p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>

          {/* Quantity */}
          {selected && (
            <div className="flex items-center justify-between mb-6 py-4 border-t border-nautilus-border">
              <span className="text-sm text-nautilus-gray">Quantité</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-nautilus-border text-nautilus-gray hover:border-nautilus-gold hover:text-nautilus-white transition-colors disabled:opacity-30"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-6 text-center text-sm font-medium text-nautilus-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                  disabled={quantity >= maxQty}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-nautilus-border text-nautilus-gray hover:border-nautilus-gold hover:text-nautilus-white transition-colors disabled:opacity-30"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Total & CTA */}
          {selectedType && (
            <div className="space-y-4">
              <div className="flex items-baseline justify-between border-t border-nautilus-muted pt-4">
                <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-nautilus-gray">
                  Total
                </span>
                <span className="font-display text-[34px] leading-none text-nautilus-gold">
                  {total === 0 ? "Gratuit" : formatPrice(total)}
                </span>
              </div>
              <Button
                size="lg"
                onClick={handleCheckout}
                className="w-full"
              >
                <Ticket className="h-4 w-4" />
                {isFree ? "Réserver gratuitement" : "Réserver"}
              </Button>
              <p className="text-xs text-nautilus-gray text-center">
                {isFree
                  ? "Billet envoyé par email • Aucun compte requis"
                  : "Paiement sécurisé • Billet envoyé par email"}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
