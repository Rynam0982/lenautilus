import { Navbar } from "@/components/layout/navbar";
import { requireArtist } from "@/lib/auth/guards";

export default async function ArtistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireArtist();
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
    </>
  );
}
