# Configuration OAuth LinkedIn pour Flooow Connect

Ce document décrit comment configurer LinkedIn OAuth pour permettre aux utilisateurs de se connecter avec leur compte LinkedIn.

## Prérequis

- Compte LinkedIn Developer
- Accès au Supabase Dashboard (projet `kbrgwezkjaakoecispom`)
- Accès au déploiement Netlify (`flooowtest.netlify.app`)

---

## Étape 1 : Créer une application LinkedIn

1. Aller sur [LinkedIn Developer Portal](https://developer.linkedin.com/)
2. Cliquer sur **"Create App"**
3. Remplir les informations :
   - **App name** : `Flooow Connect`
   - **LinkedIn Page** : Sélectionner ou créer une page entreprise
   - **App logo** : Uploader le logo Flooow
   - **Legal agreement** : Cocher pour accepter
4. Cliquer **"Create app"**

---

## Étape 2 : Activer le produit "Sign In with LinkedIn using OpenID Connect"

1. Dans l'app LinkedIn, aller dans l'onglet **"Products"**
2. Trouver **"Sign In with LinkedIn using OpenID Connect"**
3. Cliquer **"Request access"**
4. Attendre l'approbation (généralement instantanée)

> ⚠️ **Important** : Utiliser le produit OpenID Connect, pas l'ancien "Sign In with LinkedIn" qui est déprécié.

---

## Étape 3 : Configurer les URLs de redirection

1. Aller dans l'onglet **"Auth"**
2. Dans **"OAuth 2.0 settings"**, section **"Authorized redirect URLs for your app"**
3. Ajouter :
   ```
   https://kbrgwezkjaakoecispom.supabase.co/auth/v1/callback
   ```
4. Cliquer **"Update"**

---

## Étape 4 : Récupérer les identifiants

1. Toujours dans l'onglet **"Auth"**
2. Noter :
   - **Client ID** : visible directement
   - **Client Secret** : cliquer sur l'icône œil pour révéler

---

## Étape 5 : Configurer Supabase

1. Aller sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionner le projet `kbrgwezkjaakoecispom`
3. Naviguer vers **Authentication** → **Providers**
4. Trouver **LinkedIn (OIDC)** et cliquer dessus
5. Activer le toggle **"Enable LinkedIn (OIDC) provider"**
6. Remplir :
   - **LinkedIn Client ID** : coller le Client ID
   - **LinkedIn Client Secret** : coller le Client Secret
7. Cliquer **"Save"**

---

## Étape 6 : Vérifier la configuration URL dans Supabase

1. Dans Supabase, aller à **Authentication** → **URL Configuration**
2. Vérifier que les URLs suivantes sont présentes dans **"Redirect URLs"** :
   - `https://flooowtest.netlify.app/**`
   - `https://flooowtest.netlify.app/auth/callback`
   - `http://localhost:8080/**` (pour le développement local)

---

## Test

1. Aller sur `https://flooowtest.netlify.app`
2. Cliquer sur **"Se connecter"** ou **"S'inscrire"**
3. Cliquer sur **"Continuer avec LinkedIn"**
4. S'authentifier avec LinkedIn
5. Vérifier que la redirection vers `/home` fonctionne et que l'utilisateur est connecté

---

## Résolution de problèmes

### Erreur "provider is not enabled"
- Vérifier que LinkedIn (OIDC) est activé dans Supabase Dashboard → Providers

### Erreur "redirect_uri_mismatch"
- Vérifier que l'URL `https://kbrgwezkjaakoecispom.supabase.co/auth/v1/callback` est bien configurée dans LinkedIn Developer Portal

### L'utilisateur n'est pas connecté après OAuth
- Vérifier que la route `/auth/callback` existe dans l'application
- Consulter les logs de la console navigateur pour les erreurs `[Auth]`

---

## Pourquoi LinkedIn/Google/Facebook affichent le domaine Supabase ?

Avec Supabase-hosted OAuth, l'origin qui initie la demande OAuth est `https://kbrgwezkjaakoecispom.supabase.co`. C'est ce domaine que les providers affichent dans leur écran de consentement.

**Options pour améliorer le branding :**
1. **Renommer l'app** dans chaque console provider (améliore le nom affiché, mais pas l'origin)
2. **Domaine custom Supabase Auth** (nécessite plan Pro Supabase)
3. **Proxy OAuth** sur le domaine Flooow (solution complexe à implémenter)

Pour l'instant, le nom de l'application ("Flooow Connect" / "Inklusif Flooow") s'affiche correctement, seul le domaine technique reste visible.

---

## Références

- [Supabase LinkedIn Auth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-linkedin-oidc)
- [LinkedIn Developer Documentation](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2)
