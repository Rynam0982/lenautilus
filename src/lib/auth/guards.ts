import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardRoute } from "@/lib/auth/route";
import type { Role } from "@prisma/client";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  return session;
}

export async function requireRole(role: Role | Role[]) {
  const session = await requireAuth();
  const roles = Array.isArray(role) ? role : [role];
  if (!roles.includes(session.user.role)) {
    // Send to their actual dashboard instead of "/"
    redirect(getDashboardRoute(session.user.role));
  }
  return session;
}

export async function requireAdmin() {
  return requireRole("ADMIN");
}

export async function requireArtist() {
  return requireRole(["ARTIST", "ADMIN"]);
}

export async function getOptionalUser() {
  const session = await auth();
  return session?.user ?? null;
}
