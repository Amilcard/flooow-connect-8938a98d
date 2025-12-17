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
  paymentEchelonned?: boolean;  // Paiement échelonné disponible
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
  dateDebut?: string;          // Date de début (YYYY-MM-DD)
  dateFin?: string;            // Date de fin (YYYY-MM-DD)
  joursHoraires?: string;      // Jours et horaires (scolaire)
  creneaux?: TimeSlot[];       // Créneaux structurés
  sessions?: string;           // Sessions (vacances)
  hasAccommodation?: boolean;  // Hébergement inclus ou non
  price_is_free?: boolean;     // Indicateur activité gratuite
  // Champs enrichis
  lieuNom?: string;            // Nom du lieu distinct de l'organisme
  transportInfo?: string;      // Info transport en commun
  santeTags?: string[];        // Ex: ["Certificat médical requis"]
  prerequis?: string[];        // Ex: ["Savoir nager"]
  piecesAFournir?: string[];   // Ex: ["Photo d'identité", "Certificat médical"]
  
  // Champs organisateur dénormalisés (depuis Supabase)
  organism_id?: string;
  organism_name?: string;
  organism_type?: string;
  organism_phone?: string;
  organism_email?: string;
  organism_website?: string;
}

/**
 * Type pour les créneaux structurés
 */
export interface TimeSlot {
  jour: string;      // Ex: "mercredi"
  debut: string;     // Ex: "14:00"
  fin: string;       // Ex: "16:00"
}

/**
 * Type pour les données brutes issues de sources externes
 * (Edge Function mock-activities, API, Supabase)
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
  price_unit?: string;
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
    city?: string;
    postal_code?: string;
    location_lat?: number;     // PostGIS lat from structures.location
    location_lng?: number;     // PostGIS lng from structures.location
  };
  covoiturage_enabled?: boolean;
  vacationType?: VacationType;
  priceUnit?: string;
  durationDays?: number;
  hasAccommodation?: boolean;
  // Dates et horaires
  date_debut?: string;
  date_fin?: string;
  jours_horaires?: string;
<<<<<<< Updated upstream
  creneaux?: TimeSlot[];  // JSON array of time slots
  sessions?: string;
  lieuNom?: string;        // Lieu de RDV pour séjours vacances
=======
  creneaux?: any[];  // JSON array of time slots
  sessions?: any;
>>>>>>> Stashed changes
  // Santé et prérequis
  santeTags?: string[];
  prerequis?: string[];
  pieces?: string[];
}
