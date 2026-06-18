import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { subscribeToNewsletter } from "@/lib/mailchimp";

const schema = z.object({ email: z.string().email("Adresse e-mail invalide") });

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as unknown;
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "E-mail invalide" },
        { status: 400 }
      );
    }

    const result = await subscribeToNewsletter(parsed.data.email);
    if (!result.ok) {
      const msg =
        result.reason === "not_configured"
          ? "La newsletter n'est pas encore disponible."
          : "Impossible de vous inscrire pour le moment.";
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
