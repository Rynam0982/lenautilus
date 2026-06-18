"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

export function NewsletterForm({ configured }: { configured: boolean }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject || !message) return;
    if (!confirm("Envoyer cette newsletter à tous les abonnés ?")) return;

    setLoading(true);
    // Wrap the plain message in a simple branded HTML template.
    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
        <h1 style="color:#c9a84c;font-family:Georgia,serif">Le Nautilus</h1>
        <div style="font-size:15px;line-height:1.6">${message.replace(/\n/g, "<br/>")}</div>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <p style="font-size:12px;color:#888">Le Nautilus — 20 rue Jules Verne, 66000 Perpignan</p>
      </div>`;

    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, html }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Newsletter envoyée à l'audience.");
        setSubject("");
        setMessage("");
      } else {
        toast.error(data.error ?? "Envoi impossible.");
      }
    } catch {
      toast.error("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 max-w-2xl">
      {!configured && (
        <div className="rounded-lg border border-amber-700/40 bg-amber-900/10 p-4 text-sm text-amber-300">
          Mailchimp n’est pas encore configuré. Renseignez{" "}
          <code className="text-amber-200">MAILCHIMP_API_KEY</code>,{" "}
          <code className="text-amber-200">MAILCHIMP_SERVER_PREFIX</code> et{" "}
          <code className="text-amber-200">MAILCHIMP_AUDIENCE_ID</code> dans
          l’environnement pour activer l’envoi.
        </div>
      )}

      <div>
        <label className="block text-sm text-nautilus-gray-light mb-1.5">Sujet</label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Ex : La programmation de juin au Nautilus"
          className="w-full h-11 px-4 rounded-xl border border-nautilus-border bg-nautilus-dark text-sm text-nautilus-white placeholder:text-nautilus-gray/50 focus:border-nautilus-gold/60 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm text-nautilus-gray-light mb-1.5">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={10}
          placeholder="Votre message…"
          className="w-full px-4 py-3 rounded-xl border border-nautilus-border bg-nautilus-dark text-sm text-nautilus-white placeholder:text-nautilus-gray/50 focus:border-nautilus-gold/60 focus:outline-none resize-y"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="h-11 px-6 inline-flex items-center gap-2 rounded-xl bg-nautilus-gold text-nautilus-black text-sm font-semibold hover:bg-nautilus-gold-light transition-colors disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Envoyer la newsletter
      </button>
    </form>
  );
}
