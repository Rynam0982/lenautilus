import Link from "next/link";
import Image from "next/image";
import { NewsletterSignup } from "@/components/public/newsletter-signup";

const columns = [
  {
    title: "Naviguer",
    links: [
      { href: "/events", label: "Agenda" },
      { href: "/venues", label: "Nos salles" },
      { href: "/projet", label: "Le projet" },
    ],
  },
  {
    title: "Suivre",
    links: [
      {
        href: "https://www.instagram.com/lenautilusperpignan/?hl=fr",
        label: "Instagram",
        external: true,
      },
      {
        href: "https://www.facebook.com/people/Le-Nautilus/61559046365589/",
        label: "Facebook",
        external: true,
      },
      { href: "/devenir-artiste", label: "Devenir artiste" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative z-10 mt-auto border-t-2 border-nautilus-ink px-7 pb-10 pt-14">
      <div className="mx-auto max-w-[1320px]">
        {/* Wordmark géant — typo d'affiche pleine largeur */}
        <p
          aria-hidden
          className="display m-0 mb-12 select-none text-[clamp(44px,9.6vw,150px)] leading-[0.82]"
        >
          Le&nbsp;Nau<span className="text-outline">tilus</span>{" "}
          <span className="accent-serif text-nautilus-gold">à Perpignan</span>
        </p>

        <div className="grid grid-cols-1 gap-10 border-t-2 border-nautilus-ink pb-12 pt-10 md:grid-cols-[2fr_1fr_1fr_1.3fr]">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-[11px]">
              <span className="relative block h-[34px] w-[34px] shrink-0">
                <Image
                  src="/images/logo-nautilus.jpg"
                  alt="Le Nautilus"
                  fill
                  className="logo-dark rounded-full object-cover ring-1 ring-nautilus-border"
                />
                <Image
                  src="/images/logo-nautilus-light.png"
                  alt="Le Nautilus"
                  fill
                  className="logo-light rounded-full object-cover"
                />
              </span>
              <span className="font-display text-[22px] tracking-[0.04em]">
                LE&nbsp;NAUTILUS
              </span>
            </div>
            <p className="max-w-[34ch] text-[14.5px] leading-relaxed text-nautilus-gray">
              Scène de musiques actuelles. Diffusion, création, médiation et
              structuration professionnelle au sein d&apos;un même lieu.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <p className="mb-[14px] font-mono text-[11px] uppercase tracking-[0.12em] text-nautilus-gray-dim">
                {col.title}
              </p>
              <div className="flex flex-col gap-[10px] text-[14.5px] text-nautilus-cream">
                {col.links.map((link) =>
                  "external" in link && link.external ? (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-hov
                      className="transition-colors hover:text-nautilus-gold"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.label}
                      href={link.href}
                      data-hov
                      className="transition-colors hover:text-nautilus-gold"
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </div>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <p className="mb-[14px] font-mono text-[11px] uppercase tracking-[0.12em] text-nautilus-gray-dim">
              Newsletter
            </p>
            <p className="mb-3 text-[13.5px] text-nautilus-gray">
              Le programme dans votre boîte mail.
            </p>
            <NewsletterSignup />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-nautilus-ink pt-[22px] font-mono text-[11.5px] uppercase tracking-[0.06em] text-nautilus-gray">
          <span>© {new Date().getFullYear()} Le Nautilus — Tous droits réservés</span>
          <span className="flex gap-5">
            <Link
              href="/mentions-legales"
              data-hov
              className="transition-colors hover:text-nautilus-gold"
            >
              Mentions légales
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
