import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { approveReservation } from "@/services/reservations.service";
import { publishEventToOpenAgenda } from "@/services/openagenda.service";
import { prisma } from "@/lib/db/client";
import {
  sendReservationApprovedToArtist,
  sendReservationSubmittedToAdmin,
} from "@/lib/email";
import { z } from "zod";

const schema = z.object({
  isPublic: z.boolean().default(false),
  adminNotes: z.string().max(500).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  const { id } = await params;

  try {
    const body = await req.json() as unknown;
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }

    await approveReservation(id, session.user.id, parsed.data);

    // Load full reservation for email
    const reservation = await prisma.venueReservation.findUnique({
      where: { id },
      include: {
        venue: true,
        artist: { include: { user: { select: { name: true, email: true } } } },
        event: true,
      },
    });

    // Sync to OpenAgenda if public
    if (parsed.data.isPublic && reservation?.event) {
      try {
        await publishEventToOpenAgenda(reservation.event.id);
      } catch (e) {
        console.error("[OA SYNC]", e);
      }
    }

    // Send approval email to artist
    if (reservation?.artist.user.email) {
      sendReservationApprovedToArtist({
        artistEmail: reservation.artist.user.email,
        artistName: reservation.artist.user.name ?? reservation.artist.stageName,
        eventTitle: reservation.event?.title ?? "Votre événement",
        venueName: reservation.venue.name,
        startDate: reservation.startDate,
        endDate: reservation.endDate,
        isPublic: parsed.data.isPublic,
        adminNotes: parsed.data.adminNotes,
      }).catch(console.error);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
