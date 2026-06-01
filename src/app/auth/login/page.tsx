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
          <Link href="/" className="font-display text-2xl font-bold text-nautilus-white hover:text-nautilus-gold transition-colors">
            LE NAUTILUS
          </Link>
          <h1 className="font-display text-3xl font-bold text-nautilus-white mt-6 mb-2">
            Connexion
          </h1>
          <p className="text-nautilus-gray text-sm">
            Pas encore de compte ?{" "}
            <Link href="/auth/register" className="text-nautilus-gold hover:underline">
              S'inscrire
            </Link>
          </p>
        </div>
        <LoginForm callbackUrl={callbackUrl} error={error} />
      </div>
    </div>
  );
}
