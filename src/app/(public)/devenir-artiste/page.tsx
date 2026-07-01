import type { Metadata } from "next";
import { ArtistRequestForm } from "@/components/auth/artist-request-form";

export const metadata: Metadata = {
  title: "Devenir artiste",
  description:
    "Demandez la création d'un compte artiste au Nautilus pour proposer vos dates et réserver nos salles.",
};

export default function DevenirArtistePage() {
  return (
    <div className="min-h-screen px-7 pb-24 pt-[150px]">
      <div className="mx-auto max-w-[760px]">
        <p className="kicker m-0 mb-[14px]">Artistes & organisateurs</p>
        <h1 className="display m-0 text-[clamp(48px,9vw,120px)]">
          Devenir<span className="text-nautilus-gold">.</span>
          <br />
          artiste
        </h1>
        <p className="m-0 mb-10 mt-6 max-w-[58ch] text-[clamp(16px,1.4vw,19px)] leading-[1.55] text-nautilus-cream text-pretty">
          Le Nautilus accompagne les artistes et organisateurs locaux. Envoyez-nous
          votre demande : un administrateur étudie chaque dossier, crée votre compte
          et vous transmet un lien d&apos;activation par e-mail. Vous pourrez ensuite
          proposer vos dates et réserver nos salles.
        </p>
        <ArtistRequestForm />
      </div>
    </div>
  );
}
