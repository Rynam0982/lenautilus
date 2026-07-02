import { NextRequest, NextResponse } from "next/server";
import { requireArtistApi } from "@/lib/auth/guards";
import { createReservation, getArtistReservations } from "@/services/reservations.service";
import { reservationSchema } from "@/lib/validators/event";
import { prisma } from "@/lib/db/client";
import { sendReservationSubmittedToAdmin } from "@/lib/email";

export async function GET() {
  const { session, response } = await requireArtistApi();
  if (response) return response;
  try {
    const reservations = await getArtistReservations(session.user.id);
    return NextResponse.json({ success: true, data: reservations });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  const { session, response } = await requireArtistApi();
  if (response) return response;

  try {
    const body = await req.json() as unknown;
    const parsed = reservationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const reservation = await createReservation(parsed.data, session.user.id);

    // Notify all admins by email
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { email: true },
    });

    const artist = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    });

    for (const admin of admins) {
      if (admin.email) {
        sendReservationSubmittedToAdmin({
          adminEmail: admin.email,
          artistName: artist?.name ?? "Artiste",
          artistEmail: artist?.email ?? "",
          eventTitle: reservation.event?.title ?? parsed.data.eventDetails.title,
          venueName: reservation.venue.name,
          startDate: reservation.startDate,
          endDate: reservation.endDate,
          reservationId: reservation.id,
        }).catch(console.error);
      }
    }

    return NextResponse.json({ success: true, data: reservation }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    const isConflict = message.startsWith("CONFLICT");
    return NextResponse.json(
      { success: false, error: message },
      { status: isConflict ? 409 : 400 }
    );
  }
}
