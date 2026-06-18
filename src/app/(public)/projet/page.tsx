import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prestations, chiffresStats } from "@/lib/projet-data";

export const metadata: Metadata = {
  title: "Le projet",
  description:
    "Le Nautilus, lieu culturel à Perpignan : accompagnement des artistes locaux, des organisateurs d'événements, sensibilisation aux métiers de la musique et diffusion des musiques actuelles.",
};

export default function ProjetPage() {
  const chiffres = prestations.find((p) => p.special === "chiffres")!;
  const others = prestations.filter((p) => p.special !== "chiffres");
  const heroStats = chiffresStats.slice(0, 3);

  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-nautilus-gold mb-4">
          Le projet
        </p>
        <h1 className="font-display text-4xl md:text-6xl font-bold text-nautilus-white leading-tight">
          Un lieu culturel au service du territoire
        </h1>
        <p className="mt-6 text-base md:text-lg text-nautilus-gray-light max-w-3xl mx-auto leading-relaxed">
          Le Nautilus est un lieu culturel composé de trois espaces
          complémentaires, pour une capacité totale de 180 personnes. Les espaces
          sont principalement mis à disposition d’organisateurs locaux, dans une
          logique de soutien à la création et à la diffusion artistique. Le
          Nautilus peut également s’engager dans des démarches de coproduction afin
          d’accompagner des projets innovants et structurants pour le territoire.
        </p>
      </section>

      {/* Chiffres clés */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-3xl border border-nautilus-border bg-nautilus-card p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8">
            <Image
              src={chiffres.image}
              alt=""
              width={64}
              height={64}
              className="rounded-xl"
            />
            <div>
              <h2 className="font-display text-2xl font-bold text-nautilus-white">
                {chiffres.title}
              </h2>
              <p className="text-sm text-nautilus-gray mt-1 max-w-2xl">
                {chiffres.intro}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {heroStats.map((s) => (
              <div key={s.label} className="text-center sm:text-left">
                <p className="font-display text-4xl md:text-5xl font-bold text-gradient-gold">
                  {s.value}
                </p>
                <p className="text-sm text-nautilus-gray mt-2">{s.label}</p>
              </div>
            ))}
          </div>
          <Link
            href={`/projet/${chiffres.slug}`}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-nautilus-gold px-6 py-2.5 text-sm font-semibold text-nautilus-black hover:bg-nautilus-gold-light transition-colors"
          >
            En savoir plus
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Prestations */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-nautilus-white text-center mb-3">
          Nos prestations
        </h2>
        <p className="text-center text-nautilus-gray mb-14 max-w-2xl mx-auto">
          Le Nautilus accompagne les artistes, les organisateurs et le public
          autour des musiques actuelles.
        </p>

        <div className="space-y-10">
          {others.map((p, i) => (
            <article
              key={p.slug}
              className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center rounded-3xl border border-nautilus-border bg-nautilus-card overflow-hidden ${
                i % 2 === 1 ? "md:[direction:rtl]" : ""
              }`}
            >
              <div className="relative aspect-[4/3] md:aspect-auto md:h-full min-h-[260px] [direction:ltr]">
                <Image
                  src={p.image}
                  alt={p.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="p-8 md:p-10 [direction:ltr]">
                <p className="text-xs uppercase tracking-widest text-nautilus-gold mb-2">
                  {p.subtitle}
                </p>
                <h3 className="font-display text-2xl font-bold text-nautilus-white mb-4">
                  {p.title}
                </h3>
                <p className="text-sm text-nautilus-gray-light leading-relaxed mb-6">
                  {p.intro}
                </p>
                <Link
                  href={`/projet/${p.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-nautilus-gold hover:gap-3 transition-all"
                >
                  En savoir plus
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Contact / CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-3xl border border-nautilus-border bg-gradient-to-br from-nautilus-card to-nautilus-dark p-8 md:p-12 text-center">
          <h2 className="font-display text-3xl font-bold text-nautilus-white">
            Un projet à accompagner ?
          </h2>
          <p className="text-nautilus-gray mt-3 max-w-xl mx-auto">
            Le Nautilus — 20 rue Jules Verne, 66000 Perpignan ·
            bonjour@le-nautilus.org · 06 26 52 10 15
          </p>
          <Link
            href="/events"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-nautilus-gold px-7 py-3 text-sm font-semibold text-nautilus-black hover:bg-nautilus-gold-light transition-colors"
          >
            Découvrir notre agenda
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
