// Contenu de la section « Le projet » — repris et adapté de le-nautilus.org.

export type ProjetSection = {
  heading?: string;
  body?: string;
  items?: string[];
};

export type Prestation = {
  slug: string;
  title: string;
  subtitle: string;
  image: string;
  intro: string;
  sections: ProjetSection[];
  /** Marks the special "Chiffres clés" page (stats grid + photo gallery + video). */
  special?: "chiffres";
};

export const galleryPhotos: string[] = Array.from(
  { length: 29 },
  (_, i) => `/images/saisonfondatrice/photo-${String(i + 1).padStart(2, "0")}.jpg`
);

export const galleryVideo = "/images/saisonfondatrice/video.mp4";

export const chiffresStats = [
  { value: "358", label: "événements publics organisés" },
  { value: "12 273", label: "personnes accueillies" },
  { value: "65", label: "soirées gratuites" },
  { value: "185", label: "concerts" },
  { value: "38", label: "ateliers et formations" },
  { value: "22", label: "conférences" },
  { value: "90", label: "animations de quartier" },
  { value: "16", label: "spectacles" },
];

export const chiffresArtistes = [
  { value: "924", label: "artistes accueillis" },
  { value: "136", label: "groupes locaux" },
  { value: "69", label: "groupes internationaux" },
  { value: "32", label: "groupes nationaux" },
  { value: "18", label: "groupes d'Occitanie" },
  { value: "22", label: "résidences artistiques" },
];

export const prestations: Prestation[] = [
  {
    slug: "chiffres-cles-saison-2025",
    title: "Chiffres clés — Saison 2025",
    subtitle: "Une saison fondatrice",
    image: "/images/projet/chiffres-cles.png",
    intro:
      "2025 marque la première saison d'activité complète du Nautilus : une année structurante qui confirme la pertinence du projet et son ancrage territorial.",
    special: "chiffres",
    sections: [
      {
        body: "Avec 60 386 € de recettes de billetterie reversées au territoire, la saison 2025 traduit une dynamique forte : diffusion, création, médiation et structuration professionnelle s'articulent pleinement au sein d'un même lieu.",
      },
    ],
  },
  {
    slug: "aide-aux-artistes-locaux",
    title: "Aide aux artistes locaux en développement",
    subtitle: "Structurer les parcours artistiques",
    image: "/images/projet/artistes.png",
    intro:
      "Le Nautilus porte une attention particulière à la scène locale et accompagne les artistes émergents tout au long de leur parcours.",
    sections: [
      {
        heading: "Un accompagnement complet",
        items: [
          "Des conseils individualisés",
          "Des ateliers collectifs et des formations",
          "Des résidences artistiques",
          "Un accès à l'enregistrement audiovisuel",
          "Une aide à la structuration administrative et à la recherche de financements",
          "Une mise en relation avec les réseaux professionnels",
        ],
      },
      {
        body: "L'objectif : accompagner les artistes dans le développement de leur projet — identité artistique, stratégie de diffusion, promotion et viabilité économique. Cette démarche vise à renforcer l'autonomie des artistes et à favoriser leur inscription durable dans les circuits professionnels.",
      },
    ],
  },
  {
    slug: "accompagnement-des-organisateurs",
    title: "Accompagnement des organisateurs d'événements",
    subtitle: "Professionnaliser les porteurs de projets",
    image: "/images/projet/organisateurs.png",
    intro:
      "Le Nautilus accueille de nombreux organisateurs locaux et indépendants. Au-delà de la mise à disposition des espaces, le lieu propose un véritable accompagnement.",
    sections: [
      {
        heading: "Les services proposés",
        items: [
          "Un appui logistique et technique",
          "Des conseils sur la structuration budgétaire",
          "Un accompagnement à la gestion de la billetterie",
          "Une aide administrative",
          "Un conseil stratégique sur le positionnement artistique",
        ],
      },
      {
        body: "Cette approche permet aux organisateurs émergents de monter en compétence et de sécuriser leurs projets.",
      },
    ],
  },
  {
    slug: "sensibilisation-aux-metiers-de-la-musique",
    title: "Sensibilisation aux métiers de la musique",
    subtitle: "Transmettre et préparer les professionnels de demain",
    image: "/images/projet/sensibilisation.png",
    intro:
      "Le Nautilus développe des actions de sensibilisation et de transmission autour des métiers de la musique et du spectacle vivant.",
    sections: [
      {
        heading: "Sous quelles formes ?",
        items: [
          "Des ateliers découverte",
          "Des stages et des formations",
          "Des conférences thématiques",
          "Des projets pédagogiques avec restitution publique",
        ],
      },
      {
        heading: "Les thèmes abordés",
        items: [
          "L'organisation d'événements",
          "La production artistique",
          "Les métiers techniques (son, lumière, enregistrement)",
          "La communication et le développement de projet",
        ],
      },
      {
        body: "Ces actions favorisent l'insertion professionnelle, valorisent les parcours artistiques, sensibilisent les jeunes publics et renforcent l'écosystème culturel du territoire — dans une logique de transmission qui honore les traditions du spectacle vivant tout en outillant les futurs professionnels.",
      },
    ],
  },
  {
    slug: "aide-a-la-diffusion-des-musiques-actuelles",
    title: "Aide à la diffusion des musiques actuelles",
    subtitle: "Soutenir la circulation des œuvres et des artistes",
    image: "/images/projet/diffusion.png",
    intro:
      "Le Nautilus agit comme un maillon structurant dans la chaîne de diffusion des musiques actuelles.",
    sections: [
      {
        heading: "Ce que le lieu apporte",
        items: [
          "La mise à disposition d'un espace équipé techniquement",
          "Des conditions professionnelles adaptées aux artistes en développement",
          "Des programmes de coproduction",
          "L'enregistrement des prestations live pour soutenir la promotion",
          "Une mise en réseau avec des salles régionales, nationales et transfrontalières",
        ],
      },
      {
        body: "L'objectif : permettre aux artistes de se produire dans des conditions adaptées à leur niveau de développement, tout en renforçant leur visibilité et leur crédibilité. Plus qu'une simple programmation, la diffusion est pensée comme un levier stratégique de structuration de carrière.",
      },
    ],
  },
];

export function getPrestation(slug: string): Prestation | undefined {
  return prestations.find((p) => p.slug === slug);
}
