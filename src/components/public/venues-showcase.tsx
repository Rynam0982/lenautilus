"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { VenueCard } from "@/components/public/venue-card";
import type { Venue } from "@prisma/client";

interface VenuesShowcaseProps {
  venues: (Venue & { _count?: { events: number } })[];
}

export function VenuesShowcase({ venues }: VenuesShowcaseProps) {
  if (venues.length === 0) return null;

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-nautilus-gold mb-3">
              Lieux
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-nautilus-white">
              Nos salles
            </h2>
          </div>
          <Link
            href="/venues"
            className="hidden md:flex items-center gap-2 text-sm text-nautilus-gray hover:text-nautilus-gold transition-colors"
          >
            Découvrir
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {venues.map((venue, i) => (
            <motion.div
              key={venue.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full sm:w-[420px]"
            >
              <VenueCard venue={venue} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
