import { NextRequest, NextResponse } from "next/server";
import { requireAuthApi } from "@/lib/auth/guards";
import { requestRefund } from "@/services/tickets.service";
import { refundTicketSchema } from "@/lib/validators/booking";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireAuthApi();
  if (response) return response;
  const { id } = await params;

  try {
    const body = await req.json() as unknown;
    const parsed = refundTicketSchema.safeParse({ ...body as object, ticketId: id });
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }

    await requestRefund(id, session.user.id, parsed.data.reason);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
