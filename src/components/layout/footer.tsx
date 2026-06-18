import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/layout/logo";
import { NewsletterSignup } from "@/components/public/newsletter-signup";

const footerLinks = {
  "Découvrir": [
    { href: "/events", label: "Événements" },
    { href: "/venues", label: "Nos salles" },
    { href: "/projet", label: "Le projet" },
  ],
  "Espace": [
    { href: "/auth/login", label: "Connexion" },
    { href: "/auth/register", label: "S'inscrire" },
    { href: "/artist/dashboard", label: "Espace artiste" },
  ],
  "Légal": [
    { href: "/mentions-legales", label: "Mentions légales" },
  ],
};

export function Footer() {
  return (
    <footer className="relative z-10 bg-nautilus-dark border-t border-nautilus-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-4 text-sm text-nautilus-gray leading-relaxed max-w-xs">
              Scène musicale et espace événementiel. Vivez des expériences inoubliables.
            </p>
            <div className="flex gap-4 mt-6">
              <a
                href="https://www.instagram.com/lenautilusperpignan/?hl=fr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-nautilus-gray hover:text-nautilus-gold transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://www.facebook.com/people/Le-Nautilus/61559046365589/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-nautilus-gray hover:text-nautilus-gold transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <p className="text-xs uppercase tracking-widest text-nautilus-gold font-medium mb-4">
                {category}
              </p>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-nautilus-gray hover:text-nautilus-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-14 rounded-2xl border border-nautilus-border bg-nautilus-card/60 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="font-display text-lg font-semibold text-nautilus-white">
              Restez informé de la programmation
            </p>
            <p className="text-sm text-nautilus-gray mt-1">
              Recevez nos événements et soirées directement dans votre boîte mail.
            </p>
          </div>
          <NewsletterSignup />
        </div>

        <Separator className="my-10 bg-nautilus-border/50" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-nautilus-gray">
            © {new Date().getFullYear()} Le Nautilus. Tous droits réservés.
          </p>
          <p className="text-xs text-nautilus-gray">
            Fait avec soin pour la musique live
          </p>
        </div>
      </div>
    </footer>
  );
}
