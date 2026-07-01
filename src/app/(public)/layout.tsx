import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SiteEffects } from "@/components/layout/site-effects";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Film-grain overlay across the whole site */}
      <div aria-hidden className="grain-overlay" />
      <SiteEffects />
      <Navbar />
      <main className="relative z-10 flex-1">{children}</main>
      <Footer />
    </>
  );
}
