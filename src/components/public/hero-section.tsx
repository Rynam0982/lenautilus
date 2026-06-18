"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient — transparent so the page backdrop/ribbons flow
          through the hero and into the next section without a hard edge */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 80% 60% at 50% -20%, rgba(201,168,76,0.15) 0%, transparent 60%),
              radial-gradient(ellipse 60% 40% at 80% 80%, rgba(201,168,76,0.05) 0%, transparent 50%)
            `,
          }}
        />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(201,168,76,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(201,168,76,0.5) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-xs uppercase tracking-[0.4em] text-nautilus-gold mb-8 font-medium">
            Scène musicale & événements
          </p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight mb-8"
        >
          <span className="text-nautilus-white">Le</span>
          <br />
          <span className="text-gradient-gold">Nautilus</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-nautilus-gray text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Trois scènes. Une programmation unique. Des expériences musicales et
          culturelles au cœur de la ville.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/events"
            className="inline-flex items-center justify-center h-14 px-10 text-base rounded-md bg-nautilus-gold text-nautilus-black hover:bg-nautilus-gold-light font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-nautilus-gold/20"
          >
            Découvrir les événements
          </Link>
          <Link
            href="/venues"
            className="inline-flex items-center justify-center h-14 px-10 text-base rounded-md border border-nautilus-border text-nautilus-white hover:border-nautilus-gold hover:text-nautilus-gold font-medium transition-all duration-200"
          >
            Nos salles
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-6 w-6 text-nautilus-gold/50" />
        </motion.div>
      </motion.div>
    </section>
  );
}
