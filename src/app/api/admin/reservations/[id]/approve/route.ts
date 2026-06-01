import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { approveReservation } from "@/services/reservations.service";
import { publishEventToOpenAgenda } from "@/services/openagenda.service";
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

    const results = await approveReservation(id, session.user.id, parsed.data);

    // If public, sync to OpenAgenda
    if (parsed.data.isPublic) {
      const reservation = results[0] as { id: string };
      const event = await import("@/lib/db/client").then(m =>
        m.prisma.venueReservation.findUnique({
          where: { id },
          include: { event: true },
        })
      );
      if (event?.event?.id) {
        try {
          await publishEventToOpenAgenda(event.event.id);
        } catch (e) {
          console.error("[OPENAGENDA SYNC]", e);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
