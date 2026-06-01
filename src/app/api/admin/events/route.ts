import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/client";
import { createEventSchema } from "@/lib/validators/event";
import { slugify } from "@/lib/utils";
import { publishEventToOpenAgenda } from "@/services/openagenda.service";

export async function POST(req: NextRequest) {
  const session = await requireAdmin();

  try {
    const body = await req.json() as unknown;
    const parsed = createEventSchema.safeParse(body);
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
        status: "DRAFT",
        isPublic: false,
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
        metadata: { title: event.title },
      },
    });

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
