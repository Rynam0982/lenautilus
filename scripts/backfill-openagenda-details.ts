import { config } from "dotenv";
// override: .env.local must win over the default prisma-init .env (localhost).
config({ path: ".env.local", override: true });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BASE_URL = "https://api.openagenda.com/v2";
const PUBLIC_KEY = process.env.OPENAGENDA_PUBLIC_KEY!;
const AGENDA_UID = process.env.OPENAGENDA_AGENDA_UID!;

function getText(field: any): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field.fr || field.en || (Object.values(field)[0] as string) || "";
}

function truncate(str: string, max: number): string {
  if (!str) return "";
  return str.length <= max ? str : str.slice(0, max - 1) + "…";
}

function getImageUrl(img: any): string | null {
  if (!img) return null;
  const base = img.base || "https://cdn.openagenda.com/main/";
  const full = (img.variants || []).find((v: any) => v.type === "full");
  const fn = full?.filename || img.filename;
  return fn ? base + fn : null;
}

// OpenAgenda flags cancellations in the title ("[ANNULÉ]") and in the body
// ("ANNULATION DE CE CONCERT"), NOT via the numeric `status` field. Detect both.
function detectCancelled(oa: any, title: string, longDesc: string): boolean {
  if (oa?.status === 6) return true;
  if (/annul/i.test(title)) return true;
  if (/^\s*annulation\b/i.test(longDesc)) return true;
  return false;
}

async function fetchEventDetail(uid: number) {
  const params = new URLSearchParams({
    key: PUBLIC_KEY,
    "longDescription[size]": "20000",
  });
  const res = await fetch(
    `${BASE_URL}/agendas/${AGENDA_UID}/events/${uid}?${params}`
  );
  if (!res.ok) return null;
  const json = (await res.json()) as { event?: any };
  return json.event ?? null;
}

/**
 * Backfills events imported from OpenAgenda:
 *  - fills the full longDescription (the bulk import truncated it),
 *  - refreshes the short description when it was empty/equal to the title,
 *  - flags cancelled events (OpenAgenda status === 6) as CANCELLED.
 *
 * Safe to re-run. Only touches events that have an openAgendaUid.
 */
async function main() {
  console.log("🔄 Backfill OpenAgenda details (descriptions + annulations)");

  const events = await prisma.event.findMany({
    where: { openAgendaUid: { not: null } },
    select: {
      id: true,
      title: true,
      openAgendaUid: true,
      description: true,
      longDescription: true,
      status: true,
      isPublic: true,
      coverImage: true,
      startDate: true,
      endDate: true,
    },
  });
  console.log(`📋 ${events.length} événements OpenAgenda à vérifier\n`);

  let updated = 0,
    cancelled = 0,
    skipped = 0,
    errors = 0;

  for (const ev of events) {
    try {
      const oa = await fetchEventDetail(ev.openAgendaUid!);
      if (!oa) {
        skipped++;
        continue;
      }

      const longDescription = getText(oa.longDescription) || null;
      const rawDesc = getText(oa.description);
      const description = truncate(rawDesc || ev.title, 200);
      const isCancelled = detectCancelled(oa, ev.title, longDescription ?? "");

      const data: Record<string, unknown> = {};
      if (longDescription && longDescription !== ev.longDescription)
        data.longDescription = longDescription;
      if (description && description !== ev.description)
        data.description = description;
      if (isCancelled && ev.status !== "CANCELLED") data.status = "CANCELLED";
      // All events come from the public agenda → they should be public &
      // published (some were wrongly imported as APPROVED / private).
      else if (!isCancelled && (ev.status !== "PUBLISHED" || !ev.isPublic)) {
        data.status = "PUBLISHED";
        data.isPublic = true;
      }

      // Dates: prefer the NEXT upcoming occurrence (recurring events were stored
      // with a past/wrong start date, hiding them from "À venir").
      const startTiming = oa.nextTiming || oa.firstTiming;
      const endTiming = oa.nextTiming || oa.lastTiming;
      if (startTiming?.begin) {
        const sd = new Date(startTiming.begin);
        if (!isNaN(sd.getTime()) && sd.getTime() !== ev.startDate.getTime())
          data.startDate = sd;
      }
      if (endTiming?.end) {
        const ed = new Date(endTiming.end);
        if (!isNaN(ed.getTime()) && ed.getTime() !== ev.endDate.getTime())
          data.endDate = ed;
      }

      // Cover image: fill it when missing.
      if (!ev.coverImage) {
        const url = getImageUrl(oa.image);
        if (url) data.coverImage = url;
      }

      if (Object.keys(data).length === 0) {
        skipped++;
        continue;
      }

      await prisma.event.update({ where: { id: ev.id }, data });
      if (data.status === "CANCELLED") cancelled++;
      updated++;
      if (updated % 10 === 0) process.stdout.write(`  ✅ ${updated} mis à jour…\r`);
    } catch (err) {
      errors++;
      if (errors <= 5)
        console.error(`\n⚠️  UID ${ev.openAgendaUid}:`, err instanceof Error ? err.message : err);
    }
  }

  console.log("\n══════════════════════════════════");
  console.log(`✅ Mis à jour : ${updated}`);
  console.log(`🚫 Annulés    : ${cancelled}`);
  console.log(`⏭️  Inchangés  : ${skipped}`);
  console.log(`❌ Erreurs    : ${errors}`);
  console.log("══════════════════════════════════");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
