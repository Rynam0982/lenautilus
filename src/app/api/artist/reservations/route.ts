import { NextRequest, NextResponse } from "next/server";
import { requireArtist } from "@/lib/auth/guards";
import { createReservation, getArtistReservations } from "@/services/reservations.service";
import { reservationSchema } from "@/lib/validators/event";

export async function GET() {
  const session = await requireArtist();
  try {
    const reservations = await getArtistReservations(session.user.id);
    return NextResponse.json({ success: true, data: reservations });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  const session = await requireArtist();

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
