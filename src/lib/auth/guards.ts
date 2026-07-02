import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { getDashboardRoute } from "@/lib/auth/route";
import type { Role } from "@prisma/client";
import type { Session } from "next-auth";

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

/* ─── Guards API ────────────────────────────────────────────────────────────────
   Les guards ci-dessus font un redirect() : parfait pour des pages, mais une
   route API doit répondre en JSON avec le bon code HTTP (401/403), pas rediriger
   vers une page de login HTML. */

type ApiGuard =
  | { session: Session; response: null }
  | { session: null; response: NextResponse };

function unauthorized(): NextResponse {
  return NextResponse.json(
    { success: false, error: "Authentification requise" },
    { status: 401 }
  );
}

function forbidden(): NextResponse {
  return NextResponse.json(
    { success: false, error: "Accès refusé" },
    { status: 403 }
  );
}

export async function requireAuthApi(): Promise<ApiGuard> {
  const session = await auth();
  if (!session?.user) return { session: null, response: unauthorized() };
  return { session, response: null };
}

export async function requireRoleApi(role: Role | Role[]): Promise<ApiGuard> {
  const session = await auth();
  if (!session?.user) return { session: null, response: unauthorized() };
  const roles = Array.isArray(role) ? role : [role];
  if (!roles.includes(session.user.role)) {
    return { session: null, response: forbidden() };
  }
  return { session, response: null };
}

export async function requireAdminApi(): Promise<ApiGuard> {
  return requireRoleApi("ADMIN");
}

export async function requireArtistApi(): Promise<ApiGuard> {
  return requireRoleApi(["ARTIST", "ADMIN"]);
}
