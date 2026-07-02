// Responsive, marketing-grade HTML email template for the Nautilus newsletter.
// Table-based + inline styles for maximum email-client compatibility (mobile-first
// — ~60% of opens are on mobile). Features upcoming events with a single clear CTA
// each ("Réserver"), a branded header and a compliant footer (unsubscribe + address).

export type NewsletterEvent = {
  slug: string;
  title: string;
  coverImage: string | null;
  startDate: Date;
  venueName: string;
  minPrice: number; // cents
  isFree: boolean;
};

const GOLD = "#b58a2e";
const INK = "#1b1a16";
const MUTED = "#6a6359";
const CREAM = "#f6f1e7";

function fmtDate(d: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(d));
}

function fmtTime(d: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
}

function eventBlock(ev: NewsletterEvent, appUrl: string): string {
  const url = `${appUrl}/events/${ev.slug}`;
  const price = ev.isFree
    ? "Gratuit"
    : `dès ${(ev.minPrice / 100).toLocaleString("fr-FR")} €`;
  const img = ev.coverImage
    ? `<img src="${ev.coverImage}" alt="${ev.title}" width="536" style="width:100%;max-width:536px;height:auto;display:block;border-radius:12px;" />`
    : "";

  return `
  <tr><td style="padding:14px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e6ddca;border-radius:14px;overflow:hidden;">
      <tr><td style="padding:12px;">${img}</td></tr>
      <tr><td style="padding:4px 18px 18px 18px;">
        <p style="margin:0 0 6px;font:600 13px/1.2 Arial,Helvetica,sans-serif;color:${GOLD};text-transform:uppercase;letter-spacing:1px;">${fmtDate(ev.startDate)} · ${fmtTime(ev.startDate)}</p>
        <h3 style="margin:0 0 6px;font:700 20px/1.25 Georgia,serif;color:${INK};">${ev.title}</h3>
        <p style="margin:0 0 14px;font:400 14px/1.4 Arial,Helvetica,sans-serif;color:${MUTED};">📍 ${ev.venueName} &nbsp;·&nbsp; ${price}</p>
        <a href="${url}" style="display:inline-block;background:${GOLD};color:#ffffff;font:700 14px/1 Arial,Helvetica,sans-serif;text-decoration:none;padding:12px 22px;border-radius:8px;">Réserver ma place →</a>
      </td></tr>
    </table>
  </td></tr>`;
}

export function buildNewsletterHtml(opts: {
  title: string;
  preheader?: string;
  intro: string;
  events: NewsletterEvent[];
  appUrl: string;
}): string {
  const { title, preheader = "", intro, events, appUrl } = opts;

  const eventsHtml = events.length
    ? `<tr><td style="padding:8px 0 0;">
         <p style="margin:0 0 4px;font:700 16px/1.2 Georgia,serif;color:${INK};">À l'affiche</p>
       </td></tr>${events.map((e) => eventBlock(e, appUrl)).join("")}`
    : "";

  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="color-scheme" content="light"/>
<title>${title}</title></head>
<body style="margin:0;padding:0;background:${CREAM};">
  <span style="display:none!important;opacity:0;color:${CREAM};height:0;width:0;overflow:hidden;">${preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};">
    <tr><td align="center" style="padding:24px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;">

        <!-- Header -->
        <tr><td style="padding:8px 8px 20px;text-align:center;">
          <img src="${appUrl}/images/logo-nautilus.jpg" alt="Le Nautilus" width="48" height="48" style="border-radius:50%;display:inline-block;vertical-align:middle;" />
          <span style="font:700 22px/48px Georgia,serif;color:${INK};vertical-align:middle;margin-left:10px;letter-spacing:1px;">LE NAUTILUS</span>
        </td></tr>

        <!-- Hero / title -->
        <tr><td style="background:${INK};border-radius:16px;padding:34px 28px;text-align:center;">
          <h1 style="margin:0;font:700 28px/1.25 Georgia,serif;color:#ffffff;">${title}</h1>
        </td></tr>

        <!-- Intro -->
        <tr><td style="padding:24px 8px 4px;">
          <p style="margin:0;font:400 16px/1.6 Arial,Helvetica,sans-serif;color:${INK};">${intro.replace(/\n/g, "<br/>")}</p>
        </td></tr>

        <!-- Events -->
        ${eventsHtml}

        <!-- Primary CTA -->
        <tr><td style="padding:22px 8px;text-align:center;">
          <a href="${appUrl}/events" style="display:inline-block;background:${INK};color:#ffffff;font:700 15px/1 Arial,Helvetica,sans-serif;text-decoration:none;padding:15px 30px;border-radius:10px;">Voir toute la programmation →</a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 8px;border-top:1px solid #e6ddca;text-align:center;">
          <p style="margin:0 0 8px;font:400 13px/1.5 Arial,Helvetica,sans-serif;color:${MUTED};">
            <a href="https://www.instagram.com/lenautilusperpignan/" style="color:${GOLD};text-decoration:none;">Instagram</a> &nbsp;·&nbsp;
            <a href="https://www.facebook.com/people/Le-Nautilus/61559046365589/" style="color:${GOLD};text-decoration:none;">Facebook</a>
          </p>
          <p style="margin:0 0 6px;font:400 12px/1.5 Arial,Helvetica,sans-serif;color:${MUTED};">Le Nautilus — 20 rue Jules Verne, 66000 Perpignan</p>
          <p style="margin:0;font:400 12px/1.5 Arial,Helvetica,sans-serif;color:${MUTED};">
            *|LIST:ADDRESS|* &nbsp;·&nbsp; <a href="*|UNSUB|*" style="color:${MUTED};text-decoration:underline;">Se désinscrire</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}
