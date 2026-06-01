import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/client";
import { registerSchema } from "@/lib/validators/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as unknown;
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { email, name, password, role } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Un compte existe déjà avec cet email" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email, name, password: hashed, role },
      select: { id: true, email: true, name: true, role: true },
    });

    // Auto-create artist profile
    if (role === "ARTIST") {
      await prisma.artistProfile.create({
        data: {
          userId: user.id,
          stageName: name,
        },
      });
    }

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (err) {
    console.error("[REGISTER]", err);
    return NextResponse.json(
      { success: false, error: "Erreur interne" },
      { status: 500 }
    );
  }
}
