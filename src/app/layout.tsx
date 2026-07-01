import type { Metadata, Viewport } from "next";
import { Anton, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/shared/providers";
import { Toaster } from "sonner";

// Body — Space Grotesk
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Display — Anton (massive uppercase headlines)
const anton = Anton({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400"],
  display: "swap",
});

// Mono — Space Mono (labels, kickers, metadata)
const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://lenautilus.fr"
  ),
  title: {
    default: "Le Nautilus — Scène musicale & événements",
    template: "%s | Le Nautilus",
  },
  description:
    "Le Nautilus, votre salle de concerts et d'événements. Découvrez notre programmation, réservez vos billets et vivez des expériences inoubliables.",
  keywords: [
    "concert",
    "événements",
    "musique",
    "salle de concert",
    "billetterie",
    "Le Nautilus",
  ],
  authors: [{ name: "Le Nautilus" }],
  creator: "Le Nautilus",
  icons: {
    icon: "/images/logo-nautilus.jpg",
    shortcut: "/images/logo-nautilus.jpg",
    apple: "/images/logo-nautilus.jpg",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://lenautilus.fr",
    siteName: "Le Nautilus",
    title: "Le Nautilus — Scène musicale & événements",
    description:
      "Découvrez nos événements et réservez vos billets pour vivre des expériences inoubliables.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Le Nautilus",
    description: "Scène musicale & événements",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0a09",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${spaceGrotesk.variable} ${anton.variable} ${spaceMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="relative min-h-full flex flex-col bg-nautilus-black text-nautilus-white antialiased">
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#131110",
                border: "1px solid #221f1b",
                color: "#f4efe2",
                fontFamily: "var(--font-body)",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
