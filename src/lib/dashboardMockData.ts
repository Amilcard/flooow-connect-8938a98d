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
