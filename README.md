# Flooow - Plateforme d'accès aux activités

Plateforme gratuite pour faciliter l'accès aux activités sportives, culturelles et de loisirs pour les enfants de 3 à 17 ans.

## Technologies

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Analytics**: Lucky Orange (RGPD compliant)

## Installation locale

```sh
# Cloner le repo
git clone <URL_DU_REPO>
cd flooow-connect

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement (port 8080) |
| `npm run build` | Build de production |
| `npm run preview` | Preview du build |
| `npm run lint` | Vérification ESLint |
| `npm run typecheck` | Vérification TypeScript |

## Structure du projet

```
src/
├── components/     # Composants React réutilisables
├── pages/          # Pages de l'application
├── hooks/          # Custom hooks
├── utils/          # Fonctions utilitaires
├── lib/            # Configuration et helpers
├── contexts/       # React contexts
└── integrations/   # Intégrations externes (Supabase)
```

## Déploiement

Le projet se déploie automatiquement via CI/CD sur merge vers `main`.

## Variables d'environnement

Créer un fichier `.env` à la racine :

```env
VITE_SUPABASE_URL=<URL_SUPABASE>
VITE_SUPABASE_ANON_KEY=<CLE_ANONYME>
VITE_GOOGLE_CLIENT_ID=<CLIENT_ID_OAUTH_WEB_GOOGLE>
```

## Licence

Propriétaire - InKlusif © 2025
