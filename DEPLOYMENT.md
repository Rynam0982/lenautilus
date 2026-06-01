# Le Nautilus — Guide de déploiement

## 1. Base de données (PostgreSQL)

Créez une base PostgreSQL sur Neon, Supabase, ou votre hébergeur :
```
DATABASE_URL=postgresql://...
```

## 2. Push du schéma et seed

```bash
npm run db:push      # Crée les tables
npm run db:seed      # Crée les 3 salles + comptes de test
```

## 3. Variables d'environnement

Copiez `.env.example` → `.env.local` et remplissez :

### Auth secret
```bash
openssl rand -base64 32  # Génère AUTH_SECRET
```

### Stripe
- Récupérez vos clés sur dashboard.stripe.com
- Configurez le webhook vers `https://votre-domaine.fr/api/payments/webhooks/stripe`
- Événements à écouter : `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`

### OpenAgenda
- Connectez-vous sur openagenda.com
- Récupérez votre clé publique dans Réglages > API
- Demandez une clé secrète à support@openagenda.com
- Trouvez votre Agenda UID dans l'URL de votre agenda

## 4. Déploiement Vercel

```bash
npm i -g vercel
vercel --prod
```

Variables à configurer sur Vercel Dashboard :
- DATABASE_URL
- AUTH_SECRET
- AUTH_URL (= https://lenautilus.fr)
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- OPENAGENDA_PUBLIC_KEY
- OPENAGENDA_SECRET_KEY
- OPENAGENDA_AGENDA_UID
- NEXT_PUBLIC_APP_URL

## 5. Premier import OpenAgenda

Après le déploiement, connectez-vous en tant qu'admin et allez dans :
`/admin/openagenda` → Cliquez "Lancer l'import OpenAgenda"

## Comptes de test (après seed)

| Rôle    | Email                     | Mot de passe  |
|---------|---------------------------|---------------|
| Admin   | admin@lenautilus.fr       | admin123!     |
| Artiste | artist@lenautilus.fr      | artist123!    |
| Client  | client@lenautilus.fr      | client123!    |
