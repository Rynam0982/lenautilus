import { config } from "dotenv";
config({ path: ".env.local", override: true });
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  const upcoming = await prisma.event.findMany({
    where: { startDate: { gte: now } },
    select: { title: true, startDate: true, status: true, isPublic: true, openAgendaUid: true },
    orderBy: { startDate: "asc" },
  });
  console.log("Événements à venir en base :", upcoming.length);
  for (const e of upcoming) {
    console.log(
      `${e.startDate.toISOString().slice(0, 10)} | ${e.status.padEnd(10)} | public=${e.isPublic} | OA=${e.openAgendaUid ?? "-"} | ${e.title.slice(0, 55)}`
    );
  }
  const visible = upcoming.filter((e) => e.isPublic && e.status === "PUBLISHED");
  console.log("Visibles sur le site (PUBLISHED + public) :", visible.length);
}

main().finally(() => prisma.$disconnect());
