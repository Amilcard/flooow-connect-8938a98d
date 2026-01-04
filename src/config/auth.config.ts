/**
 * Configuration de l'authentification
 *
 * OAuth providers supportés par Supabase Auth
 *
 * IMPORTANT - Configuration Supabase requise :
 * 1. Dashboard → Authentication → URL Configuration :
 *    - Site URL: https://flooowtest.netlify.app
 *    - Additional Redirect URLs:
 *      - https://flooowtest.netlify.app/**
 *      - https://flooowtest.netlify.app/auth/callback
 *      - http://localhost:8080/**
 *
 * 2. Dashboard → Authentication → Providers :
 *    - Google: Enabled + Client ID/Secret de Google Cloud Console
 *    - Facebook: Enabled + App ID/Secret de Meta for Developers
 *    - LinkedIn: Enabled + Client ID/Secret de LinkedIn Developer
 *
 * 0. Google Identity (flux direct, sans redirection Supabase) :
 *    - Ajouter VITE_GOOGLE_CLIENT_ID dans .env (OAuth Web client)
 *    - Google Cloud Console → Authorized JavaScript origins : https://flooowtest.netlify.app
 *
 * 3. Google Cloud Console → OAuth 2.0 Client → Authorized redirect URIs :
 *    - https://kbrgwezkjaakoecispom.supabase.co/auth/v1/callback
 *
 * 4. Meta for Developers → Facebook Login → Valid OAuth Redirect URIs :
 *    - https://kbrgwezkjaakoecispom.supabase.co/auth/v1/callback
 *
 * 5. LinkedIn Developer → Auth → Authorized redirect URLs :
 *    - https://kbrgwezkjaakoecispom.supabase.co/auth/v1/callback
 *
 * NOTE: Pourquoi Google/Facebook affichent le domaine supabase.co ?
 * ─────────────────────────────────────────────────────────────────
 * Avec Supabase-hosted OAuth, l'origin qui initie la demande est
 * https://kbrgwezkjaakoecispom.supabase.co. C'est ce domaine que
 * les providers affichent dans leur écran de consentement.
 * Options pour améliorer le branding :
 * - Renommer l'app dans chaque console provider
 * - Utiliser un domaine custom pour Supabase Auth (plan Pro)
 * - Implémenter un proxy OAuth sur le domaine Flooow (complexe)
 */

export type OAuthProvider = 'google' | 'apple' | 'facebook' | 'linkedin_oidc' | 'azure';

export interface OAuthProviderConfig {
  id: OAuthProvider;
  name: string;
  label: string;
  enabled: boolean;
  priority: number; // Ordre d'affichage (1 = premier)
}

export const authConfig = {
  /**
   * Active/désactive l'authentification via réseaux sociaux
   * @default true - Activé pour permettre aux parents de se connecter facilement
   */
  ENABLE_SOCIAL_AUTH: true,

  /**
   * Configuration des providers OAuth
   * Ordre de priorité : Google, Apple, Facebook, LinkedIn, Microsoft
   *
   * NOTE: Si un provider retourne une erreur "provider not enabled",
   * vérifier qu'il est bien activé dans Supabase Dashboard → Providers
   */
  OAUTH_PROVIDERS: [
    { id: 'google', name: 'Google', label: 'Continuer avec Google', enabled: true, priority: 1 },
    { id: 'apple', name: 'Apple', label: 'Continuer avec Apple', enabled: false, priority: 2 },
    { id: 'facebook', name: 'Facebook', label: 'Continuer avec Facebook', enabled: true, priority: 3 },
    { id: 'linkedin_oidc', name: 'LinkedIn', label: 'Continuer avec LinkedIn', enabled: true, priority: 4 },
    { id: 'azure', name: 'Microsoft', label: 'Continuer avec Microsoft', enabled: false, priority: 5 },
  ] as OAuthProviderConfig[],

  /**
   * URL de redirection après authentification OAuth réussie
   * Pointe vers /home pour une UX cohérente
   */
  getRedirectUrl: () => `${window.location.origin}/auth/callback`,
} as const;
