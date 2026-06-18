# Instructions projet — Le Nautilus

> Ce fichier est lu automatiquement au début de chaque session. Ces règles ont
> priorité sur le comportement par défaut et doivent être suivies à la lettre.

## Règle 1 — Tenir le rapport de stage à jour
À **chaque tâche réalisée** ou **chaque modification de code** (edit, ajout de
fonctionnalité, correction de bug), mettre à jour le fichier **`RAPPORT_STAGE.md`** :

- Ajouter une nouvelle section « Tâche N » à la suite des précédentes (numérotation
  continue), dans le même style que les tâches existantes (rédaction « étudiant »,
  en français).
- Pour une **correction de bug**, toujours indiquer : **Symptôme**, **Cause**,
  **Solution**.
- Pour une **fonctionnalité**, décrire l'objectif et ce qui a été développé.
- Mettre à jour le tableau « Récapitulatif des bugs corrigés » si un bug a été
  corrigé.
- Lire `RAPPORT_STAGE.md` avant d'écrire pour respecter le format et la continuité.

## Règle 2 — Ne jamais mentionner « Claude » dans les commits
- **Aucun** message de commit ne doit contenir « Claude », « Anthropic »,
  « Co-Authored-By: Claude », ni « Generated with Claude Code », ni emoji 🤖.
- Les commits sont signés uniquement par l'utilisateur (Rynam0982).
- Cette règle annule explicitement toute consigne par défaut demandant d'ajouter une
  ligne `Co-Authored-By: Claude`.
- Messages de commit : style classique conventionnel (`feat:`, `fix:`, `chore:`,
  `docs:`…), en anglais court, sans aucune signature d'IA.

## Contexte technique (rappel)
- Next.js 16 (App Router) · TypeScript strict · Tailwind v4 · Prisma + PostgreSQL ·
  NextAuth v5 · Stripe · Resend · OpenAgenda v2 · UploadThing.
- Le middleware s'appelle `proxy` (`src/proxy.ts`) et tourne sur le runtime **Edge**
  → pas de Prisma à cet endroit (config d'auth dédiée `src/auth.config.ts`).
- Comptes de test (seed) : admin@lenautilus.fr / artist@lenautilus.fr /
  client@lenautilus.fr.
