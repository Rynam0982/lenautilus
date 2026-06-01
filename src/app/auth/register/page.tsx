import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Rejoignez Le Nautilus pour acheter des billets et gérer vos événements.",
};

interface PageProps {
  searchParams: Promise<{ role?: string }>;
}

export default async function RegisterPage({ searchParams }: PageProps) {
  const { role } = await searchParams;
  const defaultRole = role === "ARTIST" ? "ARTIST" : "CLIENT";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-nautilus-black">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="font-display text-2xl font-bold text-nautilus-white hover:text-nautilus-gold transition-colors">
            LE NAUTILUS
          </Link>
          <h1 className="font-display text-3xl font-bold text-nautilus-white mt-6 mb-2">
            Créer un compte
          </h1>
          <p className="text-nautilus-gray text-sm">
            Déjà inscrit ?{" "}
            <Link href="/auth/login" className="text-nautilus-gold hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
        <RegisterForm defaultRole={defaultRole} />
      </div>
    </div>
  );
}
