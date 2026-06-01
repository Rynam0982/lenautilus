import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_ROUTES = /^\/admin(\/.*)?$/;
const ARTIST_ROUTES = /^\/artist(\/.*)?$/;
const CLIENT_ROUTES = /^\/dashboard(\/.*)?$/;
const AUTH_ROUTES = /^\/auth\/(login|register)$/;

type AuthRequest = NextRequest & {
  auth: { user?: { role?: string } } | null;
};

export function proxy(req: AuthRequest) {
  const { nextUrl } = req;
  const session = req.auth;
  const pathname = nextUrl.pathname;
  const user = session?.user;
  const role = user?.role;

  if (AUTH_ROUTES.test(pathname) && user) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }
  if (ADMIN_ROUTES.test(pathname)) {
    if (!user) return NextResponse.redirect(new URL("/auth/login", nextUrl));
    if (role !== "ADMIN") return NextResponse.redirect(new URL("/", nextUrl));
  }
  if (ARTIST_ROUTES.test(pathname)) {
    if (!user) return NextResponse.redirect(new URL("/auth/login", nextUrl));
    if (role !== "ARTIST" && role !== "ADMIN")
      return NextResponse.redirect(new URL("/", nextUrl));
  }
  if (CLIENT_ROUTES.test(pathname)) {
    if (!user) return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }
  return NextResponse.next();
}

// Auth.js wraps the proxy with session injection
export default auth(proxy as Parameters<typeof auth>[0]);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|api/webhooks).*)",
  ],
};
