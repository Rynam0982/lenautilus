import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/client";
import { createEventSchema } from "@/lib/validators/event";
import { slugify } from "@/lib/utils";
import { publishEventToOpenAgenda } from "@/services/openagenda.service";
import { z } from "zod";

const adminCreateSchema = createEventSchema.extend({
  isPublic: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  const { session, response } = await requireAdminApi();
  if (response) return response;

  try {
    const body = await req.json() as unknown;
    const parsed = adminCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const base = slugify(data.title);
    let slug = base;
    let counter = 1;
    while (await prisma.event.findUnique({ where: { slug } })) {
      slug = `${base}-${counter++}`;
    }

    const status = data.isPublic ? "PUBLISHED" : "DRAFT";

    const event = await prisma.event.create({
      data: {
        slug,
        title: data.title,
        description: data.description,
        longDescription: data.longDescription,
        coverImage: data.coverImage,
        gallery: data.gallery ?? [],
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        venueId: data.venueId,
        categories: data.categories ?? [],
        keywords: data.keywords ?? [],
        conditions: data.conditions,
        ageMin: data.ageMin,
        ageMax: data.ageMax,
        status,
        isPublic: data.isPublic,
        ticketTypes: {
          create: (data.ticketTypes ?? []).map((tt) => ({
            name: tt.name,
            description: tt.description,
            price: tt.price,
            quantity: tt.quantity,
            currency: "EUR",
            saleStartAt: tt.saleStartAt ? new Date(tt.saleStartAt) : null,
            saleEndAt: tt.saleEndAt ? new Date(tt.saleEndAt) : null,
          })),
        },
      },
      include: { venue: true, ticketTypes: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "EVENT_CREATED",
        eventId: event.id,
        metadata: { title: event.title, isPublic: data.isPublic },
      },
    });

    // Sync to OpenAgenda if public
    if (data.isPublic) {
      try {
        await publishEventToOpenAgenda(event.id);
      } catch (e) {
        console.error("[OA SYNC on create]", e);
      }
    }

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
