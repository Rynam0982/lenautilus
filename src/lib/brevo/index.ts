/**
 * Client minimal pour l'API Brevo (ex-Sendinblue), construit sur fetch —
 * aucune dépendance supplémentaire. Toutes les fonctions se dégradent
 * proprement quand les variables d'environnement ne sont pas configurées
 * (même philosophie que src/lib/email).
 *
 * Variables d'environnement requises :
 *  - BREVO_API_KEY       (clé API v3, format "xkeysib-…")
 *  - BREVO_LIST_ID       (id numérique de la liste de contacts)
 *  - BREVO_SENDER_EMAIL  (expéditeur validé dans Brevo, ex. bonjour@le-nautilus.org)
 * Optionnelle :
 *  - BREVO_SENDER_NAME   (défaut : "Le Nautilus")
 */

const API_KEY = process.env.BREVO_API_KEY;
const LIST_ID = Number(process.env.BREVO_LIST_ID ?? NaN);
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;
const SENDER_NAME = process.env.BREVO_SENDER_NAME ?? "Le Nautilus";

const BASE_URL = "https://api.brevo.com/v3";

export function isBrevoConfigured(): boolean {
  return Boolean(API_KEY && Number.isFinite(LIST_ID));
}

async function brevo<T = unknown>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "api-key": API_KEY!,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  // Brevo répond 204 sans corps sur plusieurs endpoints (update, sendNow).
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const detail = (data.message as string) ?? res.statusText;
    const err = new Error(detail) as Error & { status?: number; code?: string };
    err.status = res.status;
    err.code = data.code as string | undefined;
    throw err;
  }
  return data as T;
}

/** Inscrit (ou ré-inscrit) un e-mail à la liste. Idempotent. */
export async function subscribeToNewsletter(
  email: string
): Promise<{ ok: boolean; reason?: string }> {
  if (!isBrevoConfigured()) {
    console.warn("[BREVO] Not configured — subscription ignored:", email);
    return { ok: false, reason: "not_configured" };
  }
  try {
    // updateEnabled: true → upsert du contact (pas d'erreur s'il existe déjà).
    await brevo("POST", "/contacts", {
      email: email.toLowerCase(),
      listIds: [LIST_ID],
      updateEnabled: true,
    });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[BREVO] subscribe error:", message);
    return { ok: false, reason: message };
  }
}

/** Nombre d'abonnés de la liste (0 si non configuré). */
export async function getAudienceStats(): Promise<{
  configured: boolean;
  memberCount: number;
  name?: string;
}> {
  if (!isBrevoConfigured()) return { configured: false, memberCount: 0 };
  try {
    const list = await brevo<{
      name: string;
      uniqueSubscribers?: number;
      totalSubscribers?: number;
    }>("GET", `/contacts/lists/${LIST_ID}`);
    return {
      configured: true,
      memberCount: list.uniqueSubscribers ?? list.totalSubscribers ?? 0,
      name: list.name,
    };
  } catch (err) {
    console.error("[BREVO] stats error:", err);
    return { configured: true, memberCount: 0 };
  }
}

/** Crée une campagne e-mail pour la liste et l'envoie immédiatement. */
export async function sendNewsletterCampaign(input: {
  subject: string;
  title?: string;
  preheader?: string;
  html: string;
  fromName?: string;
  replyTo?: string;
}): Promise<{ ok: boolean; reason?: string }> {
  if (!isBrevoConfigured()) {
    return { ok: false, reason: "not_configured" };
  }
  if (!SENDER_EMAIL) {
    return { ok: false, reason: "BREVO_SENDER_EMAIL manquant" };
  }
  try {
    const campaign = await brevo<{ id: number }>("POST", "/emailCampaigns", {
      name: input.title ?? input.subject,
      subject: input.subject,
      previewText: input.preheader ?? "",
      sender: { name: input.fromName ?? SENDER_NAME, email: SENDER_EMAIL },
      replyTo: input.replyTo ?? SENDER_EMAIL,
      htmlContent: input.html,
      recipients: { listIds: [LIST_ID] },
    });
    await brevo("POST", `/emailCampaigns/${campaign.id}/sendNow`);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[BREVO] campaign error:", message);
    return { ok: false, reason: message };
  }
}
