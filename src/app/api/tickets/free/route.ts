import { NextRequest, NextResponse } from "next/server";
import { createFreeTickets } from "@/services/tickets.service";
import { z } from "zod";

const schema = z.object({
  ticketTypeId: z.string().cuid(),
  quantity: z.number().int().min(1).max(10),
  email: z.string().email(),
  name: z.string().trim().max(120).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as unknown;
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Données invalides" },
        { status: 400 }
      );
    }

    const tickets = await createFreeTickets(
      parsed.data.ticketTypeId,
      parsed.data.quantity,
      { email: parsed.data.email, name: parsed.data.name }
    );

    return NextResponse.json({ success: true, count: tickets.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
