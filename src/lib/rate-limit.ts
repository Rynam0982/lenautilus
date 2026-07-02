import { headers } from "next/headers";

/**
 * Limiteur de débit en mémoire (fenêtre glissante simplifiée).
 *
 * Suffisant pour un déploiement mono-instance (Vercel serverless recycle les
 * instances, ce qui borne naturellement la mémoire). Pour du multi-instance,
 * remplacer le Map par Redis/Upstash sans changer l'API.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Purge paresseuse pour éviter une croissance infinie du Map.
let lastSweep = Date.now();
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = {
  ok: boolean;
  /** Secondes à attendre avant de réessayer (0 si ok). */
  retryAfter: number;
};

/**
 * Consomme une unité pour `key`. Autorise `limit` appels par fenêtre de
 * `windowMs` millisecondes.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

/** IP du client (x-forwarded-for posé par Vercel/reverse-proxy). */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown"
  );
}

/**
 * Garde-fou prêt à l'emploi pour une route API : limite par IP.
 * Retourne `null` si autorisé, sinon un objet à renvoyer en 429.
 */
export async function rateLimitByIp(
  scope: string,
  limit: number,
  windowMs: number
): Promise<{ error: string; retryAfter: number } | null> {
  const ip = await clientIp();
  const res = rateLimit(`${scope}:${ip}`, limit, windowMs);
  if (res.ok) return null;
  return {
    error: "Trop de requêtes. Réessayez dans quelques instants.",
    retryAfter: res.retryAfter,
  };
}
