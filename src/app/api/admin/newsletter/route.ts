import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/client";
import { sendNewsletterCampaign } from "@/lib/brevo";
import { buildNewsletterHtml, type NewsletterEvent } from "@/lib/brevo/template";

const schema = z.object({
  subject: z.string().min(3, "Sujet trop court"),
  preheader: z.string().optional().default(""),
  intro: z.string().min(10, "Le message d'introduction est trop court"),
  eventIds: z.array(z.string()).optional().default([]),
  preview: z.boolean().optional().default(false),
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://lenautilus.vercel.app";

export async function POST(req: NextRequest) {
  const { response } = await requireAdminApi();
  if (response) return response;

  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Champs invalides" },
        { status: 400 }
      );
    }
    const { subject, preheader, intro, eventIds, preview } = parsed.data;

    // Fetch the selected events (keep the admin's order) for the template.
    const rows = eventIds.length
      ? await prisma.event.findMany({
          where: { id: { in: eventIds } },
          select: {
            id: true,
            slug: true,
            title: true,
            coverImage: true,
            startDate: true,
            venue: { select: { name: true } },
            ticketTypes: { select: { price: true } },
          },
        })
      : [];

    const byId = new Map(rows.map((r) => [r.id, r]));
    const events: NewsletterEvent[] = eventIds
      .map((id) => byId.get(id))
      .filter((r): r is NonNullable<typeof r> => Boolean(r))
      .map((r) => {
        const minPrice = r.ticketTypes.length
          ? Math.min(...r.ticketTypes.map((t) => t.price))
          : 0;
        return {
          slug: r.slug,
          title: r.title,
          coverImage: r.coverImage,
          startDate: r.startDate,
          venueName: r.venue.name,
          minPrice,
          isFree: minPrice === 0,
        };
      });

    const html = buildNewsletterHtml({ title: subject, preheader, intro, events, appUrl: APP_URL });

    if (preview) {
      return NextResponse.json({ success: true, html });
    }

    const result = await sendNewsletterCampaign({ subject, preheader, html });
    if (!result.ok) {
      const msg =
        result.reason === "not_configured"
          ? "Brevo n'est pas configuré (variables d'environnement manquantes)."
          : `Échec de l'envoi : ${result.reason}`;
      return NextResponse.json({ success: false, error: msg }, { status: 503 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
