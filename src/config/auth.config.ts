/**
 * Configuration de l'authentification
 *
 * OAuth providers supportés par Supabase Auth
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
   */
  OAUTH_PROVIDERS: [
    { id: 'google', name: 'Google', label: 'Continuer avec Google', enabled: true, priority: 1 },
    { id: 'apple', name: 'Apple', label: 'Continuer avec Apple', enabled: false, priority: 2 },
    { id: 'facebook', name: 'Facebook', label: 'Continuer avec Facebook', enabled: true, priority: 3 },
    { id: 'linkedin_oidc', name: 'LinkedIn', label: 'Continuer avec LinkedIn', enabled: false, priority: 4 },
    { id: 'azure', name: 'Microsoft', label: 'Continuer avec Microsoft', enabled: false, priority: 5 },
  ] as OAuthProviderConfig[],

  /**
   * URL de redirection après authentification OAuth
   */
  getRedirectUrl: () => `${window.location.origin}/`,
} as const;
