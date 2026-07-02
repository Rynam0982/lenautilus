"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Inscription confirmée. Merci !");
        setEmail("");
      } else {
        toast.error(data.error ?? "Inscription impossible.");
      }
    } catch {
      toast.error("Erreur réseau. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex min-w-[260px] max-w-[420px] overflow-hidden border-2 border-nautilus-ink shadow-[3px_3px_0_var(--shadow-hard)] focus-within:shadow-[5px_5px_0_var(--shadow-hard)] transition-shadow"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="votre@email.fr"
        className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-nautilus-white placeholder:text-nautilus-gray/60 focus:outline-none"
      />
      <button
        type="submit"
        disabled={loading}
        data-hov
        className="inline-flex shrink-0 items-center justify-center border-l-2 border-nautilus-ink bg-nautilus-gold px-5 text-base font-bold text-[color:var(--paper-chip)] transition-colors hover:bg-nautilus-gold-light disabled:opacity-60"
        aria-label="S'inscrire à la newsletter"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "→"}
      </button>
    </form>
  );
}
