export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { prisma } from "@/lib/db/client";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin — Utilisateurs" };

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      artistProfile: { select: { stageName: true, verified: true } },
      _count: { select: { tickets: true } },
    },
  });

  const roleConfig: Record<string, { label: string; variant: "default" | "success" | "secondary" }> = {
    ADMIN: { label: "Admin", variant: "default" },
    ARTIST: { label: "Artiste", variant: "success" },
    CLIENT: { label: "Client", variant: "secondary" },
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-nautilus-white mb-1">
          Utilisateurs
        </h1>
        <p className="text-nautilus-gray text-sm">{users.length} inscrits</p>
      </div>

      <div className="rounded-2xl border border-nautilus-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-nautilus-border bg-nautilus-dark">
              <th className="text-left px-6 py-3 text-xs uppercase tracking-wider text-nautilus-gray font-medium">
                Utilisateur
              </th>
              <th className="text-left px-6 py-3 text-xs uppercase tracking-wider text-nautilus-gray font-medium hidden md:table-cell">
                Rôle
              </th>
              <th className="text-left px-6 py-3 text-xs uppercase tracking-wider text-nautilus-gray font-medium hidden lg:table-cell">
                Billets
              </th>
              <th className="text-left px-6 py-3 text-xs uppercase tracking-wider text-nautilus-gray font-medium hidden lg:table-cell">
                Inscrit le
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nautilus-border">
            {users.map((user) => {
              const rc = roleConfig[user.role] ?? { label: user.role, variant: "secondary" as const };
              return (
                <tr key={user.id} className="hover:bg-nautilus-dark/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={user.name} image={user.image} className="h-9 w-9" />
                      <div>
                        <p className="text-sm font-medium text-nautilus-white">
                          {user.name ?? "Sans nom"}
                          {user.artistProfile?.stageName && (
                            <span className="text-nautilus-gold ml-1.5 text-xs">
                              ({user.artistProfile.stageName})
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-nautilus-gray">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <Badge variant={rc.variant}>{rc.label}</Badge>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="text-sm text-nautilus-gray">{user._count.tickets}</span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="text-sm text-nautilus-gray">
                      {formatDate(user.createdAt)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
