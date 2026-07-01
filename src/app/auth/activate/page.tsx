import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db/client";
import { ActivateForm } from "@/components/auth/activate-form";

export const metadata: Metadata = { title: "Activer mon compte" };

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ActivatePage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  let valid = false;
  if (token) {
    const record = await prisma.passwordToken.findUnique({ where: { token } });
    valid = !!record && !record.usedAt && record.expires > new Date();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-nautilus-black px-4">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <Link href="/" className="inline-flex items-center gap-[11px]">
            <span className="block h-[11px] w-[11px] rounded-full bg-nautilus-gold shadow-[0_0_14px_rgba(168,85,247,0.7)]" />
            <span className="font-display text-2xl tracking-[0.04em]">LE NAUTILUS</span>
          </Link>
          <h1 className="mb-2 mt-7 font-display text-4xl uppercase text-nautilus-white">
            Activer mon compte
          </h1>
          <p className="font-mono text-sm text-nautilus-gray">
            Choisissez votre mot de passe.
          </p>
        </div>

        {valid ? (
          <ActivateForm token={token!} />
        ) : (
          <div className="rounded-[18px] border border-red-700/40 bg-nautilus-card p-6 text-center">
            <p className="font-display text-xl uppercase text-nautilus-white">
              Lien invalide ou expiré
            </p>
            <p className="mt-2 text-sm text-nautilus-gray">
              Contactez l&apos;équipe du Nautilus pour recevoir un nouveau lien
              d&apos;activation.
            </p>
            <Link
              href="/devenir-artiste"
              className="mt-5 inline-block font-mono text-[12px] uppercase tracking-[0.1em] text-nautilus-gold hover:underline"
            >
              Refaire une demande →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
