import { prisma } from "@/lib/db/client";
import { openAgendaClient } from "@/lib/openagenda/client";
import { slugify } from "@/lib/utils";
import type { OpenAgendaEvent } from "@/types";

// ─── One-time import ──────────────────────────────────────────────────────────

export async function importAllFromOpenAgenda(): Promise<{
  imported: number;
  skipped: number;
  errors: number;
}> {
  const stats = { imported: 0, skipped: 0, errors: 0 };

  const oaEvents = await openAgendaClient.fetchAllEventsPaginated();
  const venues = await prisma.venue.findMany();
  const defaultVenue = venues[0];

  if (!defaultVenue) throw new Error("No venues exist. Create venues first.");

  for (const oaEvent of oaEvents) {
    try {
      const exists = await prisma.event.findFirst({
        where: { openAgendaUid: oaEvent.uid },
      });
      if (exists) {
        stats.skipped++;
        continue;
      }

      const title = oaEvent.title.fr ?? oaEvent.title.en ?? "Untitled";
      const slug = await generateUniqueSlug(title);

      await prisma.event.create({
        data: {
          slug,
          title,
          description: truncate(
            oaEvent.description?.fr ?? oaEvent.description?.en ?? "",
            200
          ),
          longDescription:
            oaEvent.longDescription?.fr ?? oaEvent.longDescription?.en ?? null,
          coverImage: oaEvent.image?.full ?? null,
          startDate: new Date(oaEvent.timings?.[0]?.begin ?? new Date()),
          endDate: new Date(oaEvent.timings?.at(-1)?.end ?? new Date()),
          venueId: defaultVenue.id,
          isPublic: oaEvent.state === 2,
          status: oaEvent.state === 2 ? "PUBLISHED" : "APPROVED",
          categories: oaEvent.categories ?? [],
          openAgendaUid: oaEvent.uid,
          openAgendaSynced: true,
          openAgendaSyncedAt: new Date(),
          ticketTypes: {
            create: [
              {
                name: "Entrée",
                price: 0,
                quantity: 100,
                currency: "EUR",
              },
            ],
          },
        },
      });

      await logSync(null, "IMPORT", true, { oaUid: oaEvent.uid, title });
      stats.imported++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await logSync(null, "IMPORT_ERROR", false, { oaUid: oaEvent.uid }, message);
      stats.errors++;
    }
  }

  return stats;
}

// ─── Publish event to OpenAgenda ──────────────────────────────────────────────

export async function publishEventToOpenAgenda(eventId: string): Promise<void> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { venue: true },
  });

  if (!event) throw new Error("Event not found");
  if (!event.isPublic) throw new Error("Cannot sync private events");

  const payload: Partial<OpenAgendaEvent> = {
    title: { fr: event.title },
    description: { fr: event.description },
    longDescription: event.longDescription
      ? { fr: event.longDescription }
      : undefined,
    timings: [
      {
        begin: event.startDate.toISOString(),
        end: event.endDate.toISOString(),
      },
    ],
    keywords: event.keywords.length
      ? { fr: event.keywords.join(", ") }
      : undefined,
    conditions: event.conditions ? { fr: event.conditions } : undefined,
    state: 2,
  };

  try {
    if (event.openAgendaUid) {
      await openAgendaClient.updateEvent(event.openAgendaUid, payload);
    } else {
      const oaEvent = await openAgendaClient.createEvent(payload);
      await prisma.event.update({
        where: { id: eventId },
        data: {
          openAgendaUid: oaEvent.uid,
          openAgendaSynced: true,
          openAgendaSyncedAt: new Date(),
        },
      });
    }

    await prisma.event.update({
      where: { id: eventId },
      data: { openAgendaSynced: true, openAgendaSyncedAt: new Date() },
    });

    await logSync(eventId, "PUBLISH", true, { title: event.title });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await logSync(eventId, "PUBLISH_ERROR", false, undefined, message);
    throw err;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function logSync(
  eventId: string | null,
  action: string,
  success: boolean,
  payload?: unknown,
  error?: string
) {
  await prisma.openAgendaSyncLog.create({
    data: {
      eventId,
      action,
      success,
      payload: payload ? JSON.parse(JSON.stringify(payload)) : undefined,
      error,
    },
  });
}

async function generateUniqueSlug(title: string): Promise<string> {
  const base = slugify(title);
  let slug = base;
  let counter = 1;
  while (await prisma.event.findUnique({ where: { slug } })) {
    slug = `${base}-${counter++}`;
  }
  return slug;
}

function truncate(str: string, max: number): string {
  return str.length <= max ? str : str.slice(0, max - 1) + "…";
}
