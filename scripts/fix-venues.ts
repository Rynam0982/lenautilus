import { config } from "dotenv";
config({ path: ".env.local" });
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🏛️  Mise à jour des salles du Nautilus...\n");

  // Delete the fake 3rd venue (Le Rooftop) — only 2 real salles
  const rooftopDeleted = await prisma.venue.deleteMany({
    where: { slug: "le-rooftop" },
  });
  if (rooftopDeleted.count > 0) console.log("🗑️  Le Rooftop supprimé");

  // Salle 1 — Repas convivial
  await prisma.venue.upsert({
    where: { slug: "repas-convivial" },
    update: {
      name: "Repas convivial ou soirée dinatoire",
      description:
        "Calme et intimiste, parfaite pour des repas assis. Un espace chaleureux avec poutres apparentes, lumineux et convivial, idéal pour vos événements de table.",
      capacity: 100,
      amenities: [
        "Cuisine équipée",
        "Four",
        "Crêpière",
        "Friteuse",
        "Plaque induction",
        "Plonge",
        "Écran géant",
        "Sonorisation",
        "Micros",
        "Tables et chaises",
        "Couverts et verres",
        "Bar et frigos",
        "Tireuse à bière",
        "Piano droit",
        "WC",
      ],
      coverImage: "/images/salles/repas.jpeg",
      gallery: ["/images/salles/repas.jpeg"],
      specs: {
        "Capacité assise": "80 personnes",
        "Capacité debout": "100 personnes",
        "Cuisine": "Équipée (four, crêpière, friteuse, plaque induction)",
        "Écran": "Géant",
        "Sonorisation": "Professionnelle",
        "Piano": "Droit",
      },
    },
    create: {
      slug: "repas-convivial",
      name: "Repas convivial ou soirée dinatoire",
      description:
        "Calme et intimiste, parfaite pour des repas assis. Un espace chaleureux avec poutres apparentes, lumineux et convivial, idéal pour vos événements de table.",
      capacity: 100,
      amenities: [
        "Cuisine équipée",
        "Four",
        "Crêpière",
        "Friteuse",
        "Plaque induction",
        "Plonge",
        "Écran géant",
        "Sonorisation",
        "Micros",
        "Tables et chaises",
        "Couverts et verres",
        "Bar et frigos",
        "Tireuse à bière",
        "Piano droit",
        "WC",
      ],
      coverImage: "/images/salles/repas.jpeg",
      gallery: ["/images/salles/repas.jpeg"],
      specs: {
        "Capacité assise": "80 personnes",
        "Capacité debout": "100 personnes",
        "Cuisine": "Équipée (four, crêpière, friteuse, plaque induction)",
        "Écran": "Géant",
        "Sonorisation": "Professionnelle",
        "Piano": "Droit",
      },
    },
  });
  console.log("✅ Salle 1 — Repas convivial");

  // Salle 2 — Soirée festive
  await prisma.venue.upsert({
    where: { slug: "soiree-festive" },
    update: {
      name: "Soirée festive ou événement musical",
      description:
        "Idéale pour soirées musicales, fêtes, cocktails, anniversaires, afterworks. Un espace scène professionnelle avec ambiance lumières, parfait pour concerts et spectacles.",
      capacity: 150,
      amenities: [
        "Scène modulable",
        "Vidéoprojecteur",
        "Sonorisation professionnelle",
        "Micros",
        "Table de mixage",
        "Clavier",
        "Batterie",
        "Tables et chaises",
        "Couverts et verres",
        "Bar et frigos",
        "Tireuse à bière",
        "WC",
        "WC PMR",
      ],
      coverImage: "/images/salles/soiree.jpeg",
      gallery: ["/images/salles/soiree.jpeg"],
      specs: {
        "Capacité assise": "80 personnes",
        "Capacité debout": "150 personnes",
        "Scène": "Modulable",
        "Mixage": "Table de mixage professionnelle",
        "Instruments": "Clavier, batterie",
        "Accessibilité": "WC PMR",
      },
    },
    create: {
      slug: "soiree-festive",
      name: "Soirée festive ou événement musical",
      description:
        "Idéale pour soirées musicales, fêtes, cocktails, anniversaires, afterworks. Un espace scène professionnelle avec ambiance lumières, parfait pour concerts et spectacles.",
      capacity: 150,
      amenities: [
        "Scène modulable",
        "Vidéoprojecteur",
        "Sonorisation professionnelle",
        "Micros",
        "Table de mixage",
        "Clavier",
        "Batterie",
        "Tables et chaises",
        "Couverts et verres",
        "Bar et frigos",
        "Tireuse à bière",
        "WC",
        "WC PMR",
      ],
      coverImage: "/images/salles/soiree.jpeg",
      gallery: ["/images/salles/soiree.jpeg"],
      specs: {
        "Capacité assise": "80 personnes",
        "Capacité debout": "150 personnes",
        "Scène": "Modulable",
        "Mixage": "Table de mixage professionnelle",
        "Instruments": "Clavier, batterie",
        "Accessibilité": "WC PMR",
      },
    },
  });
  console.log("✅ Salle 2 — Soirée festive");

  // Reassign events from old venues to soiree-festive FIRST, then delete old venues
  const soireeFestive = await prisma.venue.findFirst({ where: { slug: "soiree-festive" } });
  if (soireeFestive) {
    const oldVenues = await prisma.venue.findMany({
      where: { slug: { in: ["la-grande-scene", "le-studio"] } },
      select: { id: true },
    });
    const oldIds = oldVenues.map((v) => v.id);
    if (oldIds.length > 0) {
      const updated = await prisma.event.updateMany({
        where: { venueId: { in: oldIds } },
        data: { venueId: soireeFestive.id },
      });
      console.log(`🔄 ${updated.count} événements réassignés`);
      // Also reassign reservations
      await prisma.venueReservation.updateMany({
        where: { venueId: { in: oldIds } },
        data: { venueId: soireeFestive.id },
      });
    }
  }

  // Now safe to delete old venues
  const deleted = await prisma.venue.deleteMany({
    where: { slug: { in: ["la-grande-scene", "le-studio"] } },
  });
  if (deleted.count > 0) console.log(`🗑️  ${deleted.count} ancienne(s) salle(s) supprimée(s)`);

  const venues = await prisma.venue.findMany({ select: { name: true, slug: true, capacity: true } });
  console.log("\n✨ Salles finales:");
  venues.forEach((v) => console.log(`  - ${v.name} (${v.slug}) — ${v.capacity} pers.`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
