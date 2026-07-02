import { Mail, Users } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { getAudienceStats } from "@/lib/brevo";
import { getPublicEvents } from "@/services/events.service";
import { NewsletterForm } from "@/components/admin/newsletter-form";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  await requireAdmin();
  const [stats, eventsRes] = await Promise.all([
    getAudienceStats(),
    getPublicEvents({ upcoming: true, perPage: 12 }),
  ]);

  const eventOptions = eventsRes.data.map((e) => ({
    id: e.id,
    title: e.title,
    date: new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(
      new Date(e.startDate)
    ),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-nautilus-white">
          Newsletter
        </h1>
        <p className="text-sm text-nautilus-gray mt-1">
          Rédigez et envoyez une newsletter à vos abonnés via Brevo.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-nautilus-border bg-nautilus-card p-5 flex items-center gap-4">
          <div className="h-11 w-11 rounded-lg bg-nautilus-gold/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-nautilus-gold" />
          </div>
          <div>
            <p className="text-2xl font-bold text-nautilus-white">
              {stats.memberCount}
            </p>
            <p className="text-xs text-nautilus-gray">Abonnés</p>
          </div>
        </div>
        <div className="rounded-xl border border-nautilus-border bg-nautilus-card p-5 flex items-center gap-4">
          <div className="h-11 w-11 rounded-lg bg-nautilus-gold/10 flex items-center justify-center">
            <Mail className="h-5 w-5 text-nautilus-gold" />
          </div>
          <div>
            <p className="text-sm font-medium text-nautilus-white">
              {stats.configured ? stats.name ?? "Liste Brevo" : "Non configuré"}
            </p>
            <p className="text-xs text-nautilus-gray">
              {stats.configured ? "Connecté à Brevo" : "Brevo inactif"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-nautilus-border bg-nautilus-card p-6">
        <NewsletterForm configured={stats.configured} events={eventOptions} />
      </div>
    </div>
  );
}
