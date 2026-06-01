import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

const errorMessages: Record<string, string> = {
  Configuration: "Problème de configuration du serveur.",
  AccessDenied: "Accès refusé.",
  Verification: "Le lien de vérification est invalide ou expiré.",
  Default: "Une erreur d'authentification est survenue.",
};

export default async function AuthErrorPage({ searchParams }: PageProps) {
  const { error } = await searchParams;
  const message = errorMessages[error ?? "Default"] ?? errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-nautilus-black">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-900/30 border border-red-800/50">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
        </div>
        <h1 className="font-display text-2xl font-bold text-nautilus-white mb-3">
          Erreur d'authentification
        </h1>
        <p className="text-nautilus-gray mb-8">{message}</p>
        <Button asChild>
          <Link href="/auth/login">Retour à la connexion</Link>
        </Button>
      </div>
    </div>
  );
}
