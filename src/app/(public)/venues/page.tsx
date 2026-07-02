export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Building2 } from "lucide-react";
import { getAllVenues } from "@/services/venues.service";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Nos salles",
  description:
    "Trois espaces équipés du showcase intime au grand concert — capacités, équipements et conditions professionnelles.",
};

type Pricing = { halfDay?: number; fullDay?: number; weekend?: number };

function priceRow(pricing: Pricing) {
  return [
    { label: "½ journée", value: pricing.halfDay },
    { label: "Journée", value: pricing.fullDay },
    { label: "Week-end", value: pricing.weekend },
  ].filter((p) => typeof p.value === "number");
}

export default async function VenuesPage() {
  const venues = await getAllVenues();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="px-7 pb-10 pt-[150px]">
        <div className="mx-auto max-w-[1320px]">
          <p className="m-0 mb-[18px]">
            <span className="sticker text-[12px]">Le lieu · Trois espaces</span>
          </p>
          <h1 className="display m-0 text-[clamp(64px,15vw,232px)]">
            Nos&nbsp;<span className="text-outline">salles</span>
          </h1>
          <p className="m-0 mt-5 max-w-[54ch] text-[clamp(16px,1.4vw,19px)] leading-[1.55] text-nautilus-cream">
            Du showcase intime au grand concert. Trois espaces équipés, une même
            exigence&nbsp;: des conditions professionnelles pour vos événements.
          </p>
        </div>
      </section>

      {venues.length === 0 ? (
        <p className="py-32 text-center font-mono text-sm text-nautilus-gray">
          Aucune salle disponible pour le moment.
        </p>
      ) : (
        venues.map((venue, i) => {
          const specs = (venue.specs ?? {}) as Record<string, string>;
          const specEntries = Object.entries(specs).slice(0, 4);
          const pricing = priceRow((venue.pricing ?? {}) as Pricing);
          const reversed = i % 2 === 1;

          return (
            <section key={venue.id} className="px-7 py-[34px]">
              <div
                data-reveal
                className="mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-[46px] lg:grid-cols-2"
              >
                {/* Image */}
                <div
                  className={`poster-frame hard-shadow relative overflow-hidden aspect-[4/3] ${
                    reversed ? "lg:order-2 rotate-[1deg]" : "rotate-[-1deg]"
                  }`}
                >
                  {venue.coverImage ? (
                    <Image
                      src={venue.coverImage}
                      alt={venue.name}
                      fill
                      sizes="(max-width:1024px) 100vw, 660px"
                      className="duo object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-nautilus-muted to-nautilus-dark">
                      <Building2 className="h-12 w-12 text-nautilus-gold/40" />
                    </div>
                  )}
                  <span
                    className={`absolute top-4 font-display text-[clamp(48px,7vw,90px)] leading-[0.8] text-nautilus-white/[0.14] ${
                      reversed ? "right-4" : "left-4"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Content */}
                <div className={reversed ? "lg:order-1" : ""}>
                  <h2 className="display m-0 text-[clamp(38px,4.6vw,72px)]">
                    {venue.name}
                  </h2>
                  <p className="m-0 mb-[18px] mt-[6px] font-mono text-[13px] uppercase tracking-[0.1em] text-nautilus-gold">
                    Capacité {venue.capacity.toLocaleString("fr-FR")}
                    {venue._count ? ` · ${venue._count.events} événements` : ""}
                  </p>
                  <p className="m-0 mb-6 max-w-[52ch] text-[16.5px] leading-[1.62] text-nautilus-cream text-pretty">
                    {venue.description}
                  </p>

                  {specEntries.length > 0 && (
                    <div className="mb-[22px] grid grid-cols-2 gap-[2px] overflow-hidden border-2 border-nautilus-ink bg-nautilus-ink">
                      {specEntries.map(([k, v]) => (
                        <div key={k} className="bg-nautilus-black p-4">
                          <p className="m-0 mb-[5px] font-mono text-[10px] uppercase tracking-[0.1em] text-nautilus-gray-dim">
                            {k}
                          </p>
                          <p className="m-0 font-semibold">{v}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {venue.amenities.length > 0 && (
                    <div className="mb-6 flex flex-wrap gap-2">
                      {venue.amenities.map((a) => (
                        <span
                          key={a}
                          className="border-2 border-nautilus-ink px-[12px] py-[6px] font-mono text-[11px] uppercase tracking-[0.05em] text-nautilus-cream"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  )}

                  {pricing.length > 0 && (
                    <div className="mb-6 flex gap-[22px]">
                      {pricing.map((p) => (
                        <div key={p.label}>
                          <p className="m-0 font-mono text-[10px] uppercase tracking-[0.08em] text-nautilus-gray-dim">
                            {p.label}
                          </p>
                          <p className="m-0 mt-[3px] font-display text-[24px] text-nautilus-gold-light">
                            {formatPrice(p.value as number)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <Link
                    href="/devenir-artiste"
                    data-hov
                    className="btn-stamp text-[15px]"
                  >
                    Réserver cette salle →
                  </Link>
                </div>
              </div>
            </section>
          );
        })
      )}

      {/* CTA */}
      <section className="px-7 pb-20 pt-5">
        <div
          data-reveal
          className="poster-frame hard-shadow mx-auto max-w-[1320px] p-[clamp(36px,5vw,64px)] text-center"
        >
          <p className="kicker m-0 mb-[14px]">Un projet d&apos;événement ?</p>
          <h2 className="display m-0 mb-4 text-[clamp(34px,5.5vw,76px)]">
            Parlons-en{" "}
            <span className="accent-serif text-nautilus-gold">ensemble</span>
          </h2>
          <p className="mx-auto mb-7 max-w-[52ch] text-[17px] leading-[1.55] text-nautilus-cream">
            Notre équipe vous accompagne du devis à la régie. Décrivez votre
            projet, on revient vers vous sous 48h.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/devenir-artiste" data-hov className="btn-stamp text-[15px]">
              Demander un devis
            </Link>
            <Link
              href="/projet"
              data-hov
              className="btn-stamp btn-stamp--ghost text-[15px]"
            >
              En savoir plus
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
