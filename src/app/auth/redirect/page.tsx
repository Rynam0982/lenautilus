import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDashboardRoute } from "@/lib/auth/route";

interface PageProps {
  searchParams: Promise<{ to?: string }>;
}

/**
 * Server-side redirect after login.
 * Reads the fresh JWT session and routes to the correct dashboard.
 * This avoids any client-side timing issues with cookie hydration.
 */
export default async function AuthRedirectPage({ searchParams }: PageProps) {
  const session = await auth();
  const { to } = await searchParams;

  if (!session?.user) {
    redirect("/auth/login");
  }

  const role = session.user.role;

  // If a specific destination was requested (callbackUrl), validate and use it
  if (to) {
    const decoded = decodeURIComponent(to);
    // Only allow internal paths (no open redirect)
    if (decoded.startsWith("/") && !decoded.startsWith("//")) {
      redirect(decoded);
    }
  }

  redirect(getDashboardRoute(role));
}
