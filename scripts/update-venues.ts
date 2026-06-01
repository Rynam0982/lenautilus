import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // High-quality Unsplash images for concert venues (free, no attribution required)
  const venueUpdates = [
    {
      slug: "la-grande-scene",
      coverImage: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80",
        "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80",
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
        "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&q=80",
      ],
    },
    {
      slug: "le-studio",
      coverImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
        "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80",
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
      ],
    },
    {
      slug: "le-rooftop",
      coverImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80",
      ],
    },
  ];

  for (const update of venueUpdates) {
    const result = await prisma.venue.updateMany({
      where: { slug: update.slug },
      data: {
        coverImage: update.coverImage,
        gallery: update.gallery,
      },
    });
    console.log(`✅ ${update.slug}: ${result.count > 0 ? "mise à jour" : "non trouvée"}`);
  }

  console.log("\n🎉 Photos des salles mises à jour !");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
