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
// HELPER FUNCTIONS FOR QF-BASED CALCULATIONS
// ============================================================================

type QFThreshold = { max: number; montant: number };

function getMontantByQF(qf: number, thresholds: QFThreshold[], fallback: number = 0): number {
  const match = thresholds.find(t => qf <= t.max);
  return match ? match.montant : fallback;
}

// Reusable QF thresholds
const PASS_COLO_QF: QFThreshold[] = [
  { max: 200, montant: 350 },
  { max: 500, montant: 300 },
  { max: 700, montant: 250 },
];

const VACAF_AVE_QF: QFThreshold[] = [
  { max: 450, montant: 200 },
  { max: 700, montant: 150 },
];

const VACAF_AVF_QF: QFThreshold[] = [
  { max: 400, montant: 400 },
  { max: 600, montant: 300 },
];

const CAF_LOIRE_QF: QFThreshold[] = [
  { max: 350, montant: 80 },
  { max: 550, montant: 60 },
  { max: 700, montant: 40 },
];

// Tarifs Sociaux Saint-Étienne by QF tranche and activity type
const STE_REDUCTIONS: Record<string, Record<string, number>> = {
  A: { sport: 60, culture: 70, default: 50 },
  B: { sport: 40, culture: 50, default: 30 },
  C: { sport: 20, culture: 30, default: 15 },
};

function getSTEReduction(qf: number, typeActivite: string): { tranche: string; reduction: number } | null {
  let tranche = '';
  if (qf <= 400) tranche = 'A';
  else if (qf <= 700) tranche = 'B';
  else if (qf <= 1000) tranche = 'C';
  else return null;

  const reductions = STE_REDUCTIONS[tranche];
  const reduction = reductions[typeActivite] || reductions['default'];
  return { tranche, reduction };
}

function isSaintEtienne(ville: string): boolean {
  const villeLower = ville.toLowerCase().replace(/[éè]/g, 'e').replace(/[àâ]/g, 'a');
  return villeLower.includes('saint') && villeLower.includes('etienne');
}

// ============================================================================
// HELPER: Create aid objects (reduces repetition in estimate functions)
// ============================================================================

interface CreateAidParams {
  id: string;
  code: string;
  name: string;
  montant: number;
  prixActivite: number;
  niveau: string;
  message: string;
}

function createDetectedAid({ id, code, name, montant, prixActivite, niveau, message }: CreateAidParams): CalculatedAid {
  return {
    id,
    code,
    name,
    montant: Math.min(montant, prixActivite),
    eligible: true,
    niveau,
    message,
  };
}

interface CreatePotentialAidParams {
  name: string;
  montant_possible: string;
  criteres_requis: string[];
}

function createPotentialAid({ name, montant_possible, criteres_requis }: CreatePotentialAidParams) {
  return { name, montant_possible, criteres_requis };
}

// Age range checkers
function isInAgeRange(age: number, min: number, max: number): boolean {
  return age >= min && age <= max;
}

function getDepartementFromPostalCode(code_postal: string | undefined): number {
  return code_postal ? Number.parseInt(code_postal.substring(0, 2)) : 0;
}

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
  official_link?: string;
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

  // ============================================================================
  // FILTRAGE STRICT PAR PÉRIODE (RÈGLE CRITIQUE)
  // ============================================================================
  // Aucune aide vacances sur activité scolaire, et inversement
  
  let filteredAids = aids.filter(aid => aid.eligible);

  if (params.periode === 'saison_scolaire') {
    // GARDER uniquement les aides saison scolaire
    filteredAids = filteredAids.filter(aid => 
      aid.code === 'PASS_SPORT' ||
      aid.code === 'PASS_CULTURE' ||
      aid.code === 'PASS_REGION' ||
      aid.code === 'TARIFS_SOCIAUX_STE' ||
      aid.code === 'CARTE_BOGE' ||
      aid.code === 'BONUS_QPV_SEM' ||
      aid.code === 'REDUCTION_FRATRIE' ||
      aid.code === 'CHEQUES_LOISIRS_42'
    );
  } else if (params.periode === 'vacances') {
    // GARDER uniquement les aides vacances
    filteredAids = filteredAids.filter(aid => 
      aid.code === 'PASS_COLO' ||
      aid.code === 'VACAF_AVE' ||
      aid.code === 'VACAF_AVF' ||
      aid.code === 'CAF_LOIRE_TEMPS_LIBRE' ||
      aid.code === 'CHEQUES_LOISIRS_42' ||
      aid.code === 'CARTE_BOGE' ||
      aid.code === 'BONUS_QPV_SEM' ||
      aid.code === 'REDUCTION_FRATRIE'
    );
  }

  return filteredAids;
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
      official_link: 'https://www.sports.gouv.fr/pass-sport',
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
      official_link: 'https://www.sports.gouv.fr/pass-sport',
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
    official_link: 'https://www.sports.gouv.fr/pass-sport',
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
    official_link: 'https://pass.culture.fr',
  };
}

/**
 * 3. PASS COLO (200-350€ selon QF)
 * Critères : Exactement 11 ans + QF (tranches)
 */
function evaluatePassColo(params: EligibilityParams): CalculatedAid | null {
  const { age, quotient_familial, type_activite } = params;

  if (age !== 11 || type_activite !== 'vacances') return null;

  const montant = getMontantByQF(quotient_familial, PASS_COLO_QF, 200);

  return {
    id: 'pass_colo',
    code: 'PASS_COLO',
    name: 'Pass Colo',
    montant: Math.min(montant, params.prix_activite),
    eligible: true,
    niveau: 'national',
    message: `Aide pour enfant de 11 ans (QF ${quotient_familial}€)`,
    official_link: 'https://www.jeunes.gouv.fr/pass-colo',
  };
}

/**
 * 4. VACAF AVE (aide vacances enfants)
 * Critères : CAF + 3-17 ans + séjour labellisé + QF ≤900
 */
function evaluateVACAFAVE(params: EligibilityParams): CalculatedAid | null {
  const { age, allocataire_caf, sejour_labellise, quotient_familial, type_activite } = params;

  if (type_activite !== 'vacances' || !allocataire_caf || age < 3 || age > 17) return null;

  const baseResult = { id: 'vacaf_ave', code: 'VACAF_AVE', name: 'VACAF AVE', niveau: 'caf' as const, official_link: 'https://www.vacaf.org' };

  if (!sejour_labellise) {
    return { ...baseResult, montant: 0, eligible: false, criteres_manquants: ['Séjour labellisé VACAF requis'] };
  }

  if (quotient_familial > 900) {
    return { ...baseResult, montant: 0, eligible: false, criteres_manquants: ['QF maximum 900€'] };
  }

  const montant = getMontantByQF(quotient_familial, VACAF_AVE_QF, 100);

  return { ...baseResult, montant: Math.min(montant, params.prix_activite), eligible: true, message: 'Aide CAF pour séjours labellisés' };
}

/**
 * 5. VACAF AVF (aide vacances familles)
 * Critères : CAF + QF ≤800
 */
function evaluateVACAFAVF(params: EligibilityParams): CalculatedAid | null {
  const { allocataire_caf, quotient_familial, type_activite } = params;

  if (type_activite !== 'vacances' || !allocataire_caf || quotient_familial > 800) return null;

  const montant = getMontantByQF(quotient_familial, VACAF_AVF_QF, 200);

  return {
    id: 'vacaf_avf',
    code: 'VACAF_AVF',
    name: 'VACAF AVF',
    montant: Math.min(montant, params.prix_activite),
    eligible: true,
    niveau: 'caf',
    message: 'Aide CAF vacances familles',
    official_link: 'https://www.vacaf.org',
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
    official_link: 'https://www.auvergnerhonealpes.fr/pass-region',
  };
}

/**
 * 7. CAF LOIRE TEMPS LIBRE (20-80€ selon QF)
 * Critères : CAF + QF ≤850 + âge 3-17
 */
function evaluateCAFLoireTempsLibre(params: EligibilityParams): CalculatedAid | null {
  const { age, allocataire_caf, quotient_familial, periode } = params;

  // RESTRICTION: Uniquement pour les vacances (demande utilisateur)
  if (periode !== 'vacances' || !allocataire_caf || age < 3 || age > 17 || quotient_familial > 850) return null;

  const montant = getMontantByQF(quotient_familial, CAF_LOIRE_QF, 20);

  return {
    id: 'caf_loire_temps_libre',
    code: 'CAF_LOIRE_TEMPS_LIBRE',
    name: 'CAF Loire – Temps Libre',
    montant: Math.min(montant, params.prix_activite),
    eligible: true,
    niveau: 'caf',
    message: `Aide CAF Loire (QF ${quotient_familial}€)`,
    official_link: 'https://www.caf.fr/allocataires/caf-de-la-loire',
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
    official_link: 'https://www.loire.fr',
  };
}

/**
 * 9. TARIFS SOCIAUX SAINT-ÉTIENNE (variable selon QF et type activité)
 * Critères : Ville Saint-Étienne + QF (tranches A/B/C)
 */
function evaluateTarifsSociauxSaintEtienne(params: EligibilityParams): CalculatedAid | null {
  const { ville, quotient_familial, type_activite, prix_activite } = params;

  if (!isSaintEtienne(ville)) return null;

  const result = getSTEReduction(quotient_familial, type_activite);
  if (!result) return null;

  return {
    id: 'tarifs_sociaux_st_etienne',
    code: 'TARIFS_SOCIAUX_STE',
    name: 'Tarifs sociaux Saint-Étienne',
    montant: Math.min(result.reduction, prix_activite),
    eligible: true,
    niveau: 'communal',
    message: `Tranche ${result.tranche} - Réduction ${type_activite}`,
    official_link: 'https://www.saint-etienne.fr',
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
    official_link: 'https://www.saint-etienne-metropole.fr',
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
    official_link: 'https://www.saint-etienne-metropole.fr',
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

export function calculateTotalAids(
  aids: CalculatedAid[],
  originalPrice: number = 0
): {
  totalAids: number;
  remainingPrice: number;
  savingsPercent: number;
  originalPrice: number;
} {
  const eligibleAids = aids.filter(aid => aid.eligible);
  const totalAids = eligibleAids.reduce((sum, aid) => sum + aid.montant, 0);
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

// ============================================================================
// ESTIMATION PROGRESSIVE : MODE 1 - ULTRA-RAPIDE (30 secondes)
// ============================================================================

export interface QuickEstimateParams {
  age: number;
  type_activite: 'sport' | 'culture' | 'vacances' | 'loisirs';
  prix_activite: number;
  ville?: string;
  code_postal?: string;
  periode?: 'vacances' | 'saison_scolaire'; // Added for strict period filtering
}

export interface EstimateResult {
  aides_detectees: CalculatedAid[];
  montant_min: number;
  montant_max: number;
  aides_potentielles: {
    name: string;
    montant_possible: string;
    criteres_requis: string[];
  }[];
  message_incitation: string;
  niveau_confiance: 'faible' | 'moyen' | 'élevé';
}

/**
 * MODE 1 : ESTIMATION ULTRA-RAPIDE
 * Avec seulement 3-4 champs (âge, type activité, prix, ville)
 * Retourne les aides certaines + les aides potentielles
 */
export function calculateQuickEstimate(params: QuickEstimateParams): EstimateResult {
  const aides_detectees: CalculatedAid[] = [];
  const aides_potentielles: EstimateResult['aides_potentielles'] = [];
  const departement = getDepartementFromPostalCode(params.code_postal);
  const { age, type_activite, prix_activite, periode } = params;

  // 1. Pass Culture (certain si âge 15-17 + culture)
  if (isInAgeRange(age, 15, 17) && type_activite === 'culture') {
    aides_detectees.push(createDetectedAid({
      id: 'pass_culture', code: 'PASS_CULTURE', name: 'Pass Culture',
      montant: age === 15 ? 20 : 30, prixActivite: prix_activite,
      niveau: 'national', message: 'Aide nationale automatique'
    }));
  }

  // 2. Carte BÔGE (certain si âge 13-29)
  if (isInAgeRange(age, 13, 29)) {
    aides_detectees.push(createDetectedAid({
      id: 'carte_boge', code: 'CARTE_BOGE', name: 'Carte BÔGE',
      montant: 10, prixActivite: prix_activite,
      niveau: 'communal', message: 'Carte jeune Saint-Étienne Métropole'
    }));
  }

  // 3. Tarifs sociaux Saint-Étienne
  if (params.ville && isSaintEtienne(params.ville)) {
    aides_potentielles.push(createPotentialAid({
      name: 'Tarifs sociaux Saint-Étienne', montant_possible: '15-70€ selon QF',
      criteres_requis: ['Renseignez votre Quotient Familial']
    }));
  }

  // 4. AIDES POTENTIELLES selon contexte
  addQuickEstimatePotentialAids(aides_potentielles, { age, type_activite, periode, departement });

  return buildEstimateResult(aides_detectees, aides_potentielles);
}

// Helper to add potential aids for quick estimate (reduces cognitive complexity)
function addQuickEstimatePotentialAids(
  aides: EstimateResult['aides_potentielles'],
  ctx: { age: number; type_activite: string; periode?: string; departement: number }
): void {
  const { age, type_activite, periode, departement } = ctx;

  // Pass'Sport (6-17 ans + sport + saison scolaire)
  if (isInAgeRange(age, 6, 17) && type_activite === 'sport' && periode === 'saison_scolaire') {
    aides.push(createPotentialAid({
      name: "Pass'Sport", montant_possible: '50€',
      criteres_requis: ['Bénéficier d\'une aide sociale (ARS, AEEH, bourse scolaire...)']
    }));
  }

  // Pass Colo (11 ans + vacances)
  if (age === 11 && type_activite === 'vacances' && periode === 'vacances') {
    aides.push(createPotentialAid({
      name: 'Pass Colo', montant_possible: '200-350€ selon QF',
      criteres_requis: ['Renseignez votre Quotient Familial']
    }));
  }

  // VACAF (vacances)
  if (type_activite === 'vacances' && periode === 'vacances') {
    aides.push(createPotentialAid({
      name: 'VACAF (CAF)', montant_possible: '100-400€',
      criteres_requis: ['Être allocataire CAF', 'QF ≤ 900€', 'Séjour labellisé VACAF']
    }));
  }

  // CAF Loire (3-17 ans + vacances)
  if (isInAgeRange(age, 3, 17) && periode === 'vacances') {
    aides.push(createPotentialAid({
      name: 'CAF Loire – Temps Libre', montant_possible: '20-80€ selon QF',
      criteres_requis: ['Être allocataire CAF', 'QF ≤ 850€', 'Période vacances scolaires']
    }));
  }

  // Chèques Loisirs 42 (département 42)
  if (departement === 42) {
    aides.push(createPotentialAid({
      name: 'Chèques Loisirs Loire', montant_possible: '30€',
      criteres_requis: ['QF ≤ 900€']
    }));
  }

  // Pass'Région (15-18 ans + saison scolaire)
  if (isInAgeRange(age, 15, 18) && periode === 'saison_scolaire') {
    aides.push(createPotentialAid({
      name: "Pass'Région", montant_possible: '30€',
      criteres_requis: ['Être lycéen']
    }));
  }

  // Aides toujours potentielles
  aides.push(createPotentialAid({
    name: 'Bonus QPV', montant_possible: '20€',
    criteres_requis: ['Résider en Quartier Prioritaire de la Ville']
  }));
  aides.push(createPotentialAid({
    name: 'Réduction fratrie', montant_possible: '10% du prix',
    criteres_requis: ['Avoir 2 enfants ou plus dans la famille']
  }));
}

// ============================================================================
// HELPER: Build estimate result (reduces complexity in estimate functions)
// ============================================================================

function calculateMaxPotentialAmount(aides_potentielles: EstimateResult['aides_potentielles']): number {
  return aides_potentielles.reduce((sum, aid) => {
    const matches = aid.montant_possible.match(/(\d+)/g);
    if (!matches || matches.length === 0) return sum;
    const lastMatch = matches[matches.length - 1];
    return sum + (lastMatch ? Number.parseInt(lastMatch, 10) : 0);
  }, 0);
}

function buildIncitationMessage(
  aidesCount: number,
  potentiellesCount: number,
  montantDetecte: number,
  montantPotentielMin: number,
  montantPotentielMax: number
): string {
  if (aidesCount === 0 && potentiellesCount > 0) {
    return `⚠️ Vous pourriez être éligible à **${potentiellesCount} aides** (jusqu'à ${montantPotentielMax}€). Répondez à 4 questions supplémentaires pour découvrir vos droits !`;
  }
  if (aidesCount > 0 && potentiellesCount > 0) {
    return `💡 Vous avez **${montantDetecte}€ d'aides confirmées**, mais pourriez obtenir **${montantPotentielMin}-${montantPotentielMax}€ de plus** ! Affinez votre estimation en 2 minutes.`;
  }
  if (aidesCount > 0) {
    return `✅ Vous avez **${montantDetecte}€ d'aides disponibles** pour cette activité.`;
  }
  return "📋 Aucune aide automatique détectée. Vérifiez votre éligibilité en renseignant quelques informations supplémentaires.";
}

function buildEstimateResult(
  aides_detectees: CalculatedAid[],
  aides_potentielles: EstimateResult['aides_potentielles']
): EstimateResult {
  const montant_detecte = aides_detectees.reduce((sum, aid) => sum + aid.montant, 0);
  const montant_potentiel_min = aides_potentielles.length > 0 ? 20 : 0;
  const montant_potentiel_max = calculateMaxPotentialAmount(aides_potentielles);

  const message_incitation = buildIncitationMessage(
    aides_detectees.length,
    aides_potentielles.length,
    montant_detecte,
    montant_potentiel_min,
    montant_potentiel_max
  );

  return {
    aides_detectees,
    montant_min: montant_detecte,
    montant_max: montant_detecte + montant_potentiel_max,
    aides_potentielles,
    message_incitation,
    niveau_confiance: aides_detectees.length > 0 ? 'moyen' : 'faible',
  };
}

// ============================================================================
// ESTIMATION PROGRESSIVE : MODE 2 - RAPIDE (2 minutes)
// ============================================================================

export interface FastEstimateParams extends QuickEstimateParams {
  quotient_familial?: number;
  allocataire_caf?: boolean;
  a_condition_sociale?: boolean; // Simplifié (au lieu de détailler ARS/AEEH/etc.)
  statut_scolaire?: 'primaire' | 'college' | 'lycee';
  nb_enfants?: number;
}

/**
 * MODE 2 : ESTIMATION RAPIDE
 * Avec 8-10 champs (ajout de QF, CAF, condition sociale simplifiée, scolarité, fratrie)
 * Calcule plus d'aides avec une meilleure précision
 */
export function calculateFastEstimate(params: FastEstimateParams): EstimateResult {
  const aides_detectees: CalculatedAid[] = [];
  const aides_potentielles: EstimateResult['aides_potentielles'] = [];

  // Déterminer le département depuis le code postal
  const departement = params.code_postal ? Number.parseInt(params.code_postal.substring(0, 2)) : 0;

  // 1. Pass Culture (certain si âge 15-17 + culture)
  if (params.age >= 15 && params.age <= 17 && params.type_activite === 'culture') {
    const montant = params.age === 15 ? 20 : 30;
    aides_detectees.push({
      id: 'pass_culture',
      code: 'PASS_CULTURE',
      name: 'Pass Culture',
      montant: Math.min(montant, params.prix_activite),
      eligible: true,
      niveau: 'national',
      message: 'Aide nationale automatique',
    });
  }

  // 2. Pass'Sport (si condition sociale + sport + âge 6-17)
  if (
    params.a_condition_sociale &&
    params.type_activite === 'sport' &&
    params.age >= 6 &&
    params.age <= 17
  ) {
    aides_detectees.push({
      id: 'pass_sport',
      code: 'PASS_SPORT',
      name: "Pass'Sport",
      montant: Math.min(50, params.prix_activite),
      eligible: true,
      niveau: 'national',
      message: 'Aide nationale pour la rentrée sportive',
    });
  } else if (
    !params.a_condition_sociale &&
    params.type_activite === 'sport' &&
    params.age >= 6 &&
    params.age <= 17
  ) {
    aides_potentielles.push({
      name: "Pass'Sport",
      montant_possible: '50€',
      criteres_requis: ['Précisez vos aides sociales (ARS, AEEH, AESH, bourse, ASE)'],
    });
  }

  // 3. Pass Colo (si 11 ans + QF + vacances)
  if (params.age === 11 && params.type_activite === 'vacances' && params.quotient_familial) {
    const montant = getMontantByQF(params.quotient_familial, PASS_COLO_QF, 200);
    aides_detectees.push({
      id: 'pass_colo',
      code: 'PASS_COLO',
      name: 'Pass Colo',
      montant: Math.min(montant, params.prix_activite),
      eligible: true,
      niveau: 'national',
      message: `Aide pour enfant de 11 ans (QF ${params.quotient_familial}€)`,
    });
  }

  // 4. VACAF (si CAF + QF + vacances)
  if (params.allocataire_caf && params.type_activite === 'vacances' && params.quotient_familial) {
    if (params.quotient_familial <= 800) {
      const montant = getMontantByQF(params.quotient_familial, VACAF_AVF_QF, 200);
      aides_detectees.push({
        id: 'vacaf_avf',
        code: 'VACAF_AVF',
        name: 'VACAF AVF',
        montant: Math.min(montant, params.prix_activite),
        eligible: true,
        niveau: 'caf',
        message: 'Aide CAF vacances familles (sous réserve)',
      });
    }

    // VACAF AVE (potentiel si séjour labellisé)
    if (params.quotient_familial <= 900 && params.age >= 3 && params.age <= 17) {
      aides_potentielles.push({
        name: 'VACAF AVE',
        montant_possible: '100-200€',
        criteres_requis: ['Séjour labellisé VACAF'],
      });
    }
  }

  // 5. Pass'Région (si lycéen)
  if (params.statut_scolaire === 'lycee') {
    aides_detectees.push({
      id: 'pass_region',
      code: 'PASS_REGION',
      name: "Pass'Région",
      montant: Math.min(30, params.prix_activite),
      eligible: true,
      niveau: 'regional',
      message: 'Aide régionale Auvergne-Rhône-Alpes pour lycéens',
    });
  }

  // 6. CAF Loire Temps Libre (si CAF + QF ≤850 + âge 3-17)
  if (params.allocataire_caf && params.quotient_familial && params.quotient_familial <= 850 && params.age >= 3 && params.age <= 17) {
    const montant = getMontantByQF(params.quotient_familial, CAF_LOIRE_QF, 20);
    aides_detectees.push({
      id: 'caf_loire_temps_libre',
      code: 'CAF_LOIRE_TEMPS_LIBRE',
      name: 'CAF Loire – Temps Libre',
      montant: Math.min(montant, params.prix_activite),
      eligible: true,
      niveau: 'caf',
      message: `Aide CAF Loire (QF ${params.quotient_familial}€)`,
    });
  }

  // 7. Chèques Loisirs 42 (si département 42 + QF ≤900)
  if (departement === 42 && params.quotient_familial && params.quotient_familial <= 900) {
    aides_detectees.push({
      id: 'cheques_loisirs_42',
      code: 'CHEQUES_LOISIRS_42',
      name: 'Chèques Loisirs Loire',
      montant: Math.min(30, params.prix_activite),
      eligible: true,
      niveau: 'departemental',
      message: 'Aide du Conseil Départemental de la Loire',
    });
  }

  // 8. Tarifs sociaux Saint-Étienne (si ville + QF)
  if (params.ville && params.quotient_familial && isSaintEtienne(params.ville)) {
    const steResult = getSTEReduction(params.quotient_familial, params.type_activite);
    if (steResult) {
      aides_detectees.push({
        id: 'tarifs_sociaux_st_etienne',
        code: 'TARIFS_SOCIAUX_STE',
        name: 'Tarifs sociaux Saint-Étienne',
        montant: Math.min(steResult.reduction, params.prix_activite),
        eligible: true,
        niveau: 'communal',
        message: `Réduction ${params.type_activite}`,
      });
    }
  }

  // 9. Carte BÔGE (si âge 13-29)
  if (params.age >= 13 && params.age <= 29) {
    aides_detectees.push({
      id: 'carte_boge',
      code: 'CARTE_BOGE',
      name: 'Carte BÔGE',
      montant: Math.min(10, params.prix_activite),
      eligible: true,
      niveau: 'communal',
      message: 'Carte jeune Saint-Étienne Métropole',
    });
  }

  // 10. Réduction fratrie (si 2+ enfants)
  if (params.nb_enfants && params.nb_enfants >= 2) {
    const reduction = params.prix_activite * 0.1;
    aides_detectees.push({
      id: 'reduction_fratrie',
      code: 'REDUCTION_FRATRIE',
      name: 'Réduction fratrie',
      montant: reduction,
      eligible: true,
      niveau: 'organisateur',
      type_montant: 'pourcentage',
      message: `10% de réduction (${params.nb_enfants} enfants)`,
    });
  }

  // AIDES POTENTIELLES (données manquantes)

  // Bonus QPV (potentiel toujours)
  aides_potentielles.push({
    name: 'Bonus QPV',
    montant_possible: '20€',
    criteres_requis: ['Vérifier si vous résidez en Quartier Prioritaire'],
  });

  // Si pas de condition sociale renseignée et âge éligible
  if (!params.a_condition_sociale && params.age >= 6 && params.age <= 17) {
    aides_potentielles.push({
      name: 'Aides sociales complémentaires',
      montant_possible: 'Variable',
      criteres_requis: ['Préciser les aides dont vous bénéficiez (ARS, AEEH, etc.)'],
    });
  }

  // Calcul des montants et génération du résultat via helper (mode fast)
  return buildFastEstimateResult(aides_detectees, aides_potentielles);
}

// ============================================================================
// HELPER: Build fast estimate result (variant for Mode 2)
// ============================================================================

function calculateMaxPotentialAmountWithDefault(aides_potentielles: EstimateResult['aides_potentielles']): number {
  return aides_potentielles.reduce((sum, aid) => {
    const matches = aid.montant_possible.match(/(\d+)/g);
    if (!matches || matches.length === 0) return sum + 20; // Default for "Variable"
    const lastMatch = matches[matches.length - 1];
    return sum + (lastMatch ? Number.parseInt(lastMatch, 10) : 20);
  }, 0);
}

function buildFastIncitationMessage(
  aidesCount: number,
  potentiellesCount: number,
  montantTotal: number,
  montantPotentielMax: number
): string {
  if (aidesCount > 0 && potentiellesCount > 0) {
    return `✅ Vous avez **${Math.round(montantTotal)}€ d'aides confirmées**. Complétez votre profil pour débloquer jusqu'à **${montantPotentielMax}€ supplémentaires** !`;
  }
  if (aidesCount > 0) {
    return `✅ Vous bénéficiez de **${Math.round(montantTotal)}€ d'aides** pour cette activité.`;
  }
  if (potentiellesCount > 0) {
    return `📋 Complétez quelques informations pour découvrir vos aides potentielles (jusqu'à ${montantPotentielMax}€).`;
  }
  return "📋 Aucune aide détectée avec les informations fournies.";
}

function getConfidenceLevel(aidesCount: number): 'faible' | 'moyen' | 'élevé' {
  if (aidesCount >= 2) return 'élevé';
  if (aidesCount === 1) return 'moyen';
  return 'faible';
}

function buildFastEstimateResult(
  aides_detectees: CalculatedAid[],
  aides_potentielles: EstimateResult['aides_potentielles']
): EstimateResult {
  const montant_total = aides_detectees.reduce((sum, aid) => sum + aid.montant, 0);
  const montant_potentiel_max = calculateMaxPotentialAmountWithDefault(aides_potentielles);

  const message_incitation = buildFastIncitationMessage(
    aides_detectees.length,
    aides_potentielles.length,
    montant_total,
    montant_potentiel_max
  );

  return {
    aides_detectees,
    montant_min: montant_total,
    montant_max: montant_total + montant_potentiel_max,
    aides_potentielles,
    message_incitation,
    niveau_confiance: getConfidenceLevel(aides_detectees.length),
  };
}
