import type { Role } from "@prisma/client";

/**
 * Centralise la logique de routage post-authentification.
 * Unique source de vérité pour les destinations par rôle.
 */
export function getDashboardRoute(role?: Role | string | null): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "ARTIST":
      return "/artist/dashboard";
    case "CLIENT":
    default:
      return "/dashboard";
  }
}
