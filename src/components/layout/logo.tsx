import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** Optional label shown under or beside the wordmark (e.g. "Administration"). */
  subtitle?: string;
  /** Tailwind size for the logo mark. */
  size?: "sm" | "md";
  className?: string;
  href?: string;
}

/**
 * Brand logo: the real Nautilus sticker mark + wordmark.
 * Used in the public navbar/footer and the admin sidebar.
 */
export function Logo({ subtitle, size = "md", className, href = "/" }: LogoProps) {
  const dim = size === "sm" ? 32 : 40;

  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      {/* Purple sticker in dark theme, yellow logo in light theme */}
      <Image
        src="/images/logo-nautilus.jpg"
        alt="Le Nautilus"
        width={dim}
        height={dim}
        priority
        className="logo-dark rounded-full ring-1 ring-nautilus-border shadow-sm shrink-0"
      />
      <Image
        src="/images/logo-nautilus-light.png"
        alt="Le Nautilus"
        width={dim}
        height={dim}
        priority
        className="logo-light rounded-full shadow-sm shrink-0"
      />
      <span className="flex flex-col leading-none">
        <span className="font-display font-bold tracking-wider text-nautilus-white group-hover:text-nautilus-gold transition-colors text-lg">
          LE NAUTILUS
        </span>
        {subtitle && (
          <span className="text-[10px] text-nautilus-gold uppercase tracking-widest mt-0.5">
            {subtitle}
          </span>
        )}
      </span>
    </Link>
  );
}
