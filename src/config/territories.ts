/**
 * Configuration territoriale centralisée
 * Utilisé pour les vues carte par défaut et les prompts utilisateur
 *
 * IMPORTANT: Aucune ville par défaut - l'app est nationale
 */

// Vue France métropolitaine (centre géographique)
export const DEFAULT_FRANCE_VIEW = {
  center: { lat: 46.603354, lng: 1.888334 },
  zoom: 5,
};

// Zoom par défaut quand une ville est sélectionnée
export const DEFAULT_CITY_ZOOM = 12;

// Zoom par défaut pour une recherche locale
export const DEFAULT_LOCAL_ZOOM = 14;

// Messages UI
export const CITY_PROMPT_TEXT = "Renseignez votre ville pour afficher la carte autour de vous.";
export const CITY_NOT_FOUND_TEXT = "Ville introuvable, essayez un code postal.";

// Placeholder pour les champs ville
export const CITY_PLACEHOLDER = "Ma ville";
export const POSTAL_PLACEHOLDER = "Code postal";
