export const dynamic = "force-dynamic";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/client";
import { safeQuery } from "@/lib/db/client";
import { ArtistRequestsList } from "@/components/admin/artist-requests-list";

export default async function AdminArtistsPage() {
  await requireAdmin();

  const requests = await safeQuery(
    () =>
      prisma.artistRequest.findMany({
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      }),
    [],
    "adminArtistRequests"
  );

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-nautilus-white">Demandes artistes</h1>
        <p className="mt-1 text-sm text-nautilus-gray">
          {pendingCount} demande{pendingCount !== 1 ? "s" : ""} en attente · création
          de compte + e-mail d&apos;activation.
        </p>
      </div>
      <ArtistRequestsList requests={requests} />
    </div>
  );
}
