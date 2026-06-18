import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ColorBands } from "@/components/layout/color-bands";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ColorBands />
      <Navbar />
      <main className="relative z-10 flex-1">{children}</main>
      <Footer />
    </>
  );
}
