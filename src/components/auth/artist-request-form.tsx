"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function ArtistRequestForm() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setLoading(true);
    try {
      const res = await fetch("/api/artist/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? "Erreur");
      setDone(true);
      form.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-[18px] border border-nautilus-gold/40 bg-nautilus-card p-8 text-center">
        <p className="font-display text-2xl uppercase text-nautilus-white">
          Demande envoyée
        </p>
        <p className="mt-2 text-sm text-nautilus-gray">
          Merci ! Notre équipe étudie votre demande et reviendra vers vous par
          e-mail pour activer votre compte.
        </p>
      </div>
    );
  }

  const field =
    "w-full rounded-xl border border-nautilus-border-strong bg-transparent px-4 py-3 text-sm text-nautilus-white placeholder:text-nautilus-gray/60 focus:border-nautilus-gold/70 focus:outline-none";
  const label =
    "mb-1 block font-mono text-[11px] uppercase tracking-[0.1em] text-nautilus-gray";

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-[18px] border border-nautilus-border bg-nautilus-card p-6 sm:p-8"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="firstName">Prénom</label>
          <input id="firstName" name="firstName" required maxLength={80} className={field} placeholder="Prénom" />
        </div>
        <div>
          <label className={label} htmlFor="lastName">Nom</label>
          <input id="lastName" name="lastName" required maxLength={80} className={field} placeholder="Nom" />
        </div>
      </div>
      <div>
        <label className={label} htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" required className={field} placeholder="vous@email.fr" />
      </div>
      <div>
        <label className={label} htmlFor="description">Votre projet / présentation</label>
        <textarea
          id="description"
          name="description"
          required
          minLength={20}
          maxLength={2000}
          rows={5}
          className={field}
          placeholder="Parlez-nous de votre projet artistique, votre style, vos références…"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        data-hov
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-nautilus-gold px-6 py-[14px] text-[15px] font-bold text-nautilus-black transition-colors hover:bg-nautilus-gold-light disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Envoyer ma demande
      </button>
      <p className="text-center font-mono text-[11px] text-nautilus-gray-dim">
        Un administrateur créera votre compte et vous enverra un lien d&apos;activation.
      </p>
    </form>
  );
}
