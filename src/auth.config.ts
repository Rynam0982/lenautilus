import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

/**
 * Edge-safe auth config — NO Prisma, NO Node.js-only modules.
 * Used by the proxy (middleware) to verify JWTs without a DB call.
 * The full auth config (with adapter + providers) lives in lib/auth/index.ts.
 */
export const authConfig = {
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: { strategy: "jwt" as const },
  providers: [], // providers are added in the full config
  callbacks: {
    jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.role = (user as { role?: Role }).role ?? "CLIENT";
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }: { session: any; token: any }) {
      if (token.sub) {
        session.user.id = token.sub;
        session.user.role = (token.role as Role) ?? "CLIENT";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
