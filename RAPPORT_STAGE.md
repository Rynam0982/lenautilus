# Rapport de stage — Plateforme Le Nautilus

> Document récapitulatif du travail réalisé sur le projet **Le Nautilus**, refonte
> complète d'une plateforme de gestion d'événements et de réservation de salles.
> Rédigé tâche par tâche, avec le détail des fonctionnalités développées, des bugs
> rencontrés et des solutions apportées.

---

## 1. Présentation du projet

### 1.1 Contexte
Le Nautilus est un établissement disposant de salles événementielles. Le site
existant (hébergé chez OVH) était daté et limité. L'objectif du stage a été de
**reconstruire entièrement la plateforme** sous la forme d'une application web
moderne de type SaaS, permettant :

- la présentation publique des événements et des salles ;
- la vente de billets en ligne (paiement sécurisé) ;
- la gestion des réservations de salles par des artistes ;
- l'administration complète (événements, salles, utilisateurs, statistiques) ;
- la synchronisation des événements avec l'agenda public **OpenAgenda**.

### 1.2 Objectifs pédagogiques
- Concevoir une architecture full-stack moderne et maintenable.
- Mettre en place une authentification sécurisée avec gestion des rôles.
- Intégrer des services tiers (paiement, e-mail, agenda public).
- Apprendre à diagnostiquer et corriger des bugs en environnement réel.

---

## 2. Stack technique

| Domaine | Technologie |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Langage | TypeScript (mode strict) |
| Style | Tailwind CSS v4 (configuration CSS-first) |
| Base de données | PostgreSQL via l'ORM Prisma |
| Authentification | NextAuth v5 (Auth.js) — JWT + rôles |
| Paiement | Stripe (Payment Element + webhooks) |
| E-mails | Resend |
| Agenda public | API OpenAgenda v2 |
| Upload d'images | UploadThing |
| Animations | Framer Motion |
| Validation | Zod + React Hook Form |
| Notifications UI | Sonner (toasts) |

### Architecture générale
- **Groupes de routes** : `(public)`, `(auth)`, `(client)`, `(artist)`, `(admin)`.
- **Couche service** dans `src/services/` (logique métier isolée).
- **Garde d'accès** par rôle dans `src/lib/auth/guards.ts`.
- **Client base de données** centralisé dans `src/lib/db/client.ts`.
- **Rôles utilisateurs** :
  - `ADMIN` : contrôle total, voit les événements publics et privés.
  - `ARTIST` : demande des réservations de salle, soumet des infos d'événement.
  - `CLIENT` : navigue, achète des billets, demande des remboursements.

---

## 3. Déroulement du travail — tâche par tâche

> Chaque tâche correspond à une étape concrète du développement. Pour les
> corrections, j'indique le **symptôme**, la **cause** et la **solution**.

### Tâche 1 — Initialisation du projet
**Objectif :** créer la base du projet.

J'ai initialisé un projet Next.js (Create Next App) qui sert de fondation au
développement. Cette étape met en place la structure de fichiers, le système de
build et les dépendances de base.

---

### Tâche 2 — Construction complète de la plateforme
**Objectif :** poser toute l'ossature fonctionnelle de l'application.

C'est la tâche la plus importante du projet. J'ai construit l'ensemble de la
plateforme :

**Modèle de données (Prisma / PostgreSQL)**
Création du schéma : `User`, `Venue` (salle), `Event` (événement),
`TicketType` (type de billet), `Ticket` (billet), `Reservation` (réservation) et
`AuditLog` (journal d'audit).

**Pages publiques**
- Accueil (`/`) avec section héro cinématographique.
- Liste des événements (`/events`) et détail d'un événement (`/events/[slug]`).
- Liste des salles (`/venues`) et détail d'une salle (`/venues/[slug]`).
- Tunnel d'achat (`/checkout`) et page de succès.

**Authentification et rôles**
- Connexion et inscription (`/auth/login`, `/auth/register`).
- NextAuth v5 avec JWT et contrôle d'accès par rôle (ADMIN / ARTIST / CLIENT).

**Espaces privés**
- Client : billets (`/dashboard/tickets`) avec QR code et remboursement.
- Artiste : tableau de bord + formulaire de demande de réservation.
- Admin : événements, réservations, utilisateurs, statistiques, OpenAgenda.

**Fonctionnalités clés**
- Flux de réservation par l'artiste avec détection de conflit et validation admin.
- Notion d'événement public/privé (réservée à l'admin).
- Paiement Stripe (Payment Element) confirmé par webhook.
- Génération de billets avec QR code.
- Import unique depuis OpenAgenda + synchronisation automatique à la publication.
- Journal d'audit des actions sensibles.
- Sécurité : validation Zod systématique, gardes d'accès côté serveur.

**Design**
Thème sombre et premium (noir `#080808`, or `#c9a84c`), polices Inter (corps) et
Playfair Display (titres), inspiré des plateformes événementielles haut de gamme.

---

### Tâche 3 — Guide de déploiement
**Objectif :** documenter la mise en production.

Rédaction du fichier `DEPLOYMENT.md` décrivant les étapes de déploiement (variables
d'environnement, base de données, build).

---

### Tâche 4 — Nettoyage des fichiers de configuration
**Objectif :** retirer des fichiers de configuration superflus laissés par les outils.

Suppression de fichiers de config inutiles pour garder un dépôt propre.

---

### Tâche 5 — Correction du chargement des variables d'environnement
**Bug corrigé.**

- **Symptôme :** la configuration Prisma et le script de seed ne trouvaient pas les
  variables d'environnement.
- **Cause :** le fichier `.env.local` n'était pas chargé par la configuration Prisma
  ni par le script de seed.
- **Solution :** chargement explicite de `.env.local` dans `prisma.config.ts` et
  dans `prisma/seed.ts`, afin que la base de données soit correctement initialisée.

---

### Tâche 6 — Import OpenAgenda, photos de salles et domaines d'images
**Objectif + correction.**

- Ajout d'un script d'import des événements depuis l'API **OpenAgenda**.
- Intégration des photos de salles.
- **Correction :** ajout des domaines d'images autorisés dans `next.config.ts`
  (Next.js bloque par défaut les images provenant de domaines externes non déclarés).

---

### Tâche 7 — Correction du bug de redirection après connexion (1ère passe)
**Bug corrigé.**

- **Symptôme :** après la connexion, l'utilisateur n'était pas redirigé vers le bon
  espace selon son rôle.
- **Cause :** un appel à la base de données dans le callback JWT échouait
  silencieusement sur le runtime Edge, laissant le rôle (`token.role`) indéfini.
- **Solution :**
  - retrait de l'appel Prisma du callback JWT ;
  - création de `getDashboardRoute(role)` comme **source unique de vérité** pour la
    redirection (`/admin`, `/artist/dashboard` ou `/dashboard`) ;
  - lecture de la session après connexion pour rediriger selon le rôle ;
  - conservation du `callbackUrl` pour revenir à la page demandée après connexion.

---

### Tâche 8 — Refonte du système d'authentification (Edge / Node.js)
**Bug majeur corrigé.**

- **Symptôme :** boucle de redirection infinie vers `/auth/login` ; tous les
  utilisateurs étaient vus comme non authentifiés.
- **Cause racine :** le proxy (middleware) utilisait la configuration complète
  d'authentification (avec `PrismaAdapter`) sur le runtime **Edge**. Or les modules
  Prisma/Node.js échouent silencieusement sur Edge → `req.auth` toujours `null`.
- **Solution :** séparation de la configuration en deux :
  - `src/auth.config.ts` : configuration **compatible Edge** (JWT uniquement, sans
    adaptateur ni base de données) utilisée par le proxy ;
  - `src/lib/auth/index.ts` : configuration **complète** (avec adaptateur Prisma)
    pour les composants serveur.
  - Navigation « dure » (`window.location.href`) après connexion pour forcer la
    relecture du cookie de session frais par le proxy.
  - Ajout des pages manquantes : tableau de bord client, page d'erreur, page de
    redirection serveur basée sur le rôle.

> **Leçon technique :** sur Next.js, le middleware/proxy s'exécute sur le runtime
> Edge où Prisma n'est pas disponible. Il faut donc une configuration d'auth dédiée,
> légère et sans base de données pour cette couche.

---

### Tâche 9 — Vraies salles, prix réels, CRUD admin et e-mails
**Fonctionnalités + corrections.**

**Salles**
- Remplacement des 3 salles fictives par les **2 vraies salles** du Nautilus :
  - Salle 1 — Repas convivial (80 assis / 100 debout, cuisine, piano, écran).
  - Salle 2 — Soirée festive (80 assis / 150 debout, scène, mixage, accès PMR).
- Intégration des vraies photos et des capacités/équipements réels.

**Prix**
- L'import OpenAgenda récupère désormais le détail (`detailed=1`) pour obtenir le
  champ `conditions`.
- Analyse du texte des conditions (« 5€ », « 6€ », « Libre et gratuit »…) pour le
  convertir en centimes. **236 événements** mis à jour avec leurs vrais tarifs.

**CRUD événements (admin)**
- Création, modification et suppression d'événements (la suppression est bloquée si
  des billets ont été vendus).
- Formulaires de création/édition avec constructeur de types de billets.

**Notifications e-mail (Resend)**
- Artiste soumet une réservation → e-mail aux admins.
- Admin accepte → e-mail à l'artiste (avec info public/privé et notes).
- Admin refuse → e-mail à l'artiste (avec le motif).
- Comportement silencieux si la clé `RESEND_API_KEY` n'est pas configurée.

---

### Tâche 10 — Correction de la validation des dates de réservation
**Bug corrigé.**

- **Symptôme :** message d'erreur technique « Invalid ISO datetime » affiché à
  l'utilisateur lors d'une demande de réservation.
- **Cause :** la validation Zod `z.string().datetime()` n'acceptait pas le format
  renvoyé par les champs `datetime-local` du formulaire.
- **Solution :**
  - remplacement par un `refine()` personnalisé acceptant le format
    `datetime-local` et les chaînes ISO complètes ;
  - ajout de vérifications croisées (`superRefine`) : la date de début doit être dans
    le futur, la fin doit être après le début, avec des **messages clairs en
    français** pour chaque champ ;
  - conversion des dates en ISO UTC avant l'envoi à l'API ;
  - ajout de `min` sur les champs pour bloquer les dates passées dans l'interface ;
  - garde côté serveur (date future) en défense en profondeur.

---

### Tâche 11 — Correction du formulaire de réservation bloqué
**Bug corrigé.**

- **Symptôme :** le bouton de soumission du formulaire de réservation semblait cassé,
  sans aucun message d'erreur visible.
- **Cause :** la valeur par défaut de `coverImage` était une chaîne vide, ce qui
  faisait échouer `z.string().url()` **même sur un champ optionnel** ; Zod rejetait
  le formulaire sans afficher d'erreur.
- **Solution :**
  - correction de la validation du champ image optionnel ;
  - remplacement du couple `setValue`/`useState` par un `Controller` pour enregistrer
    correctement le champ `Select` (salle) auprès de React Hook Form ;
  - au passage, correction du texte « Trois salles » → « Deux salles » sur l'accueil
    et la page salles.

---

### Tâche 12 — Page salles admin, filtre événements à venir, crash OpenAgenda
**Bugs corrigés.**

- **Page salles admin (404) :** création de la page `/admin/venues` — le dossier
  existait mais le fichier `page.tsx` manquait.
- **Filtre « À venir » :** la section accueil affiche désormais uniquement les
  événements à venir ; le bouton « Tout voir » pointe vers `/events?upcoming=true`,
  et la page événements gère ce paramètre (titre, pagination, filtre).
- **Crash d'import OpenAgenda :** ajout du chaînage optionnel sur `timings` pour les
  événements dont le champ `timings` est manquant (qui faisaient planter l'import).

---

### Tâche 13 — Pagination, recherche, upload d'images, synchro OpenAgenda
**Fonctionnalités + corrections.**

**Page événements admin**
- Remplacement de l'affichage « 100 par page » par une **vraie pagination**
  (20/page) avec précédent/suivant et numéros de page.
- Barre de filtres : recherche par titre + onglets de statut.

**Page événements publique**
- Barre de filtres (recherche + bascule Tous / À venir).
- Conservation des filtres lors de la pagination, meilleurs messages d'état vide.

**Upload d'images (UploadThing)**
- Route `/api/uploadthing` (admin et artiste peuvent uploader).
- Composant `ImageUploadField` : zone de glisser-déposer + bouton + aperçu + repli
  par URL. Intégré aux formulaires d'événement (admin) et de réservation (artiste).

**Audit de la synchro OpenAgenda**
- À la création (`POST`), l'événement respecte désormais le choix public/privé du
  formulaire (au lieu d'être forcé à privé) : si public → publié + synchronisé.
- À la modification (`PATCH`), synchronisation lorsque l'événement devient public ou
  l'est déjà ; gestion de la mise à jour des types de billets non vendus.

---

### Tâche 14 — Recherche en temps réel dans la barre de navigation
**Fonctionnalité.**

- Route `GET /api/search?q=` renvoyant jusqu'à 6 événements publics correspondants.
- Composant `NavSearch` : icône loupe qui s'ouvre en champ de recherche animé.
- **Anti-rebond (debounce) de 280 ms** pour ne pas surcharger l'API.
- Menu déroulant affichant image, titre, date et salle de chaque résultat.
- Lien « Voir tous les résultats » → `/events?search=...`.
- Fermeture par touche Échap et clic à l'extérieur ; version mobile adaptée.

---

### Tâche 15 — Tri par date et filtre par période (événements admin)
**Fonctionnalité.**

- L'en-tête de colonne « Date » est cliquable : bascule croissant ↑ / décroissant ↓.
- Ordre par défaut : dates croissantes (événements à venir en premier).
- Boutons de filtre par période : Toutes périodes / À venir / Passés.
- Service `getAllEventsAdmin` étendu avec les paramètres `orderBy` et `period`.

---

### Tâche 16 — Intégration de la vraie identité visuelle
**Objectif :** rapprocher la plateforme de l'identité du site officiel.

- Récupération du **vrai logo** du Nautilus et des illustrations officielles, copiés
  dans `public/images/`.
- Création d'un composant `Logo` réutilisable (marque + typographie) utilisé dans la
  barre de navigation, le pied de page et la barre latérale d'administration.
- Définition du logo comme **favicon** du site (balises `icons` dans les métadonnées).
- Choix de conserver le thème sombre premium existant tout en y intégrant les
  éléments de marque réels (« adapter un peu » le style sans casser l'existant).

---

### Tâche 17 — Nouvelle section « Le projet »
**Objectif :** présenter le projet et les prestations du Nautilus.

- Création de la page publique `/projet` reprenant **le contenu exact** du site
  officiel (`le-nautilus.org/nos-prestations`) :
  - **Chiffres clés — Saison 2025** : 358 événements publics, 12 273 personnes
    accueillies, 65 soirées gratuites.
  - Les 4 prestations : aide aux artistes locaux, accompagnement des organisateurs,
    sensibilisation aux métiers de la musique, aide à la diffusion des musiques
    actuelles — avec leurs descriptions et les illustrations officielles.
- Ajout du lien « Le projet » dans la barre de navigation et le pied de page.
- Ajout d'un aperçu « Le projet » (chiffres clés + lien) sur la page d'accueil.

---

### Tâche 18 — Correction : les événements annulés ne s'affichaient pas
**Bug corrigé.**

- **Symptôme :** un événement annulé sur OpenAgenda apparaissait comme un événement
  normal réservable sur le site (ou disparaissait), sans mention « Annulé ».
- **Cause :** les requêtes publiques filtraient uniquement `status = PUBLISHED`, et
  l'import OpenAgenda ne récupérait pas l'état d'annulation.
- **Solution :**
  - les requêtes publiques acceptent désormais `status ∈ {PUBLISHED, CANCELLED}` ;
  - la carte d'événement affiche un badge rouge **« Annulé »** et grise l'image ;
  - la page de détail affiche une bannière d'annulation et **ferme la billetterie**
    (le sélecteur de billets est remplacé par un message) ;
  - l'import OpenAgenda mappe l'état `status = 6` (annulé) vers `CANCELLED` ;
  - un script de rattrapage met à jour les événements déjà importés.

---

### Tâche 19 — Correction : descriptions d'événements manquantes
**Bug corrigé.**

- **Symptôme :** la description longue de certains événements importés
  d'OpenAgenda était vide sur la page de détail.
- **Cause :** l'import en masse récupérait une description tronquée (l'API
  OpenAgenda ne renvoie le texte complet qu'avec le paramètre `detailed=1` et une
  taille de `longDescription` explicite).
- **Solution :**
  - l'import demande désormais `detailed=1` et `longDescription[size]=20000` ;
  - création d'un script de rattrapage (`npm run oa:backfill`) qui interroge le
    détail de chaque événement OpenAgenda pour remplir la description complète
    (et détecter au passage les annulations). Idempotent et relançable.

> Note : la base de données locale étant arrêtée au moment du développement, le
> code a été validé par vérification de types ; les scripts de rattrapage sont à
> lancer une fois la base démarrée (`npm run oa:backfill`).

---

### Tâche 20 — Affichage intelligent des images mal dimensionnées
**Bug corrigé.**

- **Symptôme :** certaines images importées d'OpenAgenda (affiches au format
  portrait) étaient mal recadrées sur le site (têtes/texte coupés), alors que
  d'autres s'affichaient correctement.
- **Cause :** l'utilisation systématique de `object-cover` recadre toujours
  l'image, ce qui dégrade les visuels en portrait.
- **Solution :** création d'un composant `SmartCover` qui mesure les dimensions
  réelles de l'image au chargement :
  - images paysage/carrées → `object-cover` (remplissent joliment le cadre) ;
  - affiches portrait → `object-contain` (affiche **toute** l'affiche), avec un
    **arrière-plan flou** de la même image pour combler le cadre sans bande noire.
  - appliqué à la bannière de la page de détail d'événement.

---

### Tâche 21 — Téléchargement des couvertures d'événements
**Fonctionnalité.**

- Ajout d'un bouton **« Télécharger la couverture »** sur la page de détail.
- Création d'une route API (`/api/events/[id]/cover`) qui, à l'aide de la
  bibliothèque **sharp** :
  - récupère l'image de couverture ;
  - respecte l'orientation EXIF ;
  - **ne suragrandit jamais** l'image et limite le plus grand côté à 2000 px ;
  - réencode en **JPEG progressif haute qualité (mozjpeg, qualité 90)** ;
  - renvoie le fichier en téléchargement (`Content-Disposition: attachment`).
  Ce calcul garantit le meilleur compromis qualité/poids pour le partage et l'impression.

---

### Tâche 22 — Fonctionnalité Newsletter (Mailchimp)
**Fonctionnalité.**

- Création d'un client **Mailchimp** léger (`src/lib/mailchimp`) basé sur `fetch`
  (sans dépendance supplémentaire), qui se désactive proprement si les variables
  d'environnement sont absentes (même logique que les e-mails Resend).
- **Côté admin** : nouvelle page `/admin/newsletter` (lien ajouté dans la barre
  latérale) affichant le nombre d'abonnés et un formulaire pour rédiger et
  **envoyer une campagne** à toute l'audience.
- **Côté public** : formulaire d'inscription à la newsletter dans le pied de page
  (route `/api/newsletter/subscribe`, inscription idempotente via l'API Mailchimp).
- Documentation des variables `MAILCHIMP_*` dans `.env.example`.

---

### Tâche 23 — Correction de la détection des annulations + exécution du rattrapage
**Bug corrigé (suite des Tâches 18–19).**

- **Symptôme :** après la première correction, les événements annulés ne
  s'affichaient toujours pas comme « Annulé », et les descriptions restaient vides.
- **Cause :** OpenAgenda **ne marque pas** les annulations via le champ numérique
  `status` (qui reste à 1) ; l'annulation est indiquée dans le **titre**
  (« [ANNULÉ] ») et dans le **corps** du texte (« ANNULATION DE CE CONCERT »).
  De plus, le script de rattrapage se connectait par erreur à une base locale.
- **Solution :**
  - détection d'annulation par **titre + description** (regex `annul`) en plus du
    `status = 6`, dans l'import **et** le rattrapage ;
  - correction du chargement d'environnement des scripts (`.env.local` prioritaire
    avec `override`, le fichier `.env` par défaut pointait vers `localhost`) ;
  - **exécution du rattrapage** sur les 437 événements : 400 mis à jour
    (descriptions longues remplies) et **20 événements annulés** correctement
    marqués `CANCELLED` — dont la conférence France-Algérie et le concert Sly
    Telema des captures —, 0 erreur.

---

### Tâche 24 — Affichage des couvertures à leur ratio natif (anti-recadrage)
**Bug corrigé (amélioration de la Tâche 20).**

- **Symptôme :** certaines couvertures (ex. « Cours de Salsa ») étaient recadrées
  et perdaient en qualité, alors que d'autres s'affichaient correctement.
- **Cause :** la bannière imposait une hauteur fixe avec recadrage (`object-cover`),
  inadapté aux formats variés d'OpenAgenda.
- **Solution :** le composant `SmartCover` mesure désormais le **ratio réel** de
  chaque image et adapte le cadre à ce ratio (plafonné à 70 % de la hauteur
  d'écran). L'image est affichée **en entier** (`object-contain`), sans recadrage
  ni agrandissement (qualité d'origine préservée) ; un arrière-plan flou de la même
  image comble élégamment les marges (portraits/affiches).

---

### Tâche 25 — Bandeau « Annulé » sur les affiches
**Fonctionnalité (alignement sur le site officiel).**

- Ajout d'un **bandeau rouge « Annulé »** superposé à l'affiche des événements
  annulés (comme sur le site officiel), en plus de la bannière d'information et de
  la fermeture de la billetterie déjà en place.
- L'image annulée est légèrement désaturée pour renforcer le signal visuel.

---

### Tâche 26 — Thème clair / sombre
**Fonctionnalité.**

- Mise en place d'un **sélecteur de thème clair / sombre** (icône soleil/lune)
  présent dans la barre de navigation (desktop + mobile) et la barre latérale admin.
- Refonte des **jetons de couleur** en variables CSS runtime : un même jeu de
  classes (`bg-nautilus-black`, `text-nautilus-white`, …) bascule automatiquement
  entre les deux thèmes, qui s'appliquent donc à **tout le site**.
- Gestion via `next-themes` (persistance du choix, thème sombre par défaut, pas de
  clignotement au chargement).

---

### Tâche 27 — Variables d'environnement et correctif `.env.local`
**Maintenance.**

- Ajout des variables **Mailchimp** (`MAILCHIMP_API_KEY`, `MAILCHIMP_SERVER_PREFIX`,
  `MAILCHIMP_AUDIENCE_ID`) dans `.env.local`.
- Correction de la variable `UPLOADTHING_TOKEN` qui était **doublement encapsulée**
  (`UPLOADTHING_TOKEN="UPLOADTHING_TOKEN='…'"`), ce qui pouvait casser l'upload.

---

### Tâche 28 — Correction des événements à venir manquants (récurrents)
**Bug corrigé.**

- **Symptôme :** la page d'accueil et l'agenda n'affichaient que **4 événements à
  venir**, alors que le site officiel en montrait beaucoup plus (Soirée Jeux,
  HOLYFISH, Z project…).
- **Cause double :**
  1. les événements récurrents avaient une `startDate` erronée (date d'import au
     lieu de la prochaine occurrence) → considérés comme « passés » ;
  2. certains événements avaient été importés avec `status = APPROVED` et
     `isPublic = false` (ancienne logique sur l'état OpenAgenda) → invisibles
     côté public.
- **Solution :**
  - utilisation de **`nextTiming`** (prochaine occurrence) pour `startDate`/`endDate`
    dans l'import et le rattrapage ;
  - **promotion** des événements OpenAgenda non annulés en `PUBLISHED` + public
    (ils proviennent tous de l'agenda public) ;
  - résultat : **4 → 12 événements à venir** affichés. Import revérifié :
    0 événement manquant (les 437 de l'agenda sont importés).

---

### Tâche 29 — Pages détail « En savoir plus » de la section Projet
**Fonctionnalité.**

- Chaque élément du projet dispose d'un bouton **« En savoir plus »** menant à sa
  page détail (`/projet/[slug]`).
- Contenu **complet** repris des 5 pages de `le-nautilus.org` (et légèrement
  reformulé) : aide aux artistes, accompagnement des organisateurs, sensibilisation
  aux métiers, aide à la diffusion, et la page spéciale Chiffres clés.
- Données centralisées dans `src/lib/projet-data.ts`.

---

### Tâche 30 — Galerie photo + vidéo (Chiffres clés)
**Fonctionnalité.**

- Intégration des **29 photos** de la saison fondatrice et de la **vidéo** sur la
  page Chiffres clés.
- Composant `PhotoGallery` : vignettes affichées **4 par 4**, **défilement
  horizontal** (boutons gauche/droite), **clic pour agrandir** dans une visionneuse
  (lightbox) avec navigation précédent/suivant et fermeture (clavier + boutons).
- Ajout des statistiques détaillées de la saison (358 événements, 185 concerts,
  924 artistes, 60 386 € de billetterie, etc.).

---

### Tâche 31 — Amélioration du mode clair
**Amélioration.**

- **Contraste et lisibilité** revus : fond crème chaud, cartes blanches, **bordures
  renforcées** (les cartes d'événements ne « se fondent » plus dans le fond).
- **Couleurs de l'entreprise** : en thème clair, l'accent passe du doré au **vert**
  du site officiel (boutons, liens, badges), tandis que le thème sombre conserve le
  doré. Anneau de focus et sélection désormais dépendants du thème.

---

### Tâche 32 — Logo adapté au thème
**Fonctionnalité.**

- Intégration du **second logo (jaune)** en plus du logo violet existant.
- Affichage **conditionnel selon le thème** : logo violet en mode sombre, logo
  jaune en mode clair (via le composant `Logo`).

---

### Tâche 33 — Couvertures manquantes des événements importés
**Bug corrigé.**

- **Symptôme :** certains événements (récurrents / promus) s'affichaient sans
  image de couverture (carte vide).
- **Cause :** ces événements avaient été importés sans `coverImage`.
- **Solution :** récupération de l'image depuis OpenAgenda
  (`image.base + variante "full"`) pour les 9 événements concernés ; logique
  ajoutée au script de rattrapage pour combler toute couverture manquante.

---

### Tâche 34 — Refonte typographique
**Amélioration.**

- Remplacement des polices génériques (Inter / Playfair) par un duo plus
  caractériel et professionnel : **Bricolage Grotesque** (titres) et **Manrope**
  (corps de texte), chargées via `next/font`.

---

### Tâche 35 — Refonte de la palette de couleurs
**Amélioration.**

- Mise en place d'un **système à deux accents** : le doré (identité premium) et le
  **vert de l'entreprise** comme accent secondaire (badges « Gratuit », succès).
- **Mode clair** retravaillé : fond crème plus chaud, cartes blanches, bordures plus
  marquées, doré assombri pour rester lisible sur fond clair — fini le « tout vert ».

---

### Tâche 36 — Refonte des cartes d'événement
**Amélioration (correction des « effets blancs »).**

- Nouvelle structure de carte : **l'affiche s'affiche en entier** (sans recadrage,
  qualité préservée) sur un fond flou, puis le titre, la date et le lieu **sous
  l'image** sur la surface pleine de la carte.
- Plus de bloc blanc lorsqu'une image manque : **placeholder de marque** (dégradé +
  icône) à la place.
- Badge « Gratuit » en vert, badge « Annulé » et bandeau sur les affiches annulées,
  effet de survol soigné. Rendu identique et propre en thème clair comme sombre.

---

### Tâche 37 — Mentions légales officielles
**Fonctionnalité.**

- Création de la page `/mentions-legales` reprenant les informations officielles
  (éditeur **KALKOM SARL**, RCS Perpignan 481 808 111, directeur de publication,
  hébergeur **Infomaniak**, propriété intellectuelle, loi 2004-575).
- Suppression des liens vers les pages légales inutilisées (Confidentialité, CGV)
  dans le pied de page.

---

### Tâche 38 — Liens réseaux sociaux
**Fonctionnalité.**

- Les icônes du pied de page pointent désormais vers les vrais profils
  **Facebook** et **Instagram** du Nautilus (ouverture dans un nouvel onglet,
  `rel="noopener noreferrer"`).

---

### Tâche 39 — Refonte des cartes de salle
**Bug corrigé + amélioration.**

- **Symptôme :** en mode clair, un dégradé sombre (devenu crème) « débordait » sur
  le bas des photos de salle.
- **Cause :** un overlay `from-nautilus-black/80` pensé pour le thème sombre.
- **Solution :** cartes de salle alignées sur le **style des cartes d'événement**
  (image nette en haut, contenu sur la surface pleine en dessous, sans overlay).
- Les salles sont désormais **centrées** (mise en page adaptée à leur faible nombre).

---

### Tâche 40 — Retouches visuelles
**Amélioration.**

- Ajout d'un **dégradé de marque** (doré → vert) utilisé sur les chiffres mis en
  avant, pour une touche de couleur cohérente avec les deux accents du site.
- Effets de survol et placeholders harmonisés sur l'ensemble des cartes.

---

## 4. Récapitulatif des bugs corrigés

| # | Bug | Cause | Solution |
|---|-----|-------|----------|
| 1 | Variables d'env. non chargées | `.env.local` non lu par Prisma/seed | Chargement explicite dans la config |
| 2 | Images externes bloquées | Domaines non déclarés | Ajout des domaines dans `next.config.ts` |
| 3 | Mauvaise redirection par rôle | Rôle indéfini (appel DB sur Edge) | `getDashboardRoute()` + lecture de session |
| 4 | Boucle de redirection infinie | Prisma utilisé sur runtime Edge | Séparation config Edge / Node.js |
| 5 | « Invalid ISO datetime » | Format `datetime-local` refusé par Zod | `refine()` + messages FR + conversion UTC |
| 6 | Formulaire réservation bloqué | `coverImage` vide refusé par `url()` | Validation optionnelle + `Controller` |
| 7 | Page `/admin/venues` en 404 | `page.tsx` manquant | Création de la page |
| 8 | Crash import OpenAgenda | Champ `timings` manquant | Chaînage optionnel `timings?.[]` |
| 9 | Événements annulés invisibles | Filtre `status = PUBLISHED` only | Inclure `CANCELLED` + badge « Annulé » |
| 10 | Description longue vide | Import sans `detailed=1` | Import détaillé + script de rattrapage |
| 11 | Affiches portrait mal recadrées | `object-cover` systématique | Composant `SmartCover` (cover/contain auto) |
| 12 | Lien « Espace artiste » en 404 | `/artist` sans page | Pointé vers `/artist/dashboard` |
| 13 | Annulations non détectées | OpenAgenda n'utilise pas `status=6` | Détection par titre/description + rattrapage |
| 14 | Scripts connectés à `localhost` | `.env` par défaut prioritaire | `.env.local` forcé (`override`) |
| 15 | Couvertures recadrées | Hauteur fixe + `object-cover` | Affichage au ratio natif (`SmartCover`) |
| 16 | `UPLOADTHING_TOKEN` invalide | Valeur doublement encapsulée | Correction de la valeur dans `.env.local` |
| 17 | Peu d'événements « à venir » | Dates récurrentes + events `APPROVED`/privés | `nextTiming` + promotion en `PUBLISHED`/public (4 → 12) |
| 18 | Couvertures manquantes | Événements importés sans image | Récupération de l'image OpenAgenda (`full`) |

---

## 4 bis. Audit du site

Audit réalisé en parcourant l'ensemble des pages et services.

**Corrigé pendant cette session :**
- Événements annulés désormais affichés avec mention « Annulé » (Tâche 18).
- Descriptions longues OpenAgenda manquantes (Tâche 19).
- Recadrage des affiches portrait, puis affichage au ratio natif (Tâches 20, 24).
- Détection des annulations et rattrapage des données (Tâche 23).
- Bandeau « Annulé » sur les affiches (Tâche 25).
- Thème clair / sombre sur tout le site (Tâche 26).
- Lien « Espace artiste » du pied de page qui menait à une 404 (corrigé vers
  `/artist/dashboard`).

**Améliorations recommandées (à planifier) :**
- Ajouter une action **« Annuler l'événement »** dans l'administration (le statut
  `CANCELLED` existe et est désormais géré côté affichage ; il manque le bouton).
- Nettoyer les avertissements ESLint hérités (apostrophes non échappées, imports
  inutilisés) pour un dépôt 100 % « lint-clean ».
- Dans `publishEventToOpenAgenda`, factoriser la double mise à jour de
  `openAgendaSynced` (micro-optimisation).
- Mutualiser le composant `SmartCover` sur les cartes d'événement si besoin d'un
  rendu identique des affiches partout.
- Activer la double opt-in Mailchimp (RGPD) si la newsletter passe en production.

---

## 5. Bilan et compétences acquises

- **Architecture full-stack** avec Next.js App Router et séparation claire des
  couches (pages / services / accès données).
- **Sécurité** : authentification par rôles, gardes serveur, validation systématique.
- **Intégrations tierces** : Stripe (paiement + webhooks), Resend (e-mails),
  OpenAgenda (import et synchronisation), UploadThing (upload d'images),
  **Mailchimp** (newsletter).
- **Traitement d'images** : optimisation serveur avec `sharp` (redimensionnement,
  réencodage qualité/poids) et affichage adaptatif selon le format source.
- **Débogage en conditions réelles** : la distinction des runtimes Edge / Node.js
  et la rigueur sur la validation des formulaires ont été les apprentissages les
  plus marquants.
- **Bonnes pratiques** : messages d'erreur clairs pour l'utilisateur final (en
  français), pagination, recherche performante (debounce), expérience soignée.

---

*Document mis à jour automatiquement à chaque tâche réalisée sur le projet.*
