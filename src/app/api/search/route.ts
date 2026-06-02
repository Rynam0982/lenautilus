import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const events = await prisma.event.findMany({
    where: {
      isPublic: true,
      status: "PUBLISHED",
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    },
    take: 6,
    orderBy: { startDate: "asc" },
    select: {
      slug: true,
      title: true,
      coverImage: true,
      startDate: true,
      categories: true,
      venue: { select: { name: true } },
    },
  });

  return NextResponse.json({ results: events });
}
