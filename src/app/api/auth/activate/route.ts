import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { rateLimitByIp } from "@/lib/rate-limit";

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(200),
});

export async function POST(req: NextRequest) {
  const limited = await rateLimitByIp("activate", 10, 10 * 60_000);
  if (limited) {
    return NextResponse.json({ success: false, error: limited.error }, { status: 429 });
  }

  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Données invalides" }, { status: 400 });
    }
    const { token, password } = parsed.data;

    const record = await prisma.passwordToken.findUnique({ where: { token } });
    if (!record || record.usedAt || record.expires < new Date()) {
      return NextResponse.json(
        { success: false, error: "Lien invalide ou expiré." },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { password: hashed, emailVerified: new Date() },
      }),
      prisma.passwordToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
