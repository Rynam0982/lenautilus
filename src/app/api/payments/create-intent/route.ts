import { NextRequest, NextResponse } from "next/server";
import { createPaymentIntent } from "@/services/tickets.service";
import { rateLimitByIp } from "@/lib/rate-limit";
import { z } from "zod";

const schema = z.object({
  ticketTypeId: z.string().cuid(),
  quantity: z.number().int().min(1).max(10),
  email: z.string().email(),
  name: z.string().trim().max(120).optional(),
});

export async function POST(req: NextRequest) {
  const limited = await rateLimitByIp("create-intent", 10, 10 * 60_000);
  if (limited) {
    return NextResponse.json({ success: false, error: limited.error }, { status: 429 });
  }

  try {
    const body = (await req.json()) as unknown;
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Données invalides" },
        { status: 400 }
      );
    }

    const result = await createPaymentIntent(
      parsed.data.ticketTypeId,
      parsed.data.quantity,
      { email: parsed.data.email, name: parsed.data.name }
    );

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
