import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { refuseReservation } from "@/services/reservations.service";
import { prisma } from "@/lib/db/client";
import { sendReservationRefusedToArtist } from "@/lib/email";
import { z } from "zod";

const schema = z.object({ adminNotes: z.string().max(500).optional() });

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

    await refuseReservation(id, session.user.id, parsed.data.adminNotes);

    // Load reservation for email
    const reservation = await prisma.venueReservation.findUnique({
      where: { id },
      include: {
        venue: true,
        artist: { include: { user: { select: { name: true, email: true } } } },
        event: true,
      },
    });

    if (reservation?.artist.user.email) {
      sendReservationRefusedToArtist({
        artistEmail: reservation.artist.user.email,
        artistName: reservation.artist.user.name ?? reservation.artist.stageName,
        eventTitle: reservation.event?.title ?? "Votre événement",
        venueName: reservation.venue.name,
        startDate: reservation.startDate,
        adminNotes: parsed.data.adminNotes,
      }).catch(console.error);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
