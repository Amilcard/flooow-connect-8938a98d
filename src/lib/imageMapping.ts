/**
 * Mapping intelligent des images d'activités
 * Attribution automatique selon thématique + tranche d'âge
 * AUDIT: Migration vers WebP pour les images optimisées
 */

// Images génériques par catégorie (WebP optimisées)
import activitySport from "@/assets/activity-sport.webp";
import activityLoisirs from "@/assets/activity-loisirs.webp";
import activityVacances from "@/assets/activity-vacances.jpg";
import activityCulture from "@/assets/activity-culture.jpg";

// Images spécifiques par activité ET âge
import activityArts69 from "@/assets/activity-arts-6-9.jpg";
import activityArts1013 from "@/assets/activity-arts-10-13.jpg";
import activityCamp1013 from "@/assets/activity-camp-10-13.webp";
import activityCode1013 from "@/assets/activity-code-10-13.jpg";
import activityCuisine69 from "@/assets/activity-cuisine-6-9.jpg";
import activityEscalade1417 from "@/assets/activity-escalade-14-17.jpg";
import activityHiphop1417 from "@/assets/activity-hiphop-14-17.jpg";
import activityJardinage1013 from "@/assets/activity-jardinage-10-13.webp";
import activityJeux69 from "@/assets/activity-jeux-6-9.jpg";
import activityJudo69 from "@/assets/activity-judo-6-9.jpg";
import activityJudoKids from "@/assets/activity-judo-kids.jpg";
import activityMultisports1013 from "@/assets/activity-multisports-10-13.jpg";
import activityMusique69 from "@/assets/activity-musique-6-9.jpg";
import activityNatation69 from "@/assets/activity-natation-6-9.jpg";
import activityPhoto1417 from "@/assets/activity-photo-14-17.jpg";
import activityRobotique1013 from "@/assets/activity-robotique-10-13.jpg";
import activitySejour1417 from "@/assets/activity-sejour-14-17.jpg";
import activitySoutien69 from "@/assets/activity-soutien-6-9.jpg";
import activityStageFoot69 from "@/assets/activity-stage-foot-6-9.jpg";
import activityTheatre69 from "@/assets/activity-theatre-6-9.jpg";

// Keyword-to-image mappings for reduced cognitive complexity
type ImageMapper = { keywords: string[]; getImage: (avgAge: number) => string };

const TITLE_MAPPINGS: ImageMapper[] = [
  // SPORT
  { keywords: ['football', 'foot', 'asse'], getImage: (age) => age <= 9 ? activityStageFoot69 : activityMultisports1013 },
  { keywords: ['judo'], getImage: (age) => age <= 9 ? activityJudo69 : activityJudoKids },
  { keywords: ['escalade', 'grimpe'], getImage: () => activityEscalade1417 },
  { keywords: ['natation', 'piscine', 'nautique'], getImage: () => activityNatation69 },
  { keywords: ['hip-hop', 'danse'], getImage: () => activityHiphop1417 },
  { keywords: ['multisport', 'basket', 'tennis', 'rugby'], getImage: (age) => age <= 9 ? activityStageFoot69 : activityMultisports1013 },
  // CULTURE
  { keywords: ['musique', 'piano', 'guitare', 'chant'], getImage: () => activityMusique69 },
  { keywords: ['théâtre', 'theater', 'scène'], getImage: () => activityTheatre69 },
  { keywords: ['arts', 'dessin', 'peinture'], getImage: (age) => age <= 9 ? activityArts69 : activityArts1013 },
  { keywords: ['photo', 'vidéo', 'cinéma'], getImage: () => activityPhoto1417 },
  // LOISIRS / TECHNOLOGIE
  { keywords: ['robotique', 'code', 'programmation', 'numérique'], getImage: (age) => age <= 13 ? activityCode1013 : activityRobotique1013 },
  { keywords: ['cuisine', 'chef', 'culinaire'], getImage: () => activityCuisine69 },
  { keywords: ['jardin', 'nature', 'écologie'], getImage: () => activityJardinage1013 },
  { keywords: ['jeux', 'ludothèque', 'échecs'], getImage: () => activityJeux69 },
  // VACANCES / SÉJOURS
  { keywords: ['séjour', 'colonie', 'camp'], getImage: (age) => age <= 13 ? activityCamp1013 : activitySejour1417 },
  { keywords: ['centre de loisirs', 'accueil de loisirs'], getImage: (age) => age <= 9 ? activityJeux69 : activityCamp1013 },
  // SCOLARITÉ
  { keywords: ['soutien', 'aide aux devoirs', 'cours', 'tutorat'], getImage: () => activitySoutien69 },
];

const THEME_FALLBACKS: Record<string, string> = {
  sport: activitySport,
  culture: activityCulture,
  vacances: activityVacances,
  loisir: activityLoisirs,
  scolarité: activitySoutien69,
  apprentissage: activitySoutien69,
};

function getImageByAge(avgAge: number): string {
  if (avgAge <= 9) return activityJeux69;
  if (avgAge <= 13) return activityMultisports1013;
  return activitySejour1417;
}

/**
 * Détermine l'image la plus appropriée pour une activité
 * selon son titre, thème et tranche d'âge
 */
export function getActivityImage(
  title: string,
  theme: string,
  ageMin = 6,
  ageMax = 17
): string {
  const titleLower = title.toLowerCase();
  const themeLower = theme.toLowerCase();
  const avgAge = (ageMin + ageMax) / 2;

  // Check title keywords
  const titleMatch = TITLE_MAPPINGS.find(mapping =>
    mapping.keywords.some(kw => titleLower.includes(kw))
  );
  if (titleMatch) return titleMatch.getImage(avgAge);

  // Fallback by theme
  const themeMatch = Object.entries(THEME_FALLBACKS).find(([key]) =>
    themeLower.includes(key)
  );
  if (themeMatch) return themeMatch[1];

  // Ultimate fallback by age
  return getImageByAge(avgAge);
}
