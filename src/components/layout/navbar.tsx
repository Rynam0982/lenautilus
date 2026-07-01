"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDashboardRoute } from "@/lib/auth/route";
import { ThemeToggle } from "@/components/layout/theme-toggle";

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-[11px]" data-hov>
      <span className="relative block h-[34px] w-[34px] shrink-0">
        <Image
          src="/images/logo-nautilus.jpg"
          alt="Le Nautilus"
          fill
          priority
          className="logo-dark rounded-full object-cover ring-1 ring-nautilus-border"
        />
        <Image
          src="/images/logo-nautilus-light.png"
          alt="Le Nautilus"
          fill
          priority
          className="logo-light rounded-full object-cover"
        />
      </span>
      <span className="font-display text-[21px] leading-none tracking-[0.04em]">
        LE&nbsp;NAUTILUS
      </span>
    </Link>
  );
}

const navLinks = [
  { href: "/events", label: "Agenda" },
  { href: "/venues", label: "Salles" },
  { href: "/projet", label: "Le projet" },
];

const marqueeItems = [
  "Saison 2025 — 26",
  "Musiques actuelles",
  "Concerts · Résidences · Ateliers",
  "Billetterie ouverte",
];

function MarqueeRow() {
  const run = [...marqueeItems, ...marqueeItems];
  return (
    <div className="overflow-hidden border-y border-nautilus-border bg-nautilus-black/60">
      <div className="animate-marquee font-mono text-[12px] uppercase tracking-[0.18em] text-nautilus-gray py-2">
        {run.map((item, i) => (
          <span key={i} className="inline-flex items-center">
            <span className="px-[22px]">{item}</span>
            <span className="px-[22px] text-nautilus-gold">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const user = session?.user;
  const dashboardHref = getDashboardRoute(user?.role);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-nautilus-black/85 backdrop-blur-md border-b border-nautilus-border"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="flex items-center justify-between gap-6 px-5 sm:px-7 py-4">
        {/* Logo */}
        <Brand />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-[30px] font-mono text-[12px] uppercase tracking-[0.12em]">
          <ThemeToggle />
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              data-hov
              className="opacity-80 hover:opacity-100 hover:text-nautilus-gold transition"
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <div className="flex items-center gap-[22px]">
              <Link
                href={dashboardHref}
                data-hov
                className="opacity-80 hover:opacity-100 hover:text-nautilus-gold transition"
              >
                Espace
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                data-hov
                className="opacity-60 hover:opacity-100 hover:text-nautilus-gold transition uppercase"
              >
                Quitter
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              data-hov
              className="opacity-80 hover:opacity-100 hover:text-nautilus-gold transition"
            >
              Connexion
            </Link>
          )}

          <Link
            href="/events"
            data-hov
            className="inline-flex items-center gap-2 rounded-full bg-nautilus-gold px-[18px] py-[9px] font-bold text-nautilus-black hover:bg-nautilus-gold-light transition-colors"
          >
            Billetterie ↗
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-nautilus-cream hover:text-nautilus-gold transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <MarqueeRow />

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden border-b border-nautilus-border bg-nautilus-black/98 backdrop-blur-md"
          >
            <div className="flex flex-col gap-1 px-6 py-6 font-mono text-sm uppercase tracking-[0.12em]">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="py-3 text-nautilus-cream hover:text-nautilus-gold transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex items-center justify-between py-3">
                <span className="text-nautilus-cream">Thème</span>
                <ThemeToggle />
              </div>
              <div className="my-2 h-px bg-nautilus-border" />
              {user ? (
                <>
                  <Link
                    href={dashboardHref}
                    onClick={() => setOpen(false)}
                    className="py-3 text-nautilus-cream hover:text-nautilus-gold transition-colors"
                  >
                    Mon espace
                  </Link>
                  <button
                    onClick={() => {
                      setOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="py-3 text-left text-nautilus-gray hover:text-nautilus-gold transition-colors uppercase"
                  >
                    Se déconnecter
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setOpen(false)}
                  className="py-3 text-nautilus-cream hover:text-nautilus-gold transition-colors"
                >
                  Connexion
                </Link>
              )}
              <Link
                href="/events"
                onClick={() => setOpen(false)}
                className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-nautilus-gold px-5 py-3 font-bold text-nautilus-black"
              >
                Billetterie ↗
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
