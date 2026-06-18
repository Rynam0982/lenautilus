import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  getPrestation,
  prestations,
  chiffresStats,
  chiffresArtistes,
  galleryPhotos,
  galleryVideo,
} from "@/lib/projet-data";
import { PhotoGallery } from "@/components/public/photo-gallery";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return prestations.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const p = getPrestation(slug);
  if (!p) return { title: "Le projet" };
  return { title: p.title, description: p.intro };
}

export default async function PrestationPage({ params }: PageProps) {
  const { slug } = await params;
  const p = getPrestation(slug);
  if (!p) notFound();

  const isChiffres = p.special === "chiffres";

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link
          href="/projet"
          className="inline-flex items-center gap-2 text-sm text-nautilus-gray hover:text-nautilus-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au projet
        </Link>

        <p className="text-xs uppercase tracking-[0.3em] text-nautilus-gold mb-3">
          {p.subtitle}
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-nautilus-white leading-tight mb-6">
          {p.title}
        </h1>

        {!isChiffres && (
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-nautilus-border mb-10">
            <Image
              src={p.image}
              alt={p.title}
              fill
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
              priority
            />
          </div>
        )}

        <p className="text-lg text-nautilus-gray-light leading-relaxed mb-10">
          {p.intro}
        </p>

        {/* Chiffres clés — stats grids */}
        {isChiffres && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              {chiffresStats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-nautilus-border bg-nautilus-card p-5 text-center"
                >
                  <p className="font-display text-3xl font-bold text-gradient-gold">
                    {s.value}
                  </p>
                  <p className="text-xs text-nautilus-gray mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <h2 className="font-display text-2xl font-bold text-nautilus-white mb-4">
              Les artistes de la saison
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
              {chiffresArtistes.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-nautilus-border bg-nautilus-card p-5 text-center"
                >
                  <p className="font-display text-2xl font-bold text-nautilus-white">
                    {s.value}
                  </p>
                  <p className="text-xs text-nautilus-gray mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Sections */}
        <div className="space-y-8">
          {p.sections.map((section, i) => (
            <section key={i}>
              {section.heading && (
                <h2 className="font-display text-2xl font-bold text-nautilus-white mb-4">
                  {section.heading}
                </h2>
              )}
              {section.body && (
                <p className="text-nautilus-gray-light leading-relaxed">
                  {section.body}
                </p>
              )}
              {section.items && (
                <ul className="space-y-2.5">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-nautilus-gray-light"
                    >
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-nautilus-gold shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* Chiffres clés — galerie photo + vidéo */}
        {isChiffres && (
          <div className="mt-14">
            <h2 className="font-display text-2xl font-bold text-nautilus-white mb-6">
              La saison en images
            </h2>
            <PhotoGallery photos={galleryPhotos} video={galleryVideo} />
          </div>
        )}
      </div>
    </div>
  );
}
