import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { refuseReservation } from "@/services/reservations.service";
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
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
