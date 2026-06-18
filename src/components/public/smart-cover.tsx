"use client";

import Image from "next/image";
import { useState } from "react";

interface SmartCoverProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  /** Render the red "Annulé" band over the cover (cancelled events). */
  cancelled?: boolean;
}

/**
 * Cover image shown at its **native aspect ratio** — never cropped, never
 * upscaled, so the original quality is preserved.
 *
 * OpenAgenda images vary wildly (wide banners ↔ tall portrait posters). We:
 *  - read the natural ratio on load and size the frame to it (capped at 70vh),
 *  - display the image with `object-contain` so the whole visual is visible,
 *  - fill any side/letterbox gutters with a blurred zoom of the same image
 *    (so portraits look intentional instead of leaving empty bands).
 */
export function SmartCover({
  src,
  alt,
  className = "",
  priority,
  sizes,
  cancelled,
}: SmartCoverProps) {
  const [ratio, setRatio] = useState<number | null>(null);

  return (
    <div
      className={`relative w-full max-h-[70vh] overflow-hidden bg-nautilus-dark ${className}`}
      style={{ aspectRatio: ratio ?? 16 / 9 }}
    >
      {/* Blurred backdrop to fill gutters without cropping the real image */}
      <Image
        src={src}
        alt=""
        aria-hidden
        fill
        className="object-cover blur-2xl scale-110 opacity-40"
        sizes={sizes}
      />
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={`object-contain ${cancelled ? "grayscale-[35%]" : ""}`}
        onLoadingComplete={(img) =>
          setRatio(img.naturalWidth / Math.max(1, img.naturalHeight))
        }
      />
      {cancelled && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="-rotate-6 bg-red-600 text-white font-display text-2xl md:text-4xl font-bold px-8 py-2 shadow-2xl uppercase tracking-widest">
            Annulé
          </span>
        </div>
      )}
    </div>
  );
}
