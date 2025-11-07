/**
 * Mapping intelligent des images d'activités
 * Attribution automatique selon thématique + tranche d'âge
 */

import activitySport from "@/assets/activity-sport.jpg";
import activityLoisirs from "@/assets/activity-loisirs.jpg";
import activityVacances from "@/assets/activity-vacances.jpg";
import activityCulture from "@/assets/activity-culture.jpg";

// Images spécifiques par activité ET âge
import activityArts69 from "@/assets/activity-arts-6-9.jpg";
import activityArts1013 from "@/assets/activity-arts-10-13.jpg";
import activityCamp1013 from "@/assets/activity-camp-10-13.jpg";
import activityCode1013 from "@/assets/activity-code-10-13.jpg";
import activityCuisine69 from "@/assets/activity-cuisine-6-9.jpg";
import activityEscalade1417 from "@/assets/activity-escalade-14-17.jpg";
import activityHiphop1417 from "@/assets/activity-hiphop-14-17.jpg";
import activityJardinage1013 from "@/assets/activity-jardinage-10-13.jpg";
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

/**
 * Détermine l'image la plus appropriée pour une activité
 * selon son titre, thème et tranche d'âge
 */
export function getActivityImage(
  title: string,
  theme: string,
  ageMin: number = 6,
  ageMax: number = 17
): string {
  const titleLower = title.toLowerCase();
  const themeLower = theme.toLowerCase();
  const avgAge = (ageMin + ageMax) / 2;

  // Mapping par mots-clés spécifiques + âge
  
  // SPORT
  if (titleLower.includes('football') || titleLower.includes('foot') || titleLower.includes('asse')) {
    return avgAge <= 9 ? activityStageFoot69 : activityMultisports1013;
  }
  
  if (titleLower.includes('judo')) {
    return avgAge <= 9 ? activityJudo69 : activityJudoKids;
  }
  
  if (titleLower.includes('escalade') || titleLower.includes('grimpe')) {
    return activityEscalade1417;
  }
  
  if (titleLower.includes('natation') || titleLower.includes('piscine') || titleLower.includes('nautique')) {
    return activityNatation69;
  }
  
  if (titleLower.includes('hip-hop') || titleLower.includes('danse')) {
    return activityHiphop1417;
  }
  
  if (titleLower.includes('multisport') || titleLower.includes('basket') || titleLower.includes('tennis') || titleLower.includes('rugby')) {
    return avgAge <= 9 ? activityStageFoot69 : activityMultisports1013;
  }

  // CULTURE
  if (titleLower.includes('musique') || titleLower.includes('piano') || titleLower.includes('guitare') || titleLower.includes('chant')) {
    return activityMusique69;
  }
  
  if (titleLower.includes('théâtre') || titleLower.includes('theater') || titleLower.includes('scène')) {
    return activityTheatre69;
  }
  
  if (titleLower.includes('arts') || titleLower.includes('dessin') || titleLower.includes('peinture')) {
    return avgAge <= 9 ? activityArts69 : activityArts1013;
  }
  
  if (titleLower.includes('photo') || titleLower.includes('vidéo') || titleLower.includes('cinéma')) {
    return activityPhoto1417;
  }

  // LOISIRS / TECHNOLOGIE
  if (titleLower.includes('robotique') || titleLower.includes('code') || titleLower.includes('programmation') || titleLower.includes('numérique')) {
    return avgAge <= 13 ? activityCode1013 : activityRobotique1013;
  }
  
  if (titleLower.includes('cuisine') || titleLower.includes('chef') || titleLower.includes('culinaire')) {
    return activityCuisine69;
  }
  
  if (titleLower.includes('jardin') || titleLower.includes('nature') || titleLower.includes('écologie')) {
    return activityJardinage1013;
  }
  
  if (titleLower.includes('jeux') || titleLower.includes('ludothèque') || titleLower.includes('échecs')) {
    return activityJeux69;
  }

  // VACANCES / SÉJOURS
  if (titleLower.includes('séjour') || titleLower.includes('colonie') || titleLower.includes('camp')) {
    return avgAge <= 13 ? activityCamp1013 : activitySejour1417;
  }
  
  if (titleLower.includes('centre de loisirs') || titleLower.includes('accueil de loisirs')) {
    return avgAge <= 9 ? activityJeux69 : activityCamp1013;
  }

  // SCOLARITÉ / SOUTIEN
  if (titleLower.includes('soutien') || titleLower.includes('aide aux devoirs') || titleLower.includes('cours') || titleLower.includes('tutorat')) {
    return activitySoutien69;
  }

  // Fallback par thème général
  if (themeLower.includes('sport')) {
    return activitySport;
  }
  
  if (themeLower.includes('culture')) {
    return activityCulture;
  }
  
  if (themeLower.includes('vacances')) {
    return activityVacances;
  }
  
  if (themeLower.includes('loisir')) {
    return activityLoisirs;
  }
  
  if (themeLower.includes('scolarité') || themeLower.includes('apprentissage')) {
    return activitySoutien69;
  }

  // Fallback ultime selon âge
  if (avgAge <= 9) {
    return activityJeux69;
  } else if (avgAge <= 13) {
    return activityMultisports1013;
  } else {
    return activitySejour1417;
  }
}
