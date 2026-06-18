import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guards";
import { sendNewsletterCampaign } from "@/lib/mailchimp";

const schema = z.object({
  subject: z.string().min(3, "Sujet trop court"),
  html: z.string().min(10, "Contenu trop court"),
});

export async function POST(req: NextRequest) {
  await requireAdmin();

  try {
    const body = (await req.json()) as unknown;
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Champs invalides" },
        { status: 400 }
      );
    }

    const result = await sendNewsletterCampaign({
      subject: parsed.data.subject,
      html: parsed.data.html,
    });

    if (!result.ok) {
      const msg =
        result.reason === "not_configured"
          ? "Mailchimp n'est pas configuré (variables d'environnement manquantes)."
          : `Échec de l'envoi : ${result.reason}`;
      return NextResponse.json({ success: false, error: msg }, { status: 503 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
