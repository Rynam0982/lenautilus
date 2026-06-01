import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createPaymentIntent } from "@/services/tickets.service";
import { z } from "zod";

const schema = z.object({
  ticketTypeId: z.string().cuid(),
  quantity: z.number().int().min(1).max(10),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
  }

  try {
    const body = await req.json() as unknown;
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }

    const result = await createPaymentIntent(
      parsed.data.ticketTypeId,
      parsed.data.quantity,
      session.user.id
    );

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
