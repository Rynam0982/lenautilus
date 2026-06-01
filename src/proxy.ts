import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDashboardRoute } from "@/lib/auth/route";

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

  // Authenticated user hitting auth pages → send to their dashboard
  if (AUTH_ROUTES.test(pathname) && user) {
    const destination = getDashboardRoute(role);
    return NextResponse.redirect(new URL(destination, nextUrl));
  }

  // Admin routes: ADMIN only
  if (ADMIN_ROUTES.test(pathname)) {
    if (!user) {
      const url = new URL("/auth/login", nextUrl);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL(getDashboardRoute(role), nextUrl));
    }
  }

  // Artist routes: ARTIST or ADMIN
  if (ARTIST_ROUTES.test(pathname)) {
    if (!user) {
      const url = new URL("/auth/login", nextUrl);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (role !== "ARTIST" && role !== "ADMIN") {
      return NextResponse.redirect(new URL(getDashboardRoute(role), nextUrl));
    }
  }

  // Client routes: any authenticated user
  if (CLIENT_ROUTES.test(pathname)) {
    if (!user) {
      const url = new URL("/auth/login", nextUrl);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export default auth(proxy as Parameters<typeof auth>[0]);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|api/webhooks).*)",
  ],
};
