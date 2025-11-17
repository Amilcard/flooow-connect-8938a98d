/**
 * Domain Types - Source unique de vérité pour les types métier
 * Utilisé par FO et BO pour garantir la cohérence
 */

export type ActivityCategory = 'Sport' | 'Culture' | 'Loisirs' | 'Scolarité' | 'Vacances';

export type PeriodType = 'annual' | 'school_holidays' | 'trimester';

export type VacationType = 'sejour_hebergement' | 'centre_loisirs' | 'stage_journee';

export type TransportMode = 'walking' | 'bus' | 'car' | 'bike' | 'covoiturage' | 'non_renseigne';

export interface AccessibilityFlags {
  wheelchair?: boolean;
  visual_impaired?: boolean;
  hearing_impaired?: boolean;
  mobility_impaired?: boolean;
}

export interface Mobility {
  TC?: string;        // Transport en commun, ex: "Ligne T3 STAS"
  velo?: boolean;     // Station vélo à proximité
  covoit?: boolean;   // Covoiturage activé
}

export interface Location {
  nom?: string;
  adresse: string;
  codePostal?: string;
  ville?: string;
  lat?: number;
  lng?: number;
}

/**
 * Type Activity - Contrat de données unifié FO/BO
 */
export interface Activity {
  id: string;
  title: string;
  image: string;
  distance?: string;
  ageRange: string;           // Format: "6-9 ans"
  ageMin?: number;            // Âge minimum numérique
  ageMax?: number;            // Âge maximum numérique
  category: ActivityCategory | string;
  categories?: string[];
  price: number;
  hasAccessibility: boolean;
  hasFinancialAid: boolean;
  periodType?: PeriodType | string;
  structureName?: string;
  structureAddress?: string;
  location?: Location;           // Geographic coordinates for map display
  vacationPeriods?: string[];
  accessibility?: AccessibilityFlags;
  mobility?: Mobility;
  description?: string;
  aidesEligibles?: string[];  // Liste simplifiée des aides
  vacationType?: VacationType; // Type d'accueil vacances
  priceUnit?: string;          // Unité du prix (par semaine, par jour, par an, etc.)
  durationDays?: number;       // Durée en jours pour les séjours/stages
  hasAccommodation?: boolean;  // Hébergement inclus ou non
}

/**
 * Type pour les données brutes issues de sources externes
 * (Edge Function mock-activities, API, etc.)
 */
export interface ActivityRaw {
  id: string;
  theme?: string;
  titre?: string;
  title?: string;
  description?: string;
  ageMin?: number;
  ageMax?: number;
  age_min?: number;
  age_max?: number;
  cout?: number;
  price?: number;
  price_base?: number;
  lieu?: {
    nom?: string;
    adresse?: string;
    transport?: string;
  };
  accessibilite?: string[];
  accessibility_checklist?: AccessibilityFlags;
  aidesEligibles?: string[];
  accepts_aid_types?: any[];
  mobilite?: Mobility;
  category?: string;
  categories?: string[];
  period_type?: string;
  vacation_periods?: string[];
  images?: string[];
  structures?: {
    name?: string;
    address?: string;
    location_lat?: number;     // PostGIS lat from structures.location
    location_lng?: number;     // PostGIS lng from structures.location
  };
  covoiturage_enabled?: boolean;
  vacationType?: VacationType;
  priceUnit?: string;
  durationDays?: number;
  hasAccommodation?: boolean;
}
