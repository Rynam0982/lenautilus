import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Admin user
  const adminPassword = await bcrypt.hash("admin123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@lenautilus.fr" },
    update: {},
    create: {
      email: "admin@lenautilus.fr",
      name: "Administrateur",
      password: adminPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });
  console.log("✅ Admin user:", admin.email);

  // Demo artist
  const artistPassword = await bcrypt.hash("artist123!", 12);
  const artist = await prisma.user.upsert({
    where: { email: "artist@lenautilus.fr" },
    update: {},
    create: {
      email: "artist@lenautilus.fr",
      name: "DJ Demo",
      password: artistPassword,
      role: "ARTIST",
      emailVerified: new Date(),
      artistProfile: {
        create: {
          stageName: "DJ Demo",
          bio: "Artiste de démonstration pour la plateforme Le Nautilus.",
          genre: "Electronic",
          verified: true,
        },
      },
    },
  });
  console.log("✅ Artist user:", artist.email);

  // Demo client
  const clientPassword = await bcrypt.hash("client123!", 12);
  const client = await prisma.user.upsert({
    where: { email: "client@lenautilus.fr" },
    update: {},
    create: {
      email: "client@lenautilus.fr",
      name: "Jean Dupont",
      password: clientPassword,
      role: "CLIENT",
      emailVerified: new Date(),
    },
  });
  console.log("✅ Client user:", client.email);

  // Venues (3 salles)
  const venues = await Promise.all([
    prisma.venue.upsert({
      where: { slug: "la-grande-scene" },
      update: {},
      create: {
        slug: "la-grande-scene",
        name: "La Grande Scène",
        description:
          "Notre salle principale, idéale pour les grands concerts et événements de prestige. Équipée d'un système son et lumière professionnel, elle offre une expérience immersive incomparable.",
        capacity: 800,
        amenities: ["Son surround", "Éclairage LED", "Backstage", "Bar", "Vestiaire", "Accessibilité PMR"],
        specs: {
          "Superficie": "600 m²",
          "Scène": "12 × 8 m",
          "Plafond": "7 m",
          "Puissance son": "40 kW",
          "Console": "SSL 9000",
        },
        pricing: {
          halfDay: 2000,
          fullDay: 3500,
          weekend: 5500,
        },
        gallery: [],
      },
    }),
    prisma.venue.upsert({
      where: { slug: "le-studio" },
      update: {},
      create: {
        slug: "le-studio",
        name: "Le Studio",
        description:
          "Espace intime pour les concerts acoustiques, showcases et événements privés. Une atmosphère chaleureuse et authentique pour des soirées mémorables.",
        capacity: 150,
        amenities: ["Acoustique traité", "Bar", "Lounge", "Équipement DJ", "Projecteur"],
        specs: {
          "Superficie": "120 m²",
          "Scène": "4 × 3 m",
          "Capacité debout": "150 pers.",
          "Capacité assise": "80 pers.",
        },
        pricing: {
          halfDay: 600,
          fullDay: 1000,
          weekend: 1800,
        },
        gallery: [],
      },
    }),
    prisma.venue.upsert({
      where: { slug: "le-rooftop" },
      update: {},
      create: {
        slug: "le-rooftop",
        name: "Le Rooftop",
        description:
          "Notre espace en plein air avec vue panoramique sur la ville. Parfait pour les événements estivaux, soirées cocktail et concerts sous les étoiles.",
        capacity: 300,
        amenities: ["Plein air", "Bar panoramique", "Système son outdoor", "Tente modulable"],
        specs: {
          "Superficie": "250 m²",
          "Vue": "Panoramique",
          "Saison": "Printemps - Automne",
          "Option tente": "Disponible",
        },
        pricing: {
          halfDay: 1000,
          fullDay: 1800,
          weekend: 3000,
        },
        gallery: [],
      },
    }),
  ]);
  console.log(`✅ ${venues.length} venues created`);

  console.log("✨ Seed complete!");
  console.log("");
  console.log("Comptes de test :");
  console.log("  Admin    : admin@lenautilus.fr / admin123!");
  console.log("  Artiste  : artist@lenautilus.fr / artist123!");
  console.log("  Client   : client@lenautilus.fr / client123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
