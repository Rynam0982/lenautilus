import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDashboardRoute } from "@/lib/auth/route";

const ADMIN_ROUTES = /^\/admin(\/.*)?$/;
const ARTIST_ROUTES = /^\/artist(\/.*)?$/;
const CLIENT_ROUTES = /^\/dashboard(\/.*)?$/;
const AUTH_ROUTES = /^\/auth\/login$/;

// Edge-safe auth — only JWT verification, no Prisma, no Node.js adapter
const { auth } = NextAuth(authConfig);

export default auth((req) => {
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
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|api/webhooks).*)",
  ],
};
