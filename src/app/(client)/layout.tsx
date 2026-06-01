import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { requireAuth } from "@/lib/auth/guards";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </>
  );
}
