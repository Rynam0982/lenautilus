import { prisma } from "@/lib/db/client";
import { checkVenueAvailability } from "@/services/venues.service";
import { slugify } from "@/lib/utils";
import type { ReservationInput } from "@/lib/validators/event";
import type { ReservationWithDetails } from "@/types";

export async function createReservation(
  input: ReservationInput,
  artistUserId: string
): Promise<ReservationWithDetails> {
  const artistProfile = await prisma.artistProfile.findUnique({
    where: { userId: artistUserId },
  });
  if (!artistProfile) throw new Error("Artist profile not found");

  const start = new Date(input.startDate);
  const end = new Date(input.endDate);

  if (end <= start) throw new Error("End must be after start");

  const available = await checkVenueAvailability(input.venueId, start, end);
  if (!available) throw new Error("CONFLICT: The salle is already booked");

  const slug = await generateUniqueSlug(input.eventDetails.title);

  const reservation = await prisma.venueReservation.create({
    data: {
      venueId: input.venueId,
      artistId: artistProfile.id,
      startDate: start,
      endDate: end,
      notes: input.notes,
      status: "PENDING",
      event: {
        create: {
          slug,
          title: input.eventDetails.title,
          description: input.eventDetails.description,
          longDescription: input.eventDetails.longDescription,
          coverImage: input.eventDetails.coverImage,
          categories: input.eventDetails.categories,
          startDate: start,
          endDate: end,
          venueId: input.venueId,
          status: "PENDING_APPROVAL",
          isPublic: false,
          ticketTypes: {
            create: [
              { name: "Entrée", price: 0, quantity: 100, currency: "EUR" },
            ],
          },
        },
      },
    },
    include: {
      venue: true,
      artist: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
      event: true,
    },
  });

  return reservation as ReservationWithDetails;
}

export async function getArtistReservations(
  artistUserId: string
): Promise<ReservationWithDetails[]> {
  const profile = await prisma.artistProfile.findUnique({
    where: { userId: artistUserId },
  });
  if (!profile) return [];

  const reservations = await prisma.venueReservation.findMany({
    where: { artistId: profile.id },
    include: {
      venue: true,
      artist: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
      event: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return reservations as ReservationWithDetails[];
}

export async function approveReservation(
  reservationId: string,
  adminId: string,
  options: { isPublic?: boolean; adminNotes?: string } = {}
) {
  const reservation = await prisma.venueReservation.findUnique({
    where: { id: reservationId },
    include: { event: true },
  });

  if (!reservation) throw new Error("Reservation not found");
  if (reservation.status !== "PENDING") throw new Error("Not pending");

  return prisma.$transaction([
    prisma.venueReservation.update({
      where: { id: reservationId },
      data: {
        status: "APPROVED",
        adminNotes: options.adminNotes,
      },
    }),
    ...(reservation.event
      ? [
          prisma.event.update({
            where: { id: reservation.event.id },
            data: {
              status: "APPROVED",
              isPublic: options.isPublic ?? false,
            },
          }),
        ]
      : []),
    prisma.auditLog.create({
      data: {
        userId: adminId,
        action: "RESERVATION_APPROVED",
        eventId: reservation.event?.id,
        metadata: { reservationId, options },
      },
    }),
  ]);
}

export async function refuseReservation(
  reservationId: string,
  adminId: string,
  adminNotes?: string
) {
  const reservation = await prisma.venueReservation.findUnique({
    where: { id: reservationId },
    include: { event: true },
  });

  if (!reservation) throw new Error("Reservation not found");

  return prisma.$transaction([
    prisma.venueReservation.update({
      where: { id: reservationId },
      data: { status: "REFUSED", adminNotes },
    }),
    ...(reservation.event
      ? [
          prisma.event.update({
            where: { id: reservation.event.id },
            data: { status: "CANCELLED" },
          }),
        ]
      : []),
    prisma.auditLog.create({
      data: {
        userId: adminId,
        action: "RESERVATION_REFUSED",
        eventId: reservation.event?.id,
        metadata: { reservationId, adminNotes },
      },
    }),
  ]);
}

export async function getAllReservationsAdmin(): Promise<ReservationWithDetails[]> {
  const reservations = await prisma.venueReservation.findMany({
    include: {
      venue: true,
      artist: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
      event: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return reservations as ReservationWithDetails[];
}

async function generateUniqueSlug(title: string): Promise<string> {
  const base = slugify(title);
  let slug = base;
  let counter = 1;
  while (await prisma.event.findUnique({ where: { slug } })) {
    slug = `${base}-${counter++}`;
  }
  return slug;
}
