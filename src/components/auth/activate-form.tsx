"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function ActivateForm({ token }: { token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    if (password.length < 8) {
      toast.error("Le mot de passe doit faire au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? "Erreur");
      toast.success("Compte activé ! Vous pouvez vous connecter.");
      router.push("/auth/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  const field =
    "w-full rounded-xl border border-nautilus-border-strong bg-transparent px-4 py-3 text-sm text-nautilus-white placeholder:text-nautilus-gray/60 focus:border-nautilus-gold/70 focus:outline-none";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input
        name="password"
        type="password"
        required
        placeholder="Nouveau mot de passe (8 caractères min.)"
        className={field}
      />
      <input
        name="confirm"
        type="password"
        required
        placeholder="Confirmer le mot de passe"
        className={field}
      />
      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-nautilus-gold px-6 py-[14px] text-[15px] font-bold text-nautilus-black transition-colors hover:bg-nautilus-gold-light disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Activer mon compte
      </button>
    </form>
  );
}
