import crypto from "crypto";

/**
 * Minimal Mailchimp Marketing API client built on fetch (no extra dependency).
 * All functions degrade gracefully when the env vars are not configured, so the
 * app keeps working without Mailchimp credentials (mirrors src/lib/email).
 *
 * Required env vars:
 *  - MAILCHIMP_API_KEY        (e.g. "xxxxxxxx-us21")
 *  - MAILCHIMP_SERVER_PREFIX  (e.g. "us21") — falls back to the suffix of the key
 *  - MAILCHIMP_AUDIENCE_ID    (the list / audience id)
 */

const API_KEY = process.env.MAILCHIMP_API_KEY;
const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;
const SERVER_PREFIX =
  process.env.MAILCHIMP_SERVER_PREFIX ?? API_KEY?.split("-")[1] ?? "";

export function isMailchimpConfigured(): boolean {
  return Boolean(API_KEY && AUDIENCE_ID && SERVER_PREFIX);
}

function baseUrl(): string {
  return `https://${SERVER_PREFIX}.api.mailchimp.com/3.0`;
}

function authHeader(): string {
  return "Basic " + Buffer.from(`anystring:${API_KEY}`).toString("base64");
}

async function mc<T = unknown>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(`${baseUrl()}${path}`, {
    method,
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const detail = (data.detail as string) ?? res.statusText;
    const err = new Error(detail) as Error & { status?: number; title?: string };
    err.status = res.status;
    err.title = data.title as string | undefined;
    throw err;
  }
  return data as T;
}

/** Subscribe (or re-subscribe) an email to the audience. Idempotent. */
export async function subscribeToNewsletter(
  email: string
): Promise<{ ok: boolean; reason?: string }> {
  if (!isMailchimpConfigured()) {
    console.warn("[MAILCHIMP] Not configured — subscription ignored:", email);
    return { ok: false, reason: "not_configured" };
  }
  const hash = crypto
    .createHash("md5")
    .update(email.toLowerCase())
    .digest("hex");
  try {
    // PUT upserts the member; status_if_new = subscribed for single opt-in.
    await mc("PUT", `/lists/${AUDIENCE_ID}/members/${hash}`, {
      email_address: email,
      status_if_new: "subscribed",
    });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[MAILCHIMP] subscribe error:", message);
    return { ok: false, reason: message };
  }
}

/** Number of subscribed members in the audience (0 if unconfigured). */
export async function getAudienceStats(): Promise<{
  configured: boolean;
  memberCount: number;
  name?: string;
}> {
  if (!isMailchimpConfigured()) return { configured: false, memberCount: 0 };
  try {
    const list = await mc<{
      name: string;
      stats?: { member_count: number };
    }>("GET", `/lists/${AUDIENCE_ID}`);
    return {
      configured: true,
      memberCount: list.stats?.member_count ?? 0,
      name: list.name,
    };
  } catch (err) {
    console.error("[MAILCHIMP] stats error:", err);
    return { configured: true, memberCount: 0 };
  }
}

/** Create a campaign for the audience, set its HTML content, and send it. */
export async function sendNewsletterCampaign(input: {
  subject: string;
  title?: string;
  preheader?: string;
  html: string;
  fromName?: string;
  replyTo?: string;
}): Promise<{ ok: boolean; reason?: string }> {
  if (!isMailchimpConfigured()) {
    return { ok: false, reason: "not_configured" };
  }
  try {
    const campaign = await mc<{ id: string }>("POST", "/campaigns", {
      type: "regular",
      recipients: { list_id: AUDIENCE_ID },
      settings: {
        subject_line: input.subject,
        preview_text: input.preheader ?? "",
        title: input.title ?? input.subject,
        from_name: input.fromName ?? "Le Nautilus",
        reply_to: input.replyTo ?? "bonjour@le-nautilus.org",
        auto_footer: false,
      },
    });
    await mc("PUT", `/campaigns/${campaign.id}/content`, { html: input.html });
    await mc("POST", `/campaigns/${campaign.id}/actions/send`);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[MAILCHIMP] campaign error:", message);
    return { ok: false, reason: message };
  }
}
