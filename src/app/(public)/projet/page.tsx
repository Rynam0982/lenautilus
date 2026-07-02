import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  prestations,
  chiffresStats,
  chiffresArtistes,
  galleryPhotos,
} from "@/lib/projet-data";
import { CountUp } from "@/components/public/count-up";

export const metadata: Metadata = {
  title: "Le projet",
  description:
    "Le Nautilus, lieu culturel à Perpignan : accompagnement des artistes locaux, des organisateurs d'événements, sensibilisation aux métiers de la musique et diffusion des musiques actuelles.",
};

const toNumber = (v: string) => parseInt(v.replace(/[^\d]/g, ""), 10) || 0;

export default function ProjetPage() {
  const missions = prestations.filter((p) => p.special !== "chiffres");
  const galleryA = galleryPhotos.slice(0, 8);
  const galleryB = galleryPhotos.slice(8, 16);

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <section className="px-7 pb-[30px] pt-[150px]">
        <div className="mx-auto max-w-[1320px]">
          <p className="m-0 mb-[18px]">
            <span className="sticker text-[12px]">Le projet · Saison 2025</span>
          </p>
          <h1 className="display m-0 text-[clamp(52px,11vw,180px)]">
            Une <span className="text-outline">saison</span>
            <br />
            <span className="accent-serif text-nautilus-gold">fondatrice</span>
          </h1>
          <p className="m-0 mt-6 max-w-[60ch] text-[clamp(16px,1.5vw,21px)] leading-[1.55] text-nautilus-cream text-pretty">
            2025 marque la première saison d&apos;activité complète du Nautilus&nbsp;:
            une année structurante qui confirme la pertinence du projet et son
            ancrage territorial. Diffusion, création, médiation et structuration
            professionnelle s&apos;articulent au sein d&apos;un même lieu.
          </p>
        </div>
      </section>

      {/* BIG NUMBER */}
      <section className="px-7 pb-5 pt-[30px]">
        <div
          data-reveal
          className="poster-frame hard-shadow mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-[30px] rotate-[-0.4deg] p-[clamp(34px,5vw,60px)]"
        >
          <div>
            <p className="m-0 mb-[10px] font-mono text-[12px] uppercase tracking-[0.18em] text-nautilus-gold-light">
              Recettes de billetterie reversées au territoire
            </p>
            <p className="m-0 font-display text-[clamp(58px,9vw,140px)] leading-[0.82] text-nautilus-gold">
              <CountUp value={60386} suffix=" €" />
            </p>
          </div>
          <p className="m-0 max-w-[38ch] text-[16px] leading-[1.6] text-nautilus-cream">
            Une dynamique forte où diffusion, création, médiation et structuration
            professionnelle se rencontrent — et bénéficient directement aux acteurs
            locaux.
          </p>
        </div>
      </section>

      {/* STATS GRID */}
      <section className="px-7 py-10">
        <div className="mx-auto max-w-[1320px]">
          <div data-reveal className="mb-7 flex items-baseline gap-[14px]">
            <span className="sticker text-[12px]">01</span>
            <h2 className="display m-0 text-[clamp(32px,4.6vw,64px)]">
              Chiffres <span className="accent-serif text-nautilus-gold">clés</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-[2px] overflow-hidden border-2 border-nautilus-ink bg-nautilus-ink md:grid-cols-4">
            {chiffresStats.map((s) => (
              <div key={s.label} className="bg-nautilus-black p-[26px_22px]">
                <p className="m-0 font-display text-[clamp(38px,4vw,58px)] leading-[0.85] text-nautilus-white">
                  <CountUp value={toNumber(s.value)} />
                </p>
                <p className="m-0 mt-3 font-mono text-[11.5px] leading-[1.45] tracking-[0.04em] text-nautilus-gray">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ARTISTES */}
      <section className="px-7 pb-[50px] pt-5">
        <div className="mx-auto max-w-[1320px]">
          <div data-reveal className="mb-7 flex items-baseline gap-[14px]">
            <span className="sticker rotate-[2deg] text-[12px]">02</span>
            <h2 className="display m-0 text-[clamp(32px,4.6vw,64px)]">
              Les artistes{" "}
              <span className="accent-serif text-nautilus-gold">accueillis</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
            {chiffresArtistes.map((a) => (
              <div
                key={a.label}
                data-reveal
                className="poster-frame p-[26px]"
              >
                <p className="m-0 font-display text-[clamp(40px,4.4vw,62px)] leading-[0.85] text-nautilus-gold">
                  <CountUp value={toNumber(a.value)} />
                </p>
                <p className="m-0 mt-3 font-mono text-[12px] tracking-[0.04em] text-nautilus-gray">
                  {a.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MISSIONS */}
      <section className="px-7 pb-[50px] pt-[30px]">
        <div className="mx-auto max-w-[1320px]">
          <div data-reveal className="mb-[30px] flex items-baseline gap-[14px]">
            <span className="sticker rotate-[-2deg] text-[12px]">03</span>
            <h2 className="display m-0 text-[clamp(32px,4.6vw,64px)]">
              Nos <span className="accent-serif text-nautilus-gold">missions</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2">
            {missions.map((m) => {
              const items = m.sections.find((s) => s.items)?.items ?? [];
              return (
                <article
                  key={m.slug}
                  data-reveal
                  className="group poster-frame flex flex-col overflow-hidden transition-transform duration-200 hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[6px_6px_0_var(--shadow-hard)]"
                >
                  <div className="relative aspect-[16/8] overflow-hidden">
                    <Image
                      src={m.image}
                      alt={m.title}
                      fill
                      sizes="(max-width:768px) 100vw, 640px"
                      className="duo object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent to-70%" />
                  </div>
                  <div className="p-[24px_26px_28px]">
                    <p className="m-0 mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-nautilus-gold-light">
                      {m.subtitle}
                    </p>
                    <h3 className="display m-0 mb-3 text-[clamp(24px,2.4vw,36px)]">
                      {m.title}
                    </h3>
                    <p className="m-0 mb-4 text-[15px] leading-[1.6] text-nautilus-cream">
                      {m.intro}
                    </p>
                    {items.length > 0 && (
                      <div className="flex flex-col gap-[9px]">
                        {items.slice(0, 5).map((it) => (
                          <div
                            key={it}
                            className="flex items-start gap-[10px] text-[14px] text-nautilus-cream"
                          >
                            <span className="mt-[1px] flex-none text-nautilus-gold">→</span>
                            <span>{it}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <Link
                      href={`/projet/${m.slug}`}
                      data-hov
                      className="mt-5 inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.1em] text-nautilus-gold"
                    >
                      En savoir plus ↗
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="py-10">
        <div className="mx-auto mb-[26px] max-w-[1320px] px-7">
          <div data-reveal className="flex items-baseline gap-[14px]">
            <span className="sticker rotate-[1deg] text-[12px]">04</span>
            <h2 className="display m-0 text-[clamp(32px,4.6vw,64px)]">
              En <span className="accent-serif text-nautilus-gold">images</span>
            </h2>
          </div>
        </div>
        <GalleryRow photos={galleryA} reverse={false} />
        <GalleryRow photos={galleryB} reverse />
      </section>

      {/* CTA */}
      <section className="px-7 pb-20 pt-5">
        <div
          data-reveal
          className="poster-frame hard-shadow mx-auto max-w-[1320px] p-[clamp(36px,5vw,64px)] text-center"
        >
          <p className="kicker m-0 mb-[14px]">Un projet à accompagner ?</p>
          <h2 className="display m-0 mb-4 text-[clamp(34px,5.5vw,76px)]">
            Parlons-en{" "}
            <span className="accent-serif text-nautilus-gold">ensemble</span>
          </h2>
          <p className="mx-auto mb-7 max-w-[54ch] text-[16px] leading-[1.6] text-nautilus-cream">
            Le Nautilus — 20 rue Jules Verne, 66000 Perpignan ·
            bonjour@le-nautilus.org · 06 26 52 10 15
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/events" data-hov className="btn-stamp text-[15px]">
              Découvrir l&apos;agenda
            </Link>
            <Link
              href="/venues"
              data-hov
              className="btn-stamp btn-stamp--ghost text-[15px]"
            >
              Nos salles
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function GalleryRow({
  photos,
  reverse,
}: {
  photos: string[];
  reverse: boolean;
}) {
  const run = [...photos, ...photos];
  return (
    <div className="overflow-hidden py-[6px]">
      <div
        className={`inline-flex gap-[14px] pl-[14px] ${
          reverse ? "animate-marquee-rev" : "animate-marquee"
        }`}
      >
        {run.map((src, i) => (
          <div
            key={i}
            className="relative h-[230px] w-[340px] flex-none overflow-hidden border-2 border-nautilus-ink"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              aria-hidden
              className="duo h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
