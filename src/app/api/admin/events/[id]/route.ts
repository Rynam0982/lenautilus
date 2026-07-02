import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/client";
import { z } from "zod";
import { publishEventToOpenAgenda } from "@/services/openagenda.service";

const ticketTypeUpdateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  price: z.number().int().min(0),
  quantity: z.number().int().min(1).max(10000),
});

const updateSchema = z.object({
  title: z.string().min(2).max(140).optional(),
  description: z.string().min(10).max(200).optional(),
  longDescription: z.string().max(10000).optional().nullable(),
  coverImage: z.string().url().optional().nullable().or(z.literal("")),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  venueId: z.string().cuid().optional(),
  categories: z.array(z.string()).max(5).optional(),
  conditions: z.string().max(255).optional().nullable(),
  ageMin: z.number().int().min(0).optional().nullable(),
  ageMax: z.number().int().min(0).optional().nullable(),
  isPublic: z.boolean().optional(),
  status: z.enum(["DRAFT", "PENDING_APPROVAL", "APPROVED", "PUBLISHED", "CANCELLED", "PAST"]).optional(),
  ticketTypes: z.array(ticketTypeUpdateSchema).min(1).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireAdminApi();
  if (response) return response;
  const { id } = await params;

  try {
    const body = await req.json() as unknown;
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const { ticketTypes, coverImage, ...rest } = parsed.data;

    // Fetch current event to detect isPublic transition
    const current = await prisma.event.findUnique({ where: { id }, select: { isPublic: true } });
    const wasPublic = current?.isPublic ?? false;
    const goingPublic = rest.isPublic === true && !wasPublic;

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...rest,
        coverImage: coverImage === "" ? null : coverImage,
        ...(rest.startDate && { startDate: new Date(rest.startDate) }),
        ...(rest.endDate && { endDate: new Date(rest.endDate) }),
        // If going public, bump status to PUBLISHED
        ...(goingPublic && { status: "PUBLISHED" }),
        // Update ticket types if provided: delete existing (unsold) and recreate
        ...(ticketTypes && {
          ticketTypes: {
            deleteMany: { sold: 0 },
            create: ticketTypes.map((tt) => ({
              name: tt.name,
              description: tt.description,
              price: tt.price,
              quantity: tt.quantity,
              currency: "EUR",
            })),
          },
        }),
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

    // Sync to OpenAgenda when event becomes public or was already public and updated
    if (goingPublic || (wasPublic && rest.isPublic !== false)) {
      try {
        await publishEventToOpenAgenda(id);
      } catch (e) {
        console.error("[OA SYNC on update]", e);
      }
    }

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
  const { session, response } = await requireAdminApi();
  if (response) return response;
  const { id } = await params;

  try {
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

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
