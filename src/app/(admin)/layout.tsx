import { requireAdmin } from "@/lib/auth/guards";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen bg-nautilus-black">
      <AdminSidebar />
      <main className="flex-1 ml-64 min-h-screen">{children}</main>
    </div>
  );
}
