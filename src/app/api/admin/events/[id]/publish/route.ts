import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/client";
import { publishEventToOpenAgenda } from "@/services/openagenda.service";
import { z } from "zod";

const schema = z.object({ isPublic: z.boolean() });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireAdminApi();
  if (response) return response;
  const { id } = await params;

  try {
    const body = await req.json() as unknown;
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid" }, { status: 400 });
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        status: "PUBLISHED",
        isPublic: parsed.data.isPublic,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "EVENT_PUBLISHED",
        eventId: id,
        metadata: { isPublic: parsed.data.isPublic },
      },
    });

    if (parsed.data.isPublic) {
      try {
        await publishEventToOpenAgenda(id);
      } catch (e) {
        console.error("[OA SYNC]", e);
      }
    }

    return NextResponse.json({ success: true, data: event });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
