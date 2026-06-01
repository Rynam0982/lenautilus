import { config } from "dotenv";
config({ path: ".env.local" });
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const PUBLIC_KEY = process.env.OPENAGENDA_PUBLIC_KEY!;
const AGENDA_UID = process.env.OPENAGENDA_AGENDA_UID!;

function parsePrice(conditions: string): number | null {
  const text = conditions.toLowerCase().trim();
  const freePatterns = [
    "gratuit", "libre", "free", "entrée libre", "entrée gratuite",
    "accès libre", "pas de tarif", "sans réservation", "participation",
  ];
  if (freePatterns.some((p) => text.includes(p))) return 0;
  // Extract "X€" or "X €" — take the first/minimum price
  const match = text.match(/(\d+(?:[.,]\d+)?)\s*€/);
  if (match) {
    const amount = parseFloat(match[1]!.replace(",", "."));
    if (!isNaN(amount) && amount >= 0 && amount <= 500) return Math.round(amount * 100);
  }
  return null;
}

async function main() {
  console.log("💰 Import des prix OpenAgenda avec detailed=1...\n");

  const allOA: any[] = [];
  for (let from = 0; from < 500; from += 100) {
    const res = await fetch(
      `https://api.openagenda.com/v2/agendas/${AGENDA_UID}/events?key=${PUBLIC_KEY}&size=100&from=${from}&detailed=1`
    );
    const data = await res.json() as any;
    if (!data.events?.length) break;
    allOA.push(...data.events);
    process.stdout.write(`  ⬇️  ${allOA.length} events...\r`);
    if (data.events.length < 100) break;
  }
  console.log(`\n✅ ${allOA.length} events fetched avec conditions\n`);

  let updated = 0, free = 0, paid = 0;

  for (const oa of allOA) {
    const cond = oa.conditions?.fr || oa.conditions?.en || "";
    if (!cond.trim()) continue;

    const cents = parsePrice(cond);
    if (cents === null) continue;

    const event = await prisma.event.findFirst({
      where: { openAgendaUid: oa.uid },
      include: { ticketTypes: { take: 1 } },
    });
    if (!event?.ticketTypes[0]) continue;

    const tt = event.ticketTypes[0];
    if (tt.price === cents) continue;

    await prisma.ticketType.update({
      where: { id: tt.id },
      data: {
        price: cents,
        name: cents === 0 ? "Entrée libre" : "Entrée",
        description: cond,
      },
    });

    // Also save conditions on event
    await prisma.event.update({
      where: { id: event.id },
      data: { conditions: cond },
    });

    updated++;
    if (cents === 0) free++; else paid++;
  }

  console.log(`✨ ${updated} événement(s) mis à jour`);
  console.log(`   Gratuits: ${free} | Payants: ${paid}`);

  const paidSample = await prisma.ticketType.findMany({
    where: { price: { gt: 0 } },
    take: 5,
    include: { event: { select: { title: true } } },
  });
  if (paidSample.length > 0) {
    console.log("\nExemples d'événements payants:");
    paidSample.forEach((tt) =>
      console.log(`  - ${tt.event.title.slice(0, 50)} → ${tt.price / 100}€ (${tt.description})`)
    );
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
