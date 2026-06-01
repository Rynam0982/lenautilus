import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/client";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(2).max(140).optional(),
  description: z.string().min(10).max(200).optional(),
  longDescription: z.string().max(10000).optional(),
  coverImage: z.string().url().optional().nullable(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  venueId: z.string().cuid().optional(),
  categories: z.array(z.string()).max(5).optional(),
  conditions: z.string().max(255).optional().nullable(),
  ageMin: z.number().int().min(0).optional().nullable(),
  ageMax: z.number().int().min(0).optional().nullable(),
  isPublic: z.boolean().optional(),
  status: z.enum(["DRAFT", "PENDING_APPROVAL", "APPROVED", "PUBLISHED", "CANCELLED", "PAST"]).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  const { id } = await params;

  try {
    const body = await req.json() as unknown;
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...parsed.data,
        ...(parsed.data.startDate && { startDate: new Date(parsed.data.startDate) }),
        ...(parsed.data.endDate && { endDate: new Date(parsed.data.endDate) }),
      },
      include: { venue: true, ticketTypes: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "EVENT_UPDATED",
        eventId: event.id,
        metadata: { changes: Object.keys(parsed.data) },
      },
    });

    return NextResponse.json({ success: true, data: event });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  const { id } = await params;

  try {
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    // Cannot delete published events with tickets sold
    const ticketsSold = await prisma.ticket.count({ where: { eventId: id, status: { in: ["VALID", "USED"] } } });
    if (ticketsSold > 0) {
      return NextResponse.json(
        { success: false, error: `Impossible : ${ticketsSold} billet(s) vendu(s)` },
        { status: 400 }
      );
    }

    await prisma.event.delete({ where: { id } });
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "EVENT_CANCELLED",
        metadata: { deletedTitle: event.title },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
