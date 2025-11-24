/**
 * MOTEUR D'AIDES FINANCIÈRES FLOOOW
 * Version complète multi-critères (pas uniquement QF)
 *
 * 12 dispositifs d'aides intégrés :
 * - Nationales : Pass'Sport, Pass Culture, Pass Colo
 * - CAF : VACAF AVE/AVF, CAF Loire Temps Libre
 * - Territoriales : Pass'Région, Chèques Loisirs 42, Tarifs sociaux STE, Bonus QPV
 * - Ville : Carte BÔGE
 * - Organisateur : Réduction fratrie
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface EligibilityParams {
  // Enfant
  age: number;

  // Situation sociale (critères sociaux)
  conditions_sociales: {
    beneficie_ARS: boolean;
    beneficie_AEEH: boolean;
    beneficie_AESH: boolean;
    beneficie_bourse: boolean;
    beneficie_ASE: boolean;
  };

  // Scolarité
  statut_scolaire: 'primaire' | 'college' | 'lycee';

  // Contexte familial
  quotient_familial: number;
  nb_fratrie: number;
  allocataire_caf: boolean;

  // Géographique
  code_postal: string;
  ville: string;
  departement: number;
  est_qpv: boolean;

  // Activité
  type_activite: 'sport' | 'culture' | 'vacances' | 'loisirs';
  prix_activite: number;
  periode: 'vacances' | 'saison_scolaire';
  duree_jours?: number;
  sejour_labellise?: boolean;
}

export interface CalculatedAid {
  id: string;
  code: string;
  name: string;
  montant: number;
  eligible: boolean;
  niveau: 'national' | 'regional' | 'departemental' | 'communal' | 'caf' | 'organisateur';
  criteres_manquants?: string[];
  message?: string;
  type_montant?: 'fixe' | 'pourcentage' | 'reduction';
}

// ============================================================================
// FONCTION PRINCIPALE : CALCUL DE TOUTES LES AIDES ÉLIGIBLES
// ============================================================================

export function calculateAllEligibleAids(params: EligibilityParams): CalculatedAid[] {
  const aids: CalculatedAid[] = [];

  // 1. Pass'Sport (50€)
  const passSport = evaluatePassSport(params);
  if (passSport) aids.push(passSport);

  // 2. Pass Culture (20-30€ selon âge)
  const passCulture = evaluatePassCulture(params);
  if (passCulture) aids.push(passCulture);

  // 3. Pass Colo (200-350€ selon QF)
  const passColo = evaluatePassColo(params);
  if (passColo) aids.push(passColo);

  // 4. VACAF AVE (séjours labellisés)
  const vacafAVE = evaluateVACAFAVE(params);
  if (vacafAVE) aids.push(vacafAVE);

  // 5. VACAF AVF (aide vacances familles)
  const vacafAVF = evaluateVACAFAVF(params);
  if (vacafAVF) aids.push(vacafAVF);

  // 6. Pass'Région (30€ lycéens)
  const passRegion = evaluatePassRegion(params);
  if (passRegion) aids.push(passRegion);

  // 7. CAF Loire Temps Libre (20-80€)
  const cafLoire = evaluateCAFLoireTempsLibre(params);
  if (cafLoire) aids.push(cafLoire);

  // 8. Chèques Loisirs 42 (30€)
  const chequesLoisirs = evaluateChequesLoisirs42(params);
  if (chequesLoisirs) aids.push(chequesLoisirs);

  // 9. Tarifs sociaux Saint-Étienne (variable)
  const tarifsSTE = evaluateTarifsSociauxSaintEtienne(params);
  if (tarifsSTE) aids.push(tarifsSTE);

  // 10. Carte BÔGE (10€)
  const carteBoge = evaluateCarteBOGE(params);
  if (carteBoge) aids.push(carteBoge);

  // 11. Bonus QPV SEM (20€)
  const bonusQPV = evaluateBonusQPV(params);
  if (bonusQPV) aids.push(bonusQPV);

  // 12. Réduction fratrie (10%)
  const reductionFratrie = evaluateReductionFratrie(params);
  if (reductionFratrie) aids.push(reductionFratrie);

  return aids.filter(aid => aid.eligible);
}

// ============================================================================
// FONCTIONS D'ÉVALUATION PAR AIDE
// ============================================================================

/**
 * 1. PASS'SPORT (50€)
 * Critères : 6-17 ans + condition sociale (ARS OU AEEH OU AESH OU Bourse OU ASE)
 */
function evaluatePassSport(params: EligibilityParams): CalculatedAid | null {
  const { age, conditions_sociales, type_activite } = params;

  // Critère âge
  if (age < 6 || age > 17) {
    return {
      id: 'pass_sport',
      code: 'PASS_SPORT',
      name: "Pass'Sport",
      montant: 0,
      eligible: false,
      niveau: 'national',
      criteres_manquants: ['Âge 6-17 ans requis'],
    };
  }

  // Critère type activité
  if (type_activite !== 'sport') {
    return null; // Pas applicable
  }

  // Critère condition sociale (AU MOINS UNE)
  const aConditionSociale =
    conditions_sociales.beneficie_ARS ||
    conditions_sociales.beneficie_AEEH ||
    conditions_sociales.beneficie_AESH ||
    conditions_sociales.beneficie_bourse ||
    conditions_sociales.beneficie_ASE;

  if (!aConditionSociale) {
    return {
      id: 'pass_sport',
      code: 'PASS_SPORT',
      name: "Pass'Sport",
      montant: 0,
      eligible: false,
      niveau: 'national',
      criteres_manquants: ['Condition sociale requise (ARS, AEEH, AESH, Bourse, ASE)'],
    };
  }

  return {
    id: 'pass_sport',
    code: 'PASS_SPORT',
    name: "Pass'Sport",
    montant: Math.min(50, params.prix_activite),
    eligible: true,
    niveau: 'national',
    message: 'Aide nationale pour la rentrée sportive',
  };
}

/**
 * 2. PASS CULTURE (20-30€ selon âge)
 * Critères : 15-17 ans
 */
function evaluatePassCulture(params: EligibilityParams): CalculatedAid | null {
  const { age, type_activite } = params;

  if (age < 15 || age > 17) {
    return null;
  }

  if (type_activite !== 'culture') {
    return null;
  }

  const montants: Record<number, number> = {
    15: 20,
    16: 30,
    17: 30,
  };

  const montant = montants[age] || 0;

  return {
    id: 'pass_culture',
    code: 'PASS_CULTURE',
    name: 'Pass Culture',
    montant: Math.min(montant, params.prix_activite),
    eligible: true,
    niveau: 'national',
    message: `${montant}€ pour un jeune de ${age} ans`,
  };
}

/**
 * 3. PASS COLO (200-350€ selon QF)
 * Critères : Exactement 11 ans + QF (tranches)
 */
function evaluatePassColo(params: EligibilityParams): CalculatedAid | null {
  const { age, quotient_familial, type_activite } = params;

  if (age !== 11) {
    return null;
  }

  if (type_activite !== 'vacances') {
    return null;
  }

  let montant = 0;
  if (quotient_familial <= 200) {
    montant = 350;
  } else if (quotient_familial <= 500) {
    montant = 300;
  } else if (quotient_familial <= 700) {
    montant = 250;
  } else {
    montant = 200;
  }

  return {
    id: 'pass_colo',
    code: 'PASS_COLO',
    name: 'Pass Colo',
    montant: Math.min(montant, params.prix_activite),
    eligible: true,
    niveau: 'national',
    message: `Aide pour enfant de 11 ans (QF ${quotient_familial}€)`,
  };
}

/**
 * 4. VACAF AVE (aide vacances enfants)
 * Critères : CAF + 3-17 ans + séjour labellisé + QF ≤900
 */
function evaluateVACAFAVE(params: EligibilityParams): CalculatedAid | null {
  const { age, allocataire_caf, sejour_labellise, quotient_familial, type_activite } = params;

  if (type_activite !== 'vacances') {
    return null;
  }

  if (!allocataire_caf) {
    return null;
  }

  if (age < 3 || age > 17) {
    return null;
  }

  if (!sejour_labellise) {
    return {
      id: 'vacaf_ave',
      code: 'VACAF_AVE',
      name: 'VACAF AVE',
      montant: 0,
      eligible: false,
      niveau: 'caf',
      criteres_manquants: ['Séjour labellisé VACAF requis'],
    };
  }

  if (quotient_familial > 900) {
    return {
      id: 'vacaf_ave',
      code: 'VACAF_AVE',
      name: 'VACAF AVE',
      montant: 0,
      eligible: false,
      niveau: 'caf',
      criteres_manquants: ['QF maximum 900€'],
    };
  }

  // Montant variable selon QF (à adapter selon barème CAF exact)
  let montant = 0;
  if (quotient_familial <= 450) {
    montant = 200;
  } else if (quotient_familial <= 700) {
    montant = 150;
  } else {
    montant = 100;
  }

  return {
    id: 'vacaf_ave',
    code: 'VACAF_AVE',
    name: 'VACAF AVE',
    montant: Math.min(montant, params.prix_activite),
    eligible: true,
    niveau: 'caf',
    message: 'Aide CAF pour séjours labellisés',
  };
}

/**
 * 5. VACAF AVF (aide vacances familles)
 * Critères : CAF + QF ≤800
 */
function evaluateVACAFAVF(params: EligibilityParams): CalculatedAid | null {
  const { allocataire_caf, quotient_familial, type_activite } = params;

  if (type_activite !== 'vacances') {
    return null;
  }

  if (!allocataire_caf) {
    return null;
  }

  if (quotient_familial > 800) {
    return null;
  }

  // Montant variable (max 400€) selon barème CAF
  let montant = 0;
  if (quotient_familial <= 400) {
    montant = 400;
  } else if (quotient_familial <= 600) {
    montant = 300;
  } else {
    montant = 200;
  }

  return {
    id: 'vacaf_avf',
    code: 'VACAF_AVF',
    name: 'VACAF AVF',
    montant: Math.min(montant, params.prix_activite),
    eligible: true,
    niveau: 'caf',
    message: 'Aide CAF vacances familles',
  };
}

/**
 * 6. PASS'RÉGION (30€)
 * Critères : Lycéen
 */
function evaluatePassRegion(params: EligibilityParams): CalculatedAid | null {
  const { statut_scolaire } = params;

  if (statut_scolaire !== 'lycee') {
    return null;
  }

  return {
    id: 'pass_region',
    code: 'PASS_REGION',
    name: "Pass'Région",
    montant: Math.min(30, params.prix_activite),
    eligible: true,
    niveau: 'regional',
    message: 'Aide régionale Auvergne-Rhône-Alpes pour lycéens',
  };
}

/**
 * 7. CAF LOIRE TEMPS LIBRE (20-80€ selon QF)
 * Critères : CAF + QF ≤850 + âge 3-17
 */
function evaluateCAFLoireTempsLibre(params: EligibilityParams): CalculatedAid | null {
  const { age, allocataire_caf, quotient_familial } = params;

  if (!allocataire_caf) {
    return null;
  }

  if (age < 3 || age > 17) {
    return null;
  }

  if (quotient_familial > 850) {
    return null;
  }

  let montant = 0;
  if (quotient_familial <= 350) {
    montant = 80;
  } else if (quotient_familial <= 550) {
    montant = 60;
  } else if (quotient_familial <= 700) {
    montant = 40;
  } else {
    montant = 20;
  }

  return {
    id: 'caf_loire_temps_libre',
    code: 'CAF_LOIRE_TEMPS_LIBRE',
    name: 'CAF Loire – Temps Libre',
    montant: Math.min(montant, params.prix_activite),
    eligible: true,
    niveau: 'caf',
    message: `Aide CAF Loire (QF ${quotient_familial}€)`,
  };
}

/**
 * 8. CHÈQUES LOISIRS 42 (30€)
 * Critères : Département 42 + QF ≤900
 */
function evaluateChequesLoisirs42(params: EligibilityParams): CalculatedAid | null {
  const { departement, quotient_familial } = params;

  if (departement !== 42) {
    return null;
  }

  if (quotient_familial > 900) {
    return null;
  }

  return {
    id: 'cheques_loisirs_42',
    code: 'CHEQUES_LOISIRS_42',
    name: 'Chèques Loisirs Loire',
    montant: Math.min(30, params.prix_activite),
    eligible: true,
    niveau: 'departemental',
    message: 'Aide du Conseil Départemental de la Loire',
  };
}

/**
 * 9. TARIFS SOCIAUX SAINT-ÉTIENNE (variable selon QF et type activité)
 * Critères : Ville Saint-Étienne + QF (tranches A/B/C)
 */
function evaluateTarifsSociauxSaintEtienne(params: EligibilityParams): CalculatedAid | null {
  const { ville, quotient_familial, type_activite, prix_activite } = params;

  const villeLower = ville.toLowerCase().replace(/[éè]/g, 'e').replace(/[àâ]/g, 'a');
  if (!villeLower.includes('saint') || !villeLower.includes('etienne')) {
    return null;
  }

  let tranche = '';
  let reduction = 0;

  if (quotient_familial <= 400) {
    tranche = 'A';
    reduction = type_activite === 'sport' ? 60 : type_activite === 'culture' ? 70 : 50;
  } else if (quotient_familial <= 700) {
    tranche = 'B';
    reduction = type_activite === 'sport' ? 40 : type_activite === 'culture' ? 50 : 30;
  } else if (quotient_familial <= 1000) {
    tranche = 'C';
    reduction = type_activite === 'sport' ? 20 : type_activite === 'culture' ? 30 : 15;
  } else {
    return null;
  }

  const montant = Math.min(reduction, prix_activite);

  return {
    id: 'tarifs_sociaux_st_etienne',
    code: 'TARIFS_SOCIAUX_STE',
    name: 'Tarifs sociaux Saint-Étienne',
    montant,
    eligible: true,
    niveau: 'communal',
    message: `Tranche ${tranche} - Réduction ${type_activite}`,
  };
}

/**
 * 10. CARTE BÔGE (10€)
 * Critères : 13-29 ans
 */
function evaluateCarteBOGE(params: EligibilityParams): CalculatedAid | null {
  const { age } = params;

  if (age < 13 || age > 29) {
    return null;
  }

  return {
    id: 'carte_boge',
    code: 'CARTE_BOGE',
    name: 'Carte BÔGE',
    montant: Math.min(10, params.prix_activite),
    eligible: true,
    niveau: 'communal',
    message: 'Carte jeune Saint-Étienne Métropole',
  };
}

/**
 * 11. BONUS QPV SEM (20€)
 * Critères : Résidence en QPV
 */
function evaluateBonusQPV(params: EligibilityParams): CalculatedAid | null {
  const { est_qpv, type_activite } = params;

  if (!est_qpv) {
    return null;
  }

  return {
    id: 'bonus_qpv_sem',
    code: 'BONUS_QPV_SEM',
    name: 'Bonus QPV SEM',
    montant: Math.min(20, params.prix_activite),
    eligible: true,
    niveau: 'communal',
    message: `Bonus Quartier Prioritaire (${type_activite})`,
  };
}

/**
 * 12. RÉDUCTION FRATRIE (10%)
 * Critères : 2+ enfants
 */
function evaluateReductionFratrie(params: EligibilityParams): CalculatedAid | null {
  const { nb_fratrie, prix_activite } = params;

  if (nb_fratrie < 2) {
    return null;
  }

  const reduction = prix_activite * 0.1;

  return {
    id: 'reduction_fratrie',
    code: 'REDUCTION_FRATRIE',
    name: 'Réduction fratrie',
    montant: reduction,
    eligible: true,
    niveau: 'organisateur',
    type_montant: 'pourcentage',
    message: `10% de réduction (${nb_fratrie} enfants)`,
  };
}

// ============================================================================
// FONCTION UTILITAIRE : CALCUL DU TOTAL DES AIDES
// ============================================================================

export function calculateTotalAids(aids: CalculatedAid[]): {
  totalAids: number;
  remainingPrice: number;
  savingsPercent: number;
  originalPrice: number;
} {
  const eligibleAids = aids.filter(aid => aid.eligible);
  const totalAids = eligibleAids.reduce((sum, aid) => sum + aid.montant, 0);

  // Récupérer le prix original (assumant qu'il est le même pour toutes les aides)
  const originalPrice = eligibleAids.length > 0 ? eligibleAids[0].montant : 0;

  const remainingPrice = Math.max(0, originalPrice - totalAids);
  const savingsPercent = originalPrice > 0 ? Math.round((totalAids / originalPrice) * 100) : 0;

  return {
    totalAids,
    remainingPrice,
    savingsPercent,
    originalPrice,
  };
}

// ============================================================================
// EXPORT HELPER : Vérifier données manquantes
// ============================================================================

export function checkMissingData(params: Partial<EligibilityParams>): string[] {
  const missing: string[] = [];

  if (!params.age) missing.push('Âge de l\'enfant');
  if (!params.quotient_familial) missing.push('Quotient Familial');
  if (!params.ville) missing.push('Ville');
  if (!params.code_postal) missing.push('Code postal');
  if (!params.type_activite) missing.push('Type d\'activité');
  if (!params.statut_scolaire) missing.push('Statut scolaire');
  if (params.allocataire_caf === undefined) missing.push('Statut allocataire CAF');
  if (params.est_qpv === undefined) missing.push('Résidence en QPV');

  return missing;
}
