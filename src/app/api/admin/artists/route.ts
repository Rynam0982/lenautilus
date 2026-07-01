import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { sendArtistActivation } from "@/lib/email";

const schema = z.object({
  requestId: z.string().cuid(),
  action: z.enum(["create", "refuse"]),
  adminNotes: z.string().max(2000).optional(),
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 403 });
  }

  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Données invalides" }, { status: 400 });
    }
    const { requestId, action, adminNotes } = parsed.data;

    const request = await prisma.artistRequest.findUnique({ where: { id: requestId } });
    if (!request) {
      return NextResponse.json({ success: false, error: "Demande introuvable" }, { status: 404 });
    }

    if (action === "refuse") {
      await prisma.artistRequest.update({
        where: { id: requestId },
        data: { status: "REFUSED", adminNotes },
      });
      return NextResponse.json({ success: true });
    }

    // action === "create"
    const email = request.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Un compte existe déjà avec cet e-mail." },
        { status: 409 }
      );
    }

    const fullName = `${request.firstName} ${request.lastName}`.trim();
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const user = await prisma.user.create({
      data: {
        email,
        name: fullName,
        role: "ARTIST",
        artistProfile: {
          create: { stageName: fullName, bio: request.description },
        },
        passwordTokens: {
          create: { token, purpose: "activation", expires },
        },
      },
    });

    await prisma.artistRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED", createdUserId: user.id, adminNotes },
    });

    await sendArtistActivation({
      to: email,
      name: request.firstName,
      activationUrl: `${APP_URL}/auth/activate?token=${token}`,
    });

    return NextResponse.json({ success: true, activationUrl: `${APP_URL}/auth/activate?token=${token}` });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
