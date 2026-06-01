import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/shared/providers";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
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
  themeColor: "#080808",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${playfair.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-nautilus-black text-nautilus-white antialiased">
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#111111",
                border: "1px solid #1e1e1e",
                color: "#f5f5f0",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
