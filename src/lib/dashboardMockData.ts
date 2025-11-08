/**
 * Données mock cohérentes pour le dashboard collectivités
 * Tous les chiffres sont cohérents entre eux et réalistes pour Saint-Étienne Métropole
 */

export interface TerritoryData {
  id: string;
  name: string;
  // Synthèse
  total_inscrits: number;
  total_structures: number;
  total_activites: number;
  taux_remplissage_moyen: number; // %
  taux_non_recours_estime: number; // %
  
  // Accès & Équité
  enfants_qpv: number;
  taux_qpv: number; // %
  enfants_handicap: number;
  taux_handicap: number; // %
  filles: number;
  garcons: number;
  taux_filles: number; // %
  
  // CSP (répartition socio-professionnelle)
  csp_tres_modestes: number; // QF < 500
  csp_modestes: number; // QF 500-1000
  csp_intermediaires: number; // QF 1000-1500
  csp_aisees: number; // QF > 1500
  
  // Parcours & Assiduité
  taux_abandon: number; // %
  nb_abandons: number;
  nb_moyen_activites_par_enfant: number;
  
  // Répartition par univers
  univers_sport: number;
  univers_culture: number;
  univers_loisirs: number;
  univers_vacances: number;
  univers_scolaire: number;
  
  // Aides & Finances
  familles_aidees: number;
  familles_eligibles: number;
  aide_moyenne: number; // euros
  reste_a_charge_moyen: number; // euros
  
  // Capacités & Remplissage
  places_disponibles: number;
  places_occupees: number;
  
  // Mobilité
  transport_bus: number;
  transport_velo: number;
  transport_voiture: number;
  transport_covoiturage: number;
  transport_marche: number;
  abandons_mobilite: number;
}

export interface EvolutionData {
  mois: string;
  la_ricamarie: number;
  grand_clos: number;
  cret_de_roch: number;
  total: number;
}

export interface EvolutionByActivityData {
  mois: string;
  sport: number;
  culture: number;
  loisirs: number;
  vacances: number;
  scolaire: number;
}

export interface GenderEvolutionData {
  mois: string;
  filles: number;
  garcons: number;
}

export interface Structure {
  nom: string;
  territoire: string;
  type: string;
  enfants_3_10: number;
  ados_11_17: number;
  capacite_totale: number;
  taux_remplissage: number;
}

export interface AgeGroupData {
  tranche: string;
  nombre: number;
}

// DONNÉES COHÉRENTES POUR LES 3 TERRITOIRES
export const territoriesData: Record<string, TerritoryData> = {
  la_ricamarie: {
    id: "la_ricamarie",
    name: "La Ricamarie",
    
    // Synthèse
    total_inscrits: 156,
    total_structures: 8,
    total_activites: 34,
    taux_remplissage_moyen: 78,
    taux_non_recours_estime: 24,
    
    // Accès & Équité
    enfants_qpv: 117, // 75% de 156
    taux_qpv: 75.0,
    enfants_handicap: 19, // 12.2% de 156
    taux_handicap: 12.2,
    filles: 71, // 45.5% de 156
    garcons: 85, // 54.5% de 156
    taux_filles: 45.5,
    
    // CSP
    csp_tres_modestes: 62, // 40% de 156
    csp_modestes: 56, // 36% de 156
    csp_intermediaires: 28, // 18% de 156
    csp_aisees: 10, // 6% de 156
    
    // Parcours & Assiduité
    taux_abandon: 8.3,
    nb_abandons: 13,
    nb_moyen_activites_par_enfant: 1.4,
    
    // Répartition par univers
    univers_sport: 68, // 43.6%
    univers_culture: 39, // 25%
    univers_loisirs: 28, // 18%
    univers_vacances: 15, // 9.6%
    univers_scolaire: 6, // 3.8%
    
    // Aides & Finances
    familles_aidees: 102, // 65.4% de 156
    familles_eligibles: 134, // 85.9% de 156
    aide_moyenne: 145,
    reste_a_charge_moyen: 68,
    
    // Capacités
    places_disponibles: 200,
    places_occupees: 156,
    
    // Mobilité
    transport_bus: 91, // 58.3%
    transport_velo: 19, // 12.2%
    transport_voiture: 31, // 19.9%
    transport_covoiturage: 9, // 5.8%
    transport_marche: 6, // 3.8%
    abandons_mobilite: 8
  },
  
  grand_clos: {
    id: "grand_clos",
    name: "Grand Clos / Côte-Chaude",
    
    // Synthèse
    total_inscrits: 218,
    total_structures: 6,
    total_activites: 28,
    taux_remplissage_moyen: 94,
    taux_non_recours_estime: 18,
    
    // Accès & Équité
    enfants_qpv: 172, // 79% de 218
    taux_qpv: 78.9,
    enfants_handicap: 28, // 12.8% de 218
    taux_handicap: 12.8,
    filles: 96, // 44% de 218
    garcons: 122, // 56% de 218
    taux_filles: 44.0,
    
    // CSP
    csp_tres_modestes: 96, // 44% de 218
    csp_modestes: 74, // 34% de 218
    csp_intermediaires: 35, // 16% de 218
    csp_aisees: 13, // 6% de 218
    
    // Parcours & Assiduité
    taux_abandon: 10.1,
    nb_abandons: 22,
    nb_moyen_activites_par_enfant: 1.3,
    
    // Répartition par univers
    univers_sport: 98, // 45%
    univers_culture: 52, // 24%
    univers_loisirs: 39, // 18%
    univers_vacances: 20, // 9%
    univers_scolaire: 9, // 4%
    
    // Aides & Finances
    familles_aidees: 157, // 72% de 218
    familles_eligibles: 189, // 87% de 218
    aide_moyenne: 168,
    reste_a_charge_moyen: 52,
    
    // Capacités
    places_disponibles: 232,
    places_occupees: 218,
    
    // Mobilité
    transport_bus: 157, // 72%
    transport_velo: 17, // 7.8%
    transport_voiture: 31, // 14.2%
    transport_covoiturage: 9, // 4.1%
    transport_marche: 4, // 1.9%
    abandons_mobilite: 14
  },
  
  cret_de_roch: {
    id: "cret_de_roch",
    name: "Crêt de Roch",
    
    // Synthèse
    total_inscrits: 134,
    total_structures: 9,
    total_activites: 38,
    taux_remplissage_moyen: 71,
    taux_non_recours_estime: 31,
    
    // Accès & Équité
    enfants_qpv: 90, // 67.2% de 134
    taux_qpv: 67.2,
    enfants_handicap: 16, // 11.9% de 134
    taux_handicap: 11.9,
    filles: 64, // 47.8% de 134
    garcons: 70, // 52.2% de 134
    taux_filles: 47.8,
    
    // CSP
    csp_tres_modestes: 47, // 35% de 134
    csp_modestes: 48, // 36% de 134
    csp_intermediaires: 27, // 20% de 134
    csp_aisees: 12, // 9% de 134
    
    // Parcours & Assiduité
    taux_abandon: 11.9,
    nb_abandons: 16,
    nb_moyen_activites_par_enfant: 1.5,
    
    // Répartition par univers
    univers_sport: 57, // 42.5%
    univers_culture: 36, // 27%
    univers_loisirs: 23, // 17%
    univers_vacances: 12, // 9%
    univers_scolaire: 6, // 4.5%
    
    // Aides & Finances
    familles_aidees: 85, // 63.4% de 134
    familles_eligibles: 110, // 82% de 134
    aide_moyenne: 132,
    reste_a_charge_moyen: 78,
    
    // Capacités
    places_disponibles: 189,
    places_occupees: 134,
    
    // Mobilité
    transport_bus: 64, // 47.8%
    transport_velo: 24, // 17.9%
    transport_voiture: 32, // 23.9%
    transport_covoiturage: 10, // 7.5%
    transport_marche: 4, // 2.9%
    abandons_mobilite: 11
  }
};

// DONNÉES D'ÉVOLUTION SUR 12 MOIS (cohérent avec les totaux)
export const evolutionData: EvolutionData[] = [
  { mois: "Nov 2024", la_ricamarie: 142, grand_clos: 198, cret_de_roch: 121, total: 461 },
  { mois: "Déc 2024", la_ricamarie: 145, grand_clos: 201, cret_de_roch: 124, total: 470 },
  { mois: "Jan 2025", la_ricamarie: 148, grand_clos: 205, cret_de_roch: 127, total: 480 },
  { mois: "Fév 2025", la_ricamarie: 150, grand_clos: 208, cret_de_roch: 129, total: 487 },
  { mois: "Mar 2025", la_ricamarie: 152, grand_clos: 211, cret_de_roch: 131, total: 494 },
  { mois: "Avr 2025", la_ricamarie: 154, grand_clos: 214, cret_de_roch: 132, total: 500 },
  { mois: "Mai 2025", la_ricamarie: 155, grand_clos: 216, cret_de_roch: 133, total: 504 },
  { mois: "Juin 2025", la_ricamarie: 156, grand_clos: 217, cret_de_roch: 133, total: 506 },
  { mois: "Juil 2025", la_ricamarie: 156, grand_clos: 218, cret_de_roch: 134, total: 508 },
  { mois: "Août 2025", la_ricamarie: 156, grand_clos: 218, cret_de_roch: 134, total: 508 },
  { mois: "Sep 2025", la_ricamarie: 156, grand_clos: 218, cret_de_roch: 134, total: 508 },
  { mois: "Oct 2025", la_ricamarie: 156, grand_clos: 218, cret_de_roch: 134, total: 508 }
];

// ÉVOLUTION PAR ACTIVITÉ (dynamique réaliste avec hausses vacances et baisse hivernale)
export const evolutionByActivityMetropole: EvolutionByActivityData[] = [
  { mois: "Sep 2024", sport: 195, culture: 110, loisirs: 75, vacances: 35, scolaire: 18 },
  { mois: "Oct 2024", sport: 200, culture: 112, loisirs: 78, vacances: 38, scolaire: 19 },
  { mois: "Nov 2024", sport: 205, culture: 115, loisirs: 80, vacances: 40, scolaire: 19 },
  { mois: "Déc 2024", sport: 203, culture: 117, loisirs: 82, vacances: 42, scolaire: 20 },
  { mois: "Jan 2025", sport: 198, culture: 113, loisirs: 79, vacances: 39, scolaire: 19 }, // baisse hivernale
  { mois: "Fév 2025", sport: 202, culture: 116, loisirs: 81, vacances: 45, scolaire: 20 }, // rebond vacances hiver
  { mois: "Mar 2025", sport: 207, culture: 118, loisirs: 83, vacances: 43, scolaire: 20 },
  { mois: "Avr 2025", sport: 210, culture: 120, loisirs: 85, vacances: 46, scolaire: 21 }, // hausse vacances printemps
  { mois: "Mai 2025", sport: 213, culture: 122, loisirs: 87, vacances: 44, scolaire: 21 },
  { mois: "Juin 2025", sport: 216, culture: 124, loisirs: 88, vacances: 45, scolaire: 21 },
  { mois: "Juil 2025", sport: 220, culture: 126, loisirs: 89, vacances: 48, scolaire: 21 }, // hausse vacances été
  { mois: "Août 2025", sport: 223, culture: 127, loisirs: 90, vacances: 47, scolaire: 21 }
];

export const evolutionByActivityLaRicamarie: EvolutionByActivityData[] = [
  { mois: "Sep 2024", sport: 60, culture: 34, loisirs: 23, vacances: 12, scolaire: 5 },
  { mois: "Oct 2024", sport: 62, culture: 35, loisirs: 24, vacances: 13, scolaire: 5 },
  { mois: "Nov 2024", sport: 64, culture: 36, loisirs: 25, vacances: 13, scolaire: 5 },
  { mois: "Déc 2024", sport: 63, culture: 37, loisirs: 26, vacances: 14, scolaire: 6 },
  { mois: "Jan 2025", sport: 61, culture: 35, loisirs: 24, vacances: 13, scolaire: 5 },
  { mois: "Fév 2025", sport: 63, culture: 36, loisirs: 25, vacances: 15, scolaire: 6 },
  { mois: "Mar 2025", sport: 65, culture: 37, loisirs: 26, vacances: 14, scolaire: 6 },
  { mois: "Avr 2025", sport: 66, culture: 38, loisirs: 27, vacances: 15, scolaire: 6 },
  { mois: "Mai 2025", sport: 67, culture: 38, loisirs: 27, vacances: 14, scolaire: 6 },
  { mois: "Juin 2025", sport: 68, culture: 39, loisirs: 28, vacances: 15, scolaire: 6 },
  { mois: "Juil 2025", sport: 68, culture: 39, loisirs: 28, vacances: 15, scolaire: 6 },
  { mois: "Août 2025", sport: 68, culture: 39, loisirs: 28, vacances: 15, scolaire: 6 }
];

export const evolutionByActivityGrandClos: EvolutionByActivityData[] = [
  { mois: "Sep 2024", sport: 86, culture: 45, loisirs: 32, vacances: 15, scolaire: 8 },
  { mois: "Oct 2024", sport: 88, culture: 46, loisirs: 34, vacances: 16, scolaire: 8 },
  { mois: "Nov 2024", sport: 90, culture: 47, loisirs: 35, vacances: 17, scolaire: 8 },
  { mois: "Déc 2024", sport: 89, culture: 48, loisirs: 36, vacances: 18, scolaire: 9 },
  { mois: "Jan 2025", sport: 87, culture: 46, loisirs: 34, vacances: 16, scolaire: 8 },
  { mois: "Fév 2025", sport: 90, culture: 48, loisirs: 36, vacances: 19, scolaire: 9 },
  { mois: "Mar 2025", sport: 92, culture: 49, loisirs: 37, vacances: 18, scolaire: 9 },
  { mois: "Avr 2025", sport: 94, culture: 50, loisirs: 38, vacances: 20, scolaire: 9 },
  { mois: "Mai 2025", sport: 96, culture: 51, loisirs: 38, vacances: 19, scolaire: 9 },
  { mois: "Juin 2025", sport: 97, culture: 51, loisirs: 39, vacances: 19, scolaire: 9 },
  { mois: "Juil 2025", sport: 98, culture: 52, loisirs: 39, vacances: 20, scolaire: 9 },
  { mois: "Août 2025", sport: 98, culture: 52, loisirs: 39, vacances: 20, scolaire: 9 }
];

export const evolutionByActivityCretDeRoch: EvolutionByActivityData[] = [
  { mois: "Sep 2024", sport: 49, culture: 31, loisirs: 20, vacances: 8, scolaire: 5 },
  { mois: "Oct 2024", sport: 50, culture: 31, loisirs: 20, vacances: 9, scolaire: 6 },
  { mois: "Nov 2024", sport: 51, culture: 32, loisirs: 20, vacances: 10, scolaire: 6 },
  { mois: "Déc 2024", sport: 51, culture: 32, loisirs: 20, vacances: 10, scolaire: 5 },
  { mois: "Jan 2025", sport: 50, culture: 32, loisirs: 21, vacances: 10, scolaire: 6 },
  { mois: "Fév 2025", sport: 49, culture: 32, loisirs: 20, vacances: 11, scolaire: 5 },
  { mois: "Mar 2025", sport: 50, culture: 32, loisirs: 20, vacances: 11, scolaire: 5 },
  { mois: "Avr 2025", sport: 50, culture: 32, loisirs: 20, vacances: 11, scolaire: 6 },
  { mois: "Mai 2025", sport: 50, culture: 33, loisirs: 22, vacances: 11, scolaire: 6 },
  { mois: "Juin 2025", sport: 51, culture: 34, loisirs: 21, vacances: 11, scolaire: 6 },
  { mois: "Juil 2025", sport: 54, culture: 35, loisirs: 22, vacances: 13, scolaire: 6 },
  { mois: "Août 2025", sport: 57, culture: 36, loisirs: 23, vacances: 12, scolaire: 6 }
];

// ÉVOLUTION FILLES/GARÇONS (avec baisse hivernale pour les filles)
export const genderEvolutionMetropole: GenderEvolutionData[] = [
  { mois: "Sep 2024", filles: 210, garcons: 223 },
  { mois: "Oct 2024", filles: 215, garcons: 232 },
  { mois: "Nov 2024", filles: 218, garcons: 241 }, // début baisse filles
  { mois: "Déc 2024", filles: 214, garcons: 246 },
  { mois: "Jan 2025", filles: 208, garcons: 241 }, // creux hivernal filles
  { mois: "Fév 2025", filles: 211, garcons: 246 }, // rebond léger
  { mois: "Mar 2025", filles: 218, garcons: 256 },
  { mois: "Avr 2025", filles: 223, garcons: 262 },
  { mois: "Mai 2025", filles: 226, garcons: 268 },
  { mois: "Juin 2025", filles: 228, garcons: 272 },
  { mois: "Juil 2025", filles: 230, garcons: 275 },
  { mois: "Août 2025", filles: 231, garcons: 277 }
];

export const genderEvolutionLaRicamarie: GenderEvolutionData[] = [
  { mois: "Sep 2024", filles: 64, garcons: 70 },
  { mois: "Oct 2024", filles: 66, garcons: 73 },
  { mois: "Nov 2024", filles: 67, garcons: 76 },
  { mois: "Déc 2024", filles: 65, garcons: 78 },
  { mois: "Jan 2025", filles: 63, garcons: 76 },
  { mois: "Fév 2025", filles: 65, garcons: 78 },
  { mois: "Mar 2025", filles: 67, garcons: 80 },
  { mois: "Avr 2025", filles: 68, garcons: 82 },
  { mois: "Mai 2025", filles: 69, garcons: 83 },
  { mois: "Juin 2025", filles: 70, garcons: 84 },
  { mois: "Juil 2025", filles: 71, garcons: 85 },
  { mois: "Août 2025", filles: 71, garcons: 85 }
];

export const genderEvolutionGrandClos: GenderEvolutionData[] = [
  { mois: "Sep 2024", filles: 82, garcons: 104 },
  { mois: "Oct 2024", filles: 85, garcons: 108 },
  { mois: "Nov 2024", filles: 87, garcons: 112 },
  { mois: "Déc 2024", filles: 84, garcons: 115 },
  { mois: "Jan 2025", filles: 81, garcons: 112 },
  { mois: "Fév 2025", filles: 84, garcons: 115 },
  { mois: "Mar 2025", filles: 88, garcons: 118 },
  { mois: "Avr 2025", filles: 91, garcons: 121 },
  { mois: "Mai 2025", filles: 93, garcons: 123 },
  { mois: "Juin 2025", filles: 94, garcons: 124 },
  { mois: "Juil 2025", filles: 95, garcons: 122 },
  { mois: "Août 2025", filles: 96, garcons: 122 }
];

export const genderEvolutionCretDeRoch: GenderEvolutionData[] = [
  { mois: "Sep 2024", filles: 64, garcons: 49 },
  { mois: "Oct 2024", filles: 64, garcons: 51 },
  { mois: "Nov 2024", filles: 64, garcons: 53 },
  { mois: "Déc 2024", filles: 65, garcons: 53 },
  { mois: "Jan 2025", filles: 64, garcons: 53 },
  { mois: "Fév 2025", filles: 62, garcons: 53 },
  { mois: "Mar 2025", filles: 63, garcons: 58 },
  { mois: "Avr 2025", filles: 64, garcons: 59 },
  { mois: "Mai 2025", filles: 64, garcons: 64 },
  { mois: "Juin 2025", filles: 64, garcons: 64 },
  { mois: "Juil 2025", filles: 64, garcons: 68 },
  { mois: "Août 2025", filles: 64, garcons: 70 }
];

// STRUCTURES PAR TERRITOIRE
export const structuresData: Structure[] = [
  // La Ricamarie
  { nom: "AS La Ricamarie", territoire: "La Ricamarie", type: "Club sportif", enfants_3_10: 32, ados_11_17: 28, capacite_totale: 80, taux_remplissage: 75 },
  { nom: "MJC La Ricamarie", territoire: "La Ricamarie", type: "MJC", enfants_3_10: 24, ados_11_17: 18, capacite_totale: 50, taux_remplissage: 84 },
  { nom: "Centre Social Ricamarie", territoire: "La Ricamarie", type: "Centre social", enfants_3_10: 18, ados_11_17: 12, capacite_totale: 35, taux_remplissage: 86 },
  { nom: "École de Musique", territoire: "La Ricamarie", type: "Structure culturelle", enfants_3_10: 15, ados_11_17: 8, capacite_totale: 30, taux_remplissage: 77 },
  { nom: "Atelier d'Arts Ricamarie", territoire: "La Ricamarie", type: "Structure culturelle", enfants_3_10: 12, ados_11_17: 6, capacite_totale: 25, taux_remplissage: 72 },
  { nom: "Judo Club Ricamarie", territoire: "La Ricamarie", type: "Club sportif", enfants_3_10: 14, ados_11_17: 9, capacite_totale: 30, taux_remplissage: 77 },
  { nom: "Soutien Scolaire Ricamarie", territoire: "La Ricamarie", type: "Accompagnement scolaire", enfants_3_10: 8, ados_11_17: 4, capacite_totale: 15, taux_remplissage: 80 },
  { nom: "Vacances Jeunes Ricamarie", territoire: "La Ricamarie", type: "Centre de vacances", enfants_3_10: 6, ados_11_17: 9, capacite_totale: 20, taux_remplissage: 75 },
  
  // Grand Clos / Côte-Chaude
  { nom: "Stade Grand Clos", territoire: "Grand Clos", type: "Club sportif", enfants_3_10: 45, ados_11_17: 38, capacite_totale: 100, taux_remplissage: 83 },
  { nom: "MJC Grand Clos", territoire: "Grand Clos", type: "MJC", enfants_3_10: 32, ados_11_17: 24, capacite_totale: 60, taux_remplissage: 93 },
  { nom: "Centre Social Côte-Chaude", territoire: "Grand Clos", type: "Centre social", enfants_3_10: 28, ados_11_17: 18, capacite_totale: 50, taux_remplissage: 92 },
  { nom: "Conservatoire Grand Clos", territoire: "Grand Clos", type: "Structure culturelle", enfants_3_10: 22, ados_11_17: 14, capacite_totale: 40, taux_remplissage: 90 },
  { nom: "Escalade Grand Clos", territoire: "Grand Clos", type: "Club sportif", enfants_3_10: 18, ados_11_17: 16, capacite_totale: 40, taux_remplissage: 85 },
  { nom: "Hip Hop Côte-Chaude", territoire: "Grand Clos", type: "Structure culturelle", enfants_3_10: 12, ados_11_17: 18, capacite_totale: 35, taux_remplissage: 86 },
  
  // Crêt de Roch
  { nom: "Complexe Sportif Crêt de Roch", territoire: "Crêt de Roch", type: "Club sportif", enfants_3_10: 28, ados_11_17: 24, capacite_totale: 65, taux_remplissage: 80 },
  { nom: "MJC Crêt de Roch", territoire: "Crêt de Roch", type: "MJC", enfants_3_10: 22, ados_11_17: 16, capacite_totale: 45, taux_remplissage: 84 },
  { nom: "Centre Social Crêt", territoire: "Crêt de Roch", type: "Centre social", enfants_3_10: 16, ados_11_17: 12, capacite_totale: 32, taux_remplissage: 88 },
  { nom: "Atelier Théâtre Crêt", territoire: "Crêt de Roch", type: "Structure culturelle", enfants_3_10: 14, ados_11_17: 8, capacite_totale: 28, taux_remplissage: 79 },
  { nom: "Club Photo Crêt de Roch", territoire: "Crêt de Roch", type: "Structure culturelle", enfants_3_10: 8, ados_11_17: 12, capacite_totale: 25, taux_remplissage: 80 },
  { nom: "Piscine Crêt de Roch", territoire: "Crêt de Roch", type: "Club sportif", enfants_3_10: 18, ados_11_17: 14, capacite_totale: 40, taux_remplissage: 80 },
  { nom: "Robotique Crêt", territoire: "Crêt de Roch", type: "Accompagnement scolaire", enfants_3_10: 12, ados_11_17: 8, capacite_totale: 25, taux_remplissage: 80 },
  { nom: "Jardinage Crêt", territoire: "Crêt de Roch", type: "Loisirs", enfants_3_10: 8, ados_11_17: 8, capacite_totale: 20, taux_remplissage: 80 },
  { nom: "Séjours Vacances Crêt", territoire: "Crêt de Roch", type: "Centre de vacances", enfants_3_10: 6, ados_11_17: 6, capacite_totale: 16, taux_remplissage: 75 }
];

// RÉPARTITION PAR TRANCHES D'ÂGE
export const ageGroupsMetropole: AgeGroupData[] = [
  { tranche: "3-6 ans", nombre: 98 },
  { tranche: "7-10 ans", nombre: 142 },
  { tranche: "11-14 ans", nombre: 176 },
  { tranche: "15-17 ans", nombre: 92 }
];

export const ageGroupsLaRicamarie: AgeGroupData[] = [
  { tranche: "3-6 ans", nombre: 28 },
  { tranche: "7-10 ans", nombre: 42 },
  { tranche: "11-14 ans", nombre: 54 },
  { tranche: "15-17 ans", nombre: 32 }
];

export const ageGroupsGrandClos: AgeGroupData[] = [
  { tranche: "3-6 ans", nombre: 42 },
  { tranche: "7-10 ans", nombre: 64 },
  { tranche: "11-14 ans", nombre: 78 },
  { tranche: "15-17 ans", nombre: 34 }
];

export const ageGroupsCretDeRoch: AgeGroupData[] = [
  { tranche: "3-6 ans", nombre: 28 },
  { tranche: "7-10 ans", nombre: 36 },
  { tranche: "11-14 ans", nombre: 44 },
  { tranche: "15-17 ans", nombre: 26 }
];

// AGRÉGAT MÉTROPOLE (somme des 3 territoires)
export const metropoleData: TerritoryData = {
  id: "metropole",
  name: "Saint-Étienne Métropole",
  
  // Synthèse (somme des 3 territoires)
  total_inscrits: 508, // 156 + 218 + 134
  total_structures: 23, // 8 + 6 + 9
  total_activites: 100, // 34 + 28 + 38
  taux_remplissage_moyen: 81, // moyenne pondérée
  taux_non_recours_estime: 24, // moyenne pondérée
  
  // Accès & Équité
  enfants_qpv: 379, // 117 + 172 + 90
  taux_qpv: 74.6, // 379/508
  enfants_handicap: 63, // 19 + 28 + 16
  taux_handicap: 12.4, // 63/508
  filles: 231, // 71 + 96 + 64
  garcons: 277, // 85 + 122 + 70
  taux_filles: 45.5, // 231/508
  
  // CSP
  csp_tres_modestes: 205, // 62 + 96 + 47
  csp_modestes: 178, // 56 + 74 + 48
  csp_intermediaires: 90, // 28 + 35 + 27
  csp_aisees: 35, // 10 + 13 + 12
  
  // Parcours & Assiduité
  taux_abandon: 10.0, // moyenne pondérée
  nb_abandons: 51, // 13 + 22 + 16
  nb_moyen_activites_par_enfant: 1.4, // moyenne
  
  // Répartition par univers
  univers_sport: 223, // 68 + 98 + 57
  univers_culture: 127, // 39 + 52 + 36
  univers_loisirs: 90, // 28 + 39 + 23
  univers_vacances: 47, // 15 + 20 + 12
  univers_scolaire: 21, // 6 + 9 + 6
  
  // Aides & Finances
  familles_aidees: 344, // 102 + 157 + 85
  familles_eligibles: 433, // 134 + 189 + 110
  aide_moyenne: 152, // moyenne pondérée
  reste_a_charge_moyen: 66, // moyenne pondérée
  
  // Capacités
  places_disponibles: 621, // 200 + 232 + 189
  places_occupees: 508,
  
  // Mobilité
  transport_bus: 312, // 91 + 157 + 64
  transport_velo: 60, // 19 + 17 + 24
  transport_voiture: 94, // 31 + 31 + 32
  transport_covoiturage: 28, // 9 + 9 + 10
  transport_marche: 14, // 6 + 4 + 4
  abandons_mobilite: 33 // 8 + 14 + 11
};
