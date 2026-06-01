import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BASE_URL = "https://api.openagenda.com/v2";
const CDN_URL = "https://cdn.openagenda.com/main";
const PUBLIC_KEY = process.env.OPENAGENDA_PUBLIC_KEY!;
const AGENDA_UID = process.env.OPENAGENDA_AGENDA_UID!;

function truncate(str: string, max: number): string {
  if (!str) return "";
  return str.length <= max ? str : str.slice(0, max - 1) + "…";
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .slice(0, 80);
}

async function generateUniqueSlug(title: string): Promise<string> {
  const base = slugify(title) || "event";
  let slug = base;
  let counter = 1;
  while (await prisma.event.findUnique({ where: { slug } })) {
    slug = `${base}-${counter++}`;
  }
  return slug;
}

// Extract image URL from OpenAgenda image object
function getImageUrl(image: any): string | null {
  if (!image) return null;
  // Try full variant first
  const fullVariant = image.variants?.find((v: any) => v.type === "full");
  if (fullVariant?.filename) return `${CDN_URL}/${fullVariant.filename}`;
  // Fallback to base filename
  if (image.filename) return `${CDN_URL}/${image.filename}`;
  return null;
}

// Extract text from multilingual field
function getText(field: any): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field.fr || field.en || Object.values(field)[0] as string || "";
}

async function fetchPage(from: number, size: number) {
  const params = new URLSearchParams({ key: PUBLIC_KEY, size: String(size), from: String(from) });
  const res = await fetch(`${BASE_URL}/agendas/${AGENDA_UID}/events?${params}`);
  if (!res.ok) throw new Error(`OpenAgenda HTTP ${res.status}`);
  return res.json() as Promise<{ events: any[]; total: number }>;
}

async function main() {
  console.log("🔄 Import OpenAgenda → Le Nautilus");
  console.log(`📋 Agenda: ${AGENDA_UID} | Clé: ${PUBLIC_KEY.slice(0, 8)}...`);

  const venues = await prisma.venue.findMany();
  if (!venues.length) { console.error("❌ Aucune salle. Lance le seed d'abord."); process.exit(1); }
  const defaultVenue = venues[0]!;
  console.log(`🏛️  Salle par défaut: ${defaultVenue.name}`);

  // Fetch all pages
  const first = await fetchPage(0, 100);
  const total = first.total;
  console.log(`📊 ${total} événements sur OpenAgenda\n`);

  const allEvents: any[] = [...first.events];
  for (let from = 100; from < total; from += 100) {
    const page = await fetchPage(from, 100);
    allEvents.push(...page.events);
    process.stdout.write(`  ⬇️  Téléchargement: ${Math.min(from + 100, total)}/${total}\r`);
  }
  console.log(`\n✅ ${allEvents.length} événements téléchargés\n`);

  let imported = 0, skipped = 0, errors = 0;

  for (const oa of allEvents) {
    try {
      // Skip already imported
      const exists = await prisma.event.findFirst({ where: { openAgendaUid: oa.uid } });
      if (exists) { skipped++; continue; }

      // Extract dates from firstTiming / lastTiming
      const ft = oa.firstTiming || oa.nextTiming;
      const lt = oa.lastTiming || oa.nextTiming;
      if (!ft?.begin || !lt?.end) { skipped++; continue; }

      const startDate = new Date(ft.begin);
      const endDate = new Date(lt.end);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) { skipped++; continue; }

      const title = getText(oa.title) || "Événement";
      const rawDesc = getText(oa.description);
      const rawLongDesc = getText(oa.longDescription);
      const description = truncate(rawDesc || title, 200);
      const longDescription = rawLongDesc || null;

      // Image
      const coverImage = getImageUrl(oa.image);

      // Categories from keywords (can be object or string)
      let categories: string[] = [];
      if (oa.keywords) {
        const kwRaw = oa.keywords.fr || oa.keywords.en || Object.values(oa.keywords)[0] || "";
        if (typeof kwRaw === "string" && kwRaw) {
          categories = kwRaw.split(",").map((k: string) => k.trim()).filter(Boolean).slice(0, 5);
        }
      }

      // All events from public API are publicly visible
      const isPublic = true;

      const slug = await generateUniqueSlug(title);

      await prisma.event.create({
        data: {
          slug,
          title,
          description,
          longDescription,
          coverImage,
          startDate,
          endDate,
          venueId: defaultVenue.id,
          isPublic,
          status: "PUBLISHED",
          categories,
          keywords: [],
          conditions: getText(oa.conditions) || null,
          ageMin: oa.age?.min ?? null,
          ageMax: oa.age?.max ?? null,
          openAgendaUid: oa.uid,
          openAgendaSynced: true,
          openAgendaSyncedAt: new Date(),
          ticketTypes: {
            create: [{
              name: "Entrée",
              description: "Tarif unique",
              price: 0,
              quantity: 500,
              currency: "EUR",
            }],
          },
        },
      });

      imported++;
      if (imported % 10 === 0) process.stdout.write(`  ✅ ${imported} importés...\r`);
    } catch (err) {
      errors++;
      if (errors <= 5) console.error(`\n⚠️  UID ${oa.uid}:`, err instanceof Error ? err.message : err);
    }
  }

  console.log("\n");
  console.log("══════════════════════════════════");
  console.log(`✅ Importés  : ${imported}`);
  console.log(`⏭️  Ignorés   : ${skipped}`);
  console.log(`❌ Erreurs   : ${errors}`);
  console.log("══════════════════════════════════");

  const publicCount = await prisma.event.count({ where: { isPublic: true, status: "PUBLISHED" } });
  const upcoming = await prisma.event.count({ where: { isPublic: true, status: "PUBLISHED", startDate: { gte: new Date() } } });
  console.log(`\n🌐 Événements publics total  : ${publicCount}`);
  console.log(`📅 Événements à venir        : ${upcoming}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
