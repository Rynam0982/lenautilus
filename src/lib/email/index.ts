import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = "Le Nautilus <noreply@lenautilus.fr>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://lenautilus.vercel.app";

/** Send an email — silently no-ops if RESEND_API_KEY is not configured. */
async function send(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (!resend) {
    console.warn("[EMAIL] RESEND_API_KEY not set — email not sent:", options.subject);
    return;
  }
  const { error } = await resend.emails.send({ from: FROM, ...options });
  if (error) console.error("[EMAIL] Send error:", error);
}

// ─── Reservation emails ────────────────────────────────────────────────────────

export async function sendReservationSubmittedToAdmin(data: {
  adminEmail: string;
  artistName: string;
  artistEmail: string;
  eventTitle: string;
  venueName: string;
  startDate: Date;
  endDate: Date;
  reservationId: string;
}) {
  const start = data.startDate.toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "short" });
  const end = data.endDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  await send({
    to: data.adminEmail,
    subject: `[Le Nautilus] Nouvelle demande de réservation — ${data.eventTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#c9a84c">Nouvelle demande de réservation</h2>
        <p>L'artiste <strong>${data.artistName}</strong> (${data.artistEmail}) a soumis une demande.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666">Événement</td><td style="padding:8px;border-bottom:1px solid #eee"><strong>${data.eventTitle}</strong></td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666">Salle</td><td style="padding:8px;border-bottom:1px solid #eee">${data.venueName}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666">Date</td><td style="padding:8px;border-bottom:1px solid #eee">${start} — ${end}</td></tr>
        </table>
        <a href="${APP_URL}/admin/reservations" style="display:inline-block;background:#c9a84c;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">
          Traiter la demande →
        </a>
      </div>
    `,
  });
}

export async function sendReservationApprovedToArtist(data: {
  artistEmail: string;
  artistName: string;
  eventTitle: string;
  venueName: string;
  startDate: Date;
  endDate: Date;
  isPublic: boolean;
  adminNotes?: string | null;
}) {
  const start = data.startDate.toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "short" });
  const end = data.endDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  await send({
    to: data.artistEmail,
    subject: `✅ Votre réservation a été approuvée — ${data.eventTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#22c55e">Réservation approuvée !</h2>
        <p>Bonjour ${data.artistName},</p>
        <p>Votre demande de réservation a été <strong>approuvée</strong> par l'équipe du Nautilus.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666">Événement</td><td style="padding:8px;border-bottom:1px solid #eee"><strong>${data.eventTitle}</strong></td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666">Salle</td><td style="padding:8px;border-bottom:1px solid #eee">${data.venueName}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666">Date</td><td style="padding:8px;border-bottom:1px solid #eee">${start} — ${end}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666">Visibilité</td><td style="padding:8px;border-bottom:1px solid #eee">${data.isPublic ? "🌐 Public (visible sur le site)" : "🔒 Privé"}</td></tr>
        </table>
        ${data.adminNotes ? `<div style="background:#f0f9ff;border-left:4px solid #c9a84c;padding:12px;margin:16px 0"><strong>Message de l'équipe :</strong><p style="margin:4px 0">${data.adminNotes}</p></div>` : ""}
        <a href="${APP_URL}/artist/dashboard" style="display:inline-block;background:#c9a84c;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">
          Voir mon espace artiste →
        </a>
      </div>
    `,
  });
}

export async function sendReservationRefusedToArtist(data: {
  artistEmail: string;
  artistName: string;
  eventTitle: string;
  venueName: string;
  startDate: Date;
  adminNotes?: string | null;
}) {
  const start = data.startDate.toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "short" });

  await send({
    to: data.artistEmail,
    subject: `❌ Votre demande de réservation — ${data.eventTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#ef4444">Demande non retenue</h2>
        <p>Bonjour ${data.artistName},</p>
        <p>Nous sommes désolés, votre demande de réservation pour <strong>${data.eventTitle}</strong> le ${start} à ${data.venueName} n'a pas pu être retenue.</p>
        ${data.adminNotes ? `<div style="background:#fff5f5;border-left:4px solid #ef4444;padding:12px;margin:16px 0"><strong>Raison :</strong><p style="margin:4px 0">${data.adminNotes}</p></div>` : ""}
        <p>N'hésitez pas à soumettre une nouvelle demande pour une autre date.</p>
        <a href="${APP_URL}/artist/reservations/new" style="display:inline-block;background:#c9a84c;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">
          Faire une nouvelle demande →
        </a>
      </div>
    `,
  });
}
