import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre compte Le Nautilus.",
};

interface PageProps {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { callbackUrl, error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-nautilus-black">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-[11px] transition-opacity hover:opacity-90">
            <span className="block h-[11px] w-[11px] rounded-full bg-nautilus-gold shadow-[0_0_14px_rgba(201,168,76,0.7)]" />
            <span className="font-display text-2xl tracking-[0.04em]">LE NAUTILUS</span>
          </Link>
          <h1 className="font-display text-4xl uppercase text-nautilus-white mt-7 mb-2">
            Connexion
          </h1>
          <p className="text-nautilus-gray text-sm font-mono">
            Espace professionnel — accès réservé.
          </p>
          <p className="text-nautilus-gray text-sm font-mono mt-1">
            Artiste ?{" "}
            <Link href="/devenir-artiste" className="text-nautilus-gold hover:underline">
              Demander un compte
            </Link>
          </p>
        </div>
        <LoginForm callbackUrl={callbackUrl} error={error} />
      </div>
    </div>
  );
}
