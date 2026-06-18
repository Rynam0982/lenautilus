import { prisma, safeQuery } from "@/lib/db/client";
import type { VenueWithEvents } from "@/types";

export async function getAllVenues() {
  return safeQuery(
    () =>
      prisma.venue.findMany({
        orderBy: { name: "asc" },
        include: {
          _count: { select: { events: true, reservations: true } },
        },
      }),
    [],
    "getAllVenues"
  );
}

export async function getVenueBySlug(
  slug: string
): Promise<VenueWithEvents | null> {
  return safeQuery(() => getVenueBySlugRaw(slug), null, "getVenueBySlug");
}

async function getVenueBySlugRaw(
  slug: string
): Promise<VenueWithEvents | null> {
  const venue = await prisma.venue.findUnique({
    where: { slug },
    include: {
      events: {
        where: { isPublic: true, status: "PUBLISHED", startDate: { gte: new Date() } },
        orderBy: { startDate: "asc" },
        take: 10,
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          coverImage: true,
          startDate: true,
          endDate: true,
          categories: true,
          isPublic: true,
          status: true,
          venue: { select: { id: true, name: true, slug: true } },
          ticketTypes: {
            select: {
              id: true,
              price: true,
              currency: true,
              quantity: true,
              sold: true,
            },
          },
        },
      },
      _count: { select: { events: true } },
    },
  });
  return venue as VenueWithEvents | null;
}

export async function checkVenueAvailability(
  venueId: string,
  startDate: Date,
  endDate: Date,
  excludeReservationId?: string
): Promise<boolean> {
  const conflict = await prisma.venueReservation.findFirst({
    where: {
      venueId,
      id: excludeReservationId ? { not: excludeReservationId } : undefined,
      status: { in: ["PENDING", "APPROVED"] },
      OR: [
        { startDate: { lte: endDate }, endDate: { gte: startDate } },
      ],
    },
  });
  return conflict === null;
}
