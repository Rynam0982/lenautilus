import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { sendArtistRequestToAdmin } from "@/lib/email";

const schema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().email(),
  description: z.string().trim().min(20).max(2000),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Données invalides" },
        { status: 400 }
      );
    }
    const { firstName, lastName, email, description } = parsed.data;

    // Don't create a duplicate pending request for the same email.
    const existing = await prisma.artistRequest.findFirst({
      where: { email: email.toLowerCase(), status: "PENDING" },
    });
    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Une demande est déjà en cours pour cet e-mail.",
      });
    }

    await prisma.artistRequest.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        description,
      },
    });

    // Notify admins (best effort).
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { email: true },
    });
    await Promise.all(
      admins
        .filter((a) => a.email)
        .map((a) =>
          sendArtistRequestToAdmin({
            adminEmail: a.email!,
            firstName,
            lastName,
            email,
            description,
          })
        )
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
