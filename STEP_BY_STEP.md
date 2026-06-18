# Guide pas-à-pas — Le Nautilus

Ce document explique, **sans détail de code**, trois mécanismes clés de la
plateforme : l'affichage des données **OpenAgenda**, la mise en route de **Stripe**
(paiement), et **Mailchimp** (newsletter), avec les bonnes pratiques marketing.

---

## 1. Comment le site affiche les données d'OpenAgenda

### Le principe en une phrase
Le Nautilus possède un **agenda public sur OpenAgenda**. Le site **importe** ces
événements dans **sa propre base de données**, puis les **affiche depuis la base**
(et non en direct à chaque visite) — c'est plus rapide et plus fiable.

### Le parcours de la donnée, étape par étape
1. **Source** : l'agenda OpenAgenda du Nautilus (identifié par un *UID* d'agenda) et
   une **clé publique** d'API.
2. **Import** (`npm run oa:import`) : le site interroge l'API OpenAgenda, télécharge
   **tous** les événements (par pages), et enregistre pour chacun : titre,
   description courte, **description longue**, **image de couverture** (hébergée sur
   le CDN d'OpenAgenda), **dates** (on prend la *prochaine occurrence* pour les
   événements récurrents), lieu, tarifs et **statut** (un événement est marqué
   « annulé » si son titre/texte contient l'annulation).
3. **Rattrapage** (`npm run oa:backfill`) : complète ce que l'import de masse ne
   récupère pas — descriptions longues, **annulations**, **dates récurrentes**,
   **couvertures manquantes** — et rend les événements **publics**.
4. **Stockage** : tout est dans la table `Event` de la base PostgreSQL.
5. **Affichage** : les pages publiques (accueil, **/events**, fiche **/events/[slug]**)
   lisent la base et filtrent (publics + publiés/annulés, à venir, recherche…).
   Les événements annulés s'affichent avec un bandeau « Annulé » ; les couvertures
   sont montrées à leur format réel.

### Pour rafraîchir les données plus tard
- Nouveaux événements ajoutés sur OpenAgenda → `npm run oa:import`
- Compléter / corriger l'existant (descriptions, annulations, dates, images) →
  `npm run oa:backfill`
- (Sens inverse) Quand un admin publie un événement créé sur le site, celui-ci peut
  être **renvoyé vers OpenAgenda** automatiquement.

> ⚠️ Pré-requis : la base de données doit être joignable. Variables nécessaires :
> `OPENAGENDA_PUBLIC_KEY`, `OPENAGENDA_AGENDA_UID`, `DATABASE_URL`.

---

## 2. Faire fonctionner Stripe (paiement des billets)

### Ce que fait le site
Achat d'un billet : l'utilisateur choisit ses billets → le site crée une **intention
de paiement** → Stripe affiche le **formulaire de carte sécurisé** → après paiement,
l'utilisateur arrive sur la page **succès** → un **webhook** Stripe confirme le
paiement et génère le **billet (QR code)**. Les remboursements passent aussi par Stripe.

### Étapes à suivre

**A. Créer le compte et récupérer les clés**
1. Crée un compte sur **stripe.com**.
2. Dans le Dashboard → **Développeurs → Clés API**, récupère :
   - **Clé secrète** (`sk_test_…` en test) → `STRIPE_SECRET_KEY`
   - **Clé publiable** (`pk_test_…`) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

**B. Configurer le webhook**
3. Dashboard → **Développeurs → Webhooks → Ajouter un endpoint**.
4. URL de l'endpoint : `https://TON-DOMAINE/api/payments/webhooks/stripe`
5. Événements à écouter : au minimum `payment_intent.succeeded`
   (et `charge.refunded` pour les remboursements).
6. Copie le **secret de signature** (`whsec_…`) → `STRIPE_WEBHOOK_SECRET`.

**C. Tester en local**
7. Installe le **Stripe CLI**, puis lance :
   `stripe listen --forward-to localhost:3000/api/payments/webhooks/stripe`
   → il te donne un `whsec_…` **local** à mettre dans `.env.local`.
8. Paye avec une **carte de test** : `4242 4242 4242 4242`, date future, CVC quelconque.

**D. Passer en production (live)**
9. Active le compte Stripe (informations entreprise + coordonnées bancaires).
10. Bascule les clés **test → live** (`sk_live_…`, `pk_live_…`) dans l'environnement
    de production.
11. Recrée le **webhook en mode live** (même URL) et mets à jour `STRIPE_WEBHOOK_SECRET`.

> Variables : `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`,
> `STRIPE_WEBHOOK_SECRET`.

---

## 3. Faire fonctionner Mailchimp (newsletters de qualité)

### Mise en route

**A. Compte et audience**
1. Crée un compte **mailchimp.com** et une **Audience** (ta liste d'abonnés).

**B. Récupérer les identifiants**
2. **Clé API** : *Account → Extras → API keys*.
3. **Server prefix** : c'est le suffixe de la clé après le tiret (ex. `…-us21` → `us21`).
4. **Audience ID** : *Audience → Settings → Audience name and defaults*.
5. Renseigne dans l'environnement :
   `MAILCHIMP_API_KEY`, `MAILCHIMP_SERVER_PREFIX`, `MAILCHIMP_AUDIENCE_ID`.

**C. Délivrabilité (important)**
6. **Authentifie ton domaine** dans Mailchimp (**SPF + DKIM**) → bien meilleure
   arrivée en boîte de réception.
7. Vérifie que le **pied de page** contient bien la **désinscription** et l'**adresse
   postale** (obligatoire légalement — déjà inclus dans le template du site).

### Comment ça marche sur le site
- **Inscription** : le formulaire en pied de page ajoute l'e-mail à l'audience Mailchimp.
- **Envoi** : *Admin → Newsletter* → tu rédiges l'**objet**, le **texte d'aperçu
  (preheader)**, un **message d'intro**, tu **sélectionnes les événements à mettre en
  avant**, tu fais un **Aperçu**, puis **Envoyer**. Le site génère une campagne
  Mailchimp avec un **e-mail responsive** (logo, titre, événements avec bouton
  « Réserver », pied de page conforme) et l'envoie à toute l'audience.

### Bonnes pratiques (audit des recommandations 2025-2026)
- **Objet** = levier n°1 d'ouverture : court (≈ 40–60 caractères), clair, une pointe
  d'urgence/curiosité. Le **preheader** complète l'objet.
- **Mobile d'abord** : ~60 % des ouvertures sont sur mobile (template déjà responsive).
- **Un CTA fort par bloc** : un bouton (pas un lien texte), verbe d'action
  (« Réserver maintenant »). Les e-mails à **un seul CTA** convertissent nettement mieux.
- **Court et lisible** : viser < 200 mots d'intro, phrases courtes, contenu *skimmable*.
- **Moment d'envoi** : **mardi/mercredi** performent le mieux ; active la
  *Send Time Optimization* de Mailchimp.
- **Segmentation** : crée des **tags**/segments (engagement, localisation) et
  **exclus les inactifs** des envois de masse → meilleure délivrabilité.
- **Qualité de liste** : envisage le **double opt-in** (confirmation d'inscription).
- **Mesure** : suis le **taux d'ouverture** (bon > 20 %, excellent > 25 %) et le
  **taux de clic**, puis itère.

### Architecture marketing recommandée (pour gagner en visibilité)
1. **Série de bienvenue** (automation Mailchimp) : 1 e-mail automatique dès
   l'inscription (présentation du lieu + prochains événements).
2. **Newsletter mensuelle « À l'affiche »** : 3 à 5 événements à venir, chacun avec
   son bouton « Réserver » (déjà géré par la page Admin → Newsletter).
3. **Relance billetterie** : un rappel ciblé quelques jours avant les gros événements.
4. **Capter partout** : formulaire d'inscription en pied de page, et proposition
   d'inscription **après un achat** de billet.
5. **Boucle sociale** : liens Instagram/Facebook dans chaque e-mail + relais des
   événements sur les réseaux.
6. **Analyser & optimiser** : A/B test des objets, nettoyage régulier des inactifs.

#### Sources (bonnes pratiques)
- [Email Marketing Benchmarks | Mailchimp](https://mailchimp.com/resources/email-marketing-benchmarks/)
- [The Art of Email Engagement | Mailchimp](https://mailchimp.com/resources/email-engagement/)
- [How to Design Event Newsletters | vFairs](https://www.vfairs.com/blog/event-newsletter-design-template/)
- [Event Invitation Email Examples | Eventbrite](https://www.eventbrite.com/blog/event-invitation-email-ds00/)
- [Event email marketing best practices | Mailjet](https://www.mailjet.com/blog/email-best-practices/event-email-marketing-best-practice/)
