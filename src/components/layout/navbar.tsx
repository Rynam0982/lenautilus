"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Ticket, User, LogOut, Settings, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/events", label: "Événements" },
  { href: "/venues", label: "Salles" },
];

export function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const user = session?.user;
  const role = user?.role;

  const dashboardHref =
    role === "ADMIN" ? "/admin" : role === "ARTIST" ? "/artist" : "/dashboard";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-nautilus-black/95 backdrop-blur-md border-b border-nautilus-border"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="font-display text-xl font-bold tracking-wider text-nautilus-white hover:text-nautilus-gold transition-colors"
          >
            LE NAUTILUS
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-nautilus-gray hover:text-nautilus-white transition-colors tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full p-0.5 hover:ring-2 hover:ring-nautilus-gold/50 transition-all">
                    <UserAvatar
                      name={user.name}
                      image={user.image}
                      className="h-8 w-8"
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="mt-2 w-52 rounded-xl border border-nautilus-border bg-nautilus-card p-1 shadow-xl z-50"
                >
                  <div className="px-3 py-2 mb-1">
                    <p className="text-sm font-medium text-nautilus-white truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-nautilus-gray truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator className="h-px bg-nautilus-border my-1" />
                  <DropdownMenuItem asChild>
                    <Link
                      href={dashboardHref}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-nautilus-gray-light hover:text-nautilus-white hover:bg-nautilus-muted rounded-lg cursor-pointer transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {role !== "ADMIN" && (
                    <DropdownMenuItem asChild>
                      <Link
                        href="/dashboard/tickets"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-nautilus-gray-light hover:text-nautilus-white hover:bg-nautilus-muted rounded-lg cursor-pointer transition-colors"
                      >
                        <Ticket className="h-4 w-4" />
                        Mes billets
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="h-px bg-nautilus-border my-1" />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg cursor-pointer transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/login">Connexion</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/register">S'inscrire</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-nautilus-gray hover:text-nautilus-white transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-nautilus-border bg-nautilus-black/98 backdrop-blur-md"
          >
            <div className="px-4 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-base text-nautilus-gray hover:text-nautilus-white transition-colors py-2"
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-nautilus-border" />
              {user ? (
                <>
                  <div className="flex items-center gap-3 py-2">
                    <UserAvatar name={user.name} image={user.image} className="h-9 w-9" />
                    <div>
                      <p className="text-sm font-medium text-nautilus-white">{user.name}</p>
                      <p className="text-xs text-nautilus-gray">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href={dashboardHref}
                    onClick={() => setOpen(false)}
                    className="text-sm text-nautilus-gray-light py-2"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
                    className="text-sm text-red-400 text-left py-2"
                  >
                    Se déconnecter
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3 pt-2">
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/auth/login" onClick={() => setOpen(false)}>Connexion</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/auth/register" onClick={() => setOpen(false)}>S'inscrire</Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
