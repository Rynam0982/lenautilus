"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { EventCard } from "@/components/public/event-card";
import type { EventCardData } from "@/types";

interface FeaturedEventsProps {
  events: EventCardData[];
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function FeaturedEvents({ events }: FeaturedEventsProps) {
  if (events.length === 0) return null;

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-nautilus-gold mb-3">
              À venir
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-nautilus-white">
              Prochains événements
            </h2>
          </div>
          <Link
            href="/events"
            className="hidden md:flex items-center gap-2 text-sm text-nautilus-gray hover:text-nautilus-gold transition-colors"
          >
            Tout voir
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {events.map((event, index) => (
            <motion.div key={event.id} variants={item}>
              <EventCard event={event} featured={index === 0} />
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile CTA */}
        <div className="md:hidden mt-8 text-center">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm text-nautilus-gold"
          >
            Voir tous les événements
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
