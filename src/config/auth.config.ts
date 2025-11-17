/**
 * Configuration de l'authentification
 *
 * Pour réactiver l'authentification sociale, modifier ENABLE_SOCIAL_AUTH à true
 */

export const authConfig = {
  /**
   * Active/désactive l'authentification via réseaux sociaux
   *
   * @default false - Désactivé pour la phase de tests beta
   *
   * Providers supportés : Google, Facebook, LinkedIn, Apple
   */
  ENABLE_SOCIAL_AUTH: false,
} as const;
