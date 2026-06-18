import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Runs a read query, returning `fallback` instead of throwing when the database
 * is temporarily unreachable (e.g. a suspended serverless DB). Keeps public
 * pages rendering an empty state rather than crashing with a 500.
 */
export async function safeQuery<T>(
  fn: () => Promise<T>,
  fallback: T,
  label: string
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[DB] ${label} failed:`, err instanceof Error ? err.message : err);
    return fallback;
  }
}
