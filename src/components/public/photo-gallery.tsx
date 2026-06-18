"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface PhotoGalleryProps {
  photos: string[];
  video?: string;
}

export function PhotoGallery({ photos, video }: PhotoGalleryProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const scrollBy = (dir: 1 | -1) => {
    stripRef.current?.scrollBy({
      left: dir * (stripRef.current.clientWidth * 0.9),
      behavior: "smooth",
    });
  };

  const close = useCallback(() => setLightbox(null), []);
  const go = useCallback(
    (dir: 1 | -1) =>
      setLightbox((i) =>
        i === null ? i : (i + dir + photos.length) % photos.length
      ),
    [photos.length]
  );

  // Keyboard navigation while the lightbox is open.
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, close, go]);

  return (
    <div>
      {video && (
        <video
          src={video}
          controls
          playsInline
          className="w-full rounded-2xl border border-nautilus-border mb-8 bg-black"
        />
      )}

      <div className="relative">
        {/* Scroll buttons */}
        <button
          type="button"
          aria-label="Photos précédentes"
          onClick={() => scrollBy(-1)}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-nautilus-card border border-nautilus-border text-nautilus-white flex items-center justify-center shadow-lg hover:border-nautilus-gold/50 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Photos suivantes"
          onClick={() => scrollBy(1)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-nautilus-card border border-nautilus-border text-nautilus-white flex items-center justify-center shadow-lg hover:border-nautilus-gold/50 transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Thumbnail strip — ~4 visible, scrollable horizontally */}
        <div
          ref={stripRef}
          className="flex gap-3 overflow-x-auto scroll-smooth pb-2 snap-x"
          style={{ scrollbarWidth: "thin" }}
        >
          {photos.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setLightbox(i)}
              className="relative shrink-0 w-[calc(50%-0.375rem)] sm:w-[calc(33.333%-0.5rem)] md:w-[calc(25%-0.5625rem)] aspect-[4/3] rounded-xl overflow-hidden border border-nautilus-border snap-start group"
            >
              <Image
                src={src}
                alt={`Photo ${i + 1} de la saison 2025`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={close}
        >
          <button
            aria-label="Fermer"
            onClick={close}
            className="absolute top-4 right-4 h-11 w-11 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            aria-label="Précédent"
            onClick={(e) => { e.stopPropagation(); go(-1); }}
            className="absolute left-4 h-12 w-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
          <button
            aria-label="Suivant"
            onClick={(e) => { e.stopPropagation(); go(1); }}
            className="absolute right-4 h-12 w-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="h-7 w-7" />
          </button>
          <div
            className="relative w-full h-full max-w-5xl max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[lightbox]!}
              alt={`Photo ${lightbox + 1} de la saison 2025`}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/70">
            {lightbox + 1} / {photos.length}
          </span>
        </div>
      )}
    </div>
  );
}
