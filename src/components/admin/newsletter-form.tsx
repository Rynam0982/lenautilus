"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Eye, Loader2, Send } from "lucide-react";

export type NewsletterEventOption = {
  id: string;
  title: string;
  date: string;
};

export function NewsletterForm({
  configured,
  events,
}: {
  configured: boolean;
  events: NewsletterEventOption[];
}) {
  const [subject, setSubject] = useState("");
  const [preheader, setPreheader] = useState("");
  const [intro, setIntro] = useState("");
  const [selected, setSelected] = useState<string[]>(events.slice(0, 3).map((e) => e.id));
  const [loading, setLoading] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  function payload(preview: boolean) {
    return JSON.stringify({ subject, preheader, intro, eventIds: selected, preview });
  }

  async function onPreview() {
    if (!subject || !intro) {
      toast.error("Renseignez au moins l'objet et le message.");
      return;
    }
    setPreviewing(true);
    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload(true),
      });
      const data = await res.json();
      if (res.ok && data.html) {
        const w = window.open("", "_blank");
        w?.document.write(data.html);
        w?.document.close();
      } else {
        toast.error(data.error ?? "Aperçu impossible.");
      }
    } catch {
      toast.error("Erreur réseau.");
    } finally {
      setPreviewing(false);
    }
  }

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm("Envoyer cette newsletter à tous les abonnés ?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload(false),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Newsletter envoyée à l'audience.");
        setSubject("");
        setPreheader("");
        setIntro("");
      } else {
        toast.error(data.error ?? "Envoi impossible.");
      }
    } catch {
      toast.error("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full h-11 px-4 rounded-xl border border-nautilus-border bg-nautilus-dark text-sm text-nautilus-white placeholder:text-nautilus-gray/50 focus:border-nautilus-gold/60 focus:outline-none";

  return (
    <form onSubmit={onSend} className="space-y-6 max-w-2xl">
      {!configured && (
        <div className="rounded-lg border border-amber-700/40 bg-amber-900/10 p-4 text-sm text-amber-300">
          Mailchimp n&apos;est pas encore configuré. Renseignez{" "}
          <code className="text-amber-200">MAILCHIMP_API_KEY</code>,{" "}
          <code className="text-amber-200">MAILCHIMP_SERVER_PREFIX</code> et{" "}
          <code className="text-amber-200">MAILCHIMP_AUDIENCE_ID</code>. L&apos;aperçu
          reste disponible.
        </div>
      )}

      <div>
        <label className="block text-sm text-nautilus-gray-light mb-1.5">Objet</label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Ex : 🎵 5 concerts à ne pas manquer ce mois-ci"
          className={inputCls}
        />
        <p className="mt-1 text-xs text-nautilus-gray">
          Court et accrocheur (40–60 caractères). C&apos;est le 1ᵉʳ levier d&apos;ouverture.
        </p>
      </div>

      <div>
        <label className="block text-sm text-nautilus-gray-light mb-1.5">
          Texte d&apos;aperçu (preheader)
        </label>
        <input
          value={preheader}
          onChange={(e) => setPreheader(e.target.value)}
          placeholder="La phrase affichée après l'objet dans la boîte mail"
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-sm text-nautilus-gray-light mb-1.5">
          Message d&apos;introduction
        </label>
        <textarea
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
          rows={5}
          placeholder="Quelques lignes pour présenter l'édition… (gardez-le court et lisible)"
          className="w-full px-4 py-3 rounded-xl border border-nautilus-border bg-nautilus-dark text-sm text-nautilus-white placeholder:text-nautilus-gray/50 focus:border-nautilus-gold/60 focus:outline-none resize-y"
        />
      </div>

      <div>
        <label className="block text-sm text-nautilus-gray-light mb-2">
          Événements à mettre en avant
        </label>
        {events.length === 0 ? (
          <p className="text-sm text-nautilus-gray">Aucun événement à venir disponible.</p>
        ) : (
          <div className="space-y-1.5 max-h-64 overflow-y-auto rounded-xl border border-nautilus-border p-2">
            {events.map((ev) => (
              <label
                key={ev.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-nautilus-muted cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(ev.id)}
                  onChange={() => toggle(ev.id)}
                  className="accent-nautilus-gold"
                />
                <span className="text-sm text-nautilus-white flex-1">{ev.title}</span>
                <span className="text-xs text-nautilus-gray">{ev.date}</span>
              </label>
            ))}
          </div>
        )}
        <p className="mt-1 text-xs text-nautilus-gray">
          Conseil : 3 à 5 événements maximum, chacun avec son bouton « Réserver ».
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onPreview}
          disabled={previewing}
          className="h-11 px-5 inline-flex items-center gap-2 rounded-xl border border-nautilus-border text-sm font-medium text-nautilus-white hover:border-nautilus-gold/50 transition-colors disabled:opacity-60"
        >
          {previewing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
          Aperçu
        </button>
        <button
          type="submit"
          disabled={loading}
          className="h-11 px-6 inline-flex items-center gap-2 rounded-xl bg-nautilus-gold text-nautilus-black text-sm font-semibold hover:bg-nautilus-gold-light transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Envoyer la newsletter
        </button>
      </div>
    </form>
  );
}
