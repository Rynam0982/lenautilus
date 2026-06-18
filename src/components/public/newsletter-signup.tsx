"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

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
    <form onSubmit={onSubmit} className="flex w-full md:w-auto gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="votre@email.fr"
        className="h-11 w-full md:w-64 px-4 rounded-xl border border-nautilus-border bg-nautilus-dark/60 text-sm text-nautilus-white placeholder:text-nautilus-gray/50 focus:border-nautilus-gold/60 focus:outline-none transition-colors"
      />
      <button
        type="submit"
        disabled={loading}
        className="h-11 px-5 inline-flex items-center gap-2 rounded-xl bg-nautilus-gold text-nautilus-black text-sm font-semibold hover:bg-nautilus-gold-light transition-colors disabled:opacity-60 shrink-0"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        S’inscrire
      </button>
    </form>
  );
}
