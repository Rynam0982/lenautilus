import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site Le Nautilus.",
};

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs uppercase tracking-[0.3em] text-nautilus-gold mb-4">
          Informations légales
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-nautilus-white mb-3">
          Mentions légales
        </h1>
        <p className="text-sm text-nautilus-gray mb-12">En vigueur au 8 décembre 2025</p>

        <div className="space-y-10 text-nautilus-gray-light leading-relaxed">
          <section>
            <h2 className="font-display text-2xl font-bold text-nautilus-white mb-3">
              Éditeur du site
            </h2>
            <p>
              Le présent site est édité par la société <strong>KALKOM</strong>,
              société à responsabilité limitée au capital de 70&nbsp;400&nbsp;€,
              immatriculée au Registre du Commerce et des Sociétés de Perpignan sous
              le numéro <strong>481&nbsp;808&nbsp;111</strong>.
            </p>
            <ul className="mt-4 space-y-1 text-sm">
              <li>Adresse : 20 rue Jules Verne, 66000 Perpignan</li>
              <li>Téléphone : 04&nbsp;68&nbsp;51&nbsp;37&nbsp;81</li>
              <li>Directeur de la publication : Jérôme Vilaceque</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-nautilus-white mb-3">
              Hébergement
            </h2>
            <p>
              Le site est hébergé par la société <strong>Infomaniak</strong>,
              dont les serveurs sont situés au 411 rue de Picardie,
              60170 Ribécourt-Dreslincourt.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-nautilus-white mb-3">
              Accès au site
            </h2>
            <p>
              L&apos;accès au site et son utilisation impliquent l&apos;acceptation
              pleine et entière des présentes mentions légales. L&apos;éditeur se
              réserve le droit de suspendre ou d&apos;interrompre l&apos;accès au
              site, notamment pour des opérations de maintenance ou de mise à jour,
              sans que sa responsabilité puisse être engagée.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-nautilus-white mb-3">
              Propriété intellectuelle
            </h2>
            <p>
              L&apos;ensemble des éléments composant le site (textes, images,
              graphismes, logo, vidéos) est protégé par le droit de la propriété
              intellectuelle. Toute utilisation, reproduction, diffusion,
              commercialisation ou modification de tout ou partie du site, sans
              autorisation expresse de l&apos;éditeur, est prohibée et susceptible de
              poursuites judiciaires.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-nautilus-white mb-3">
              Droit applicable
            </h2>
            <p>
              Les présentes mentions légales sont régies par le droit français,
              conformément à la loi n°&nbsp;2004-575 du 21 juin 2004 pour la confiance
              dans l&apos;économie numérique.
            </p>
          </section>

          <p className="text-sm text-nautilus-gray pt-4">
            © {new Date().getFullYear()} Le Nautilus. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}
