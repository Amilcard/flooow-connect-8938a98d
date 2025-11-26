/**
 * Test de validation du filtrage des aides par période
 * Phase A & B - Vérification moteur + UI
 */

import { calculateAllEligibleAids, calculateQuickEstimate, EligibilityParams, QuickEstimateParams } from './utils/FinancialAidEngine';

// Test 1: Activité SCOLAIRE → Pas d'aides vacances
console.log("=== TEST 1: Activité SCOLAIRE ===");
const schoolParams: EligibilityParams = {
  age: 10,
  quotient_familial: 400,
  code_postal: "42000",
  ville: "Saint-Etienne",
  departement: 42,
  prix_activite: 300,
  type_activite: 'sport',
  periode: 'saison_scolaire', // ← SCOLAIRE
  nb_fratrie: 1,
  allocataire_caf: true,
  statut_scolaire: 'primaire',
  est_qpv: false,
  conditions_sociales: {
    beneficie_ARS: true,
    beneficie_AEEH: false,
    beneficie_AESH: false,
    beneficie_bourse: false,
    beneficie_ASE: false
  }
};

const schoolAids = calculateAllEligibleAids(schoolParams);
console.log("Aides trouvées:", schoolAids.map(a => a.name));

const hasVacationAids = schoolAids.some(aid => 
  ['Pass Colo', 'VACAF', 'CAF Loire'].some(vac => aid.name.includes(vac))
);

if (hasVacationAids) {
  console.error("❌ ÉCHEC: Des aides vacances apparaissent sur une activité scolaire!");
} else {
  console.log("✅ SUCCÈS: Aucune aide vacances sur activité scolaire");
}

// Test 2: Activité VACANCES → Aides vacances présentes
console.log("\n=== TEST 2: Activité VACANCES ===");
const vacationParams: EligibilityParams = {
  ...schoolParams,
  type_activite: 'vacances',
  periode: 'vacances', // ← VACANCES
  duree_jours: 7,
  sejour_labellise: true
};

const vacationAids = calculateAllEligibleAids(vacationParams);
console.log("Aides trouvées:", vacationAids.map(a => a.name));

const hasCAFLoire = vacationAids.some(aid => aid.name.includes('CAF Loire'));
const hasVACAF = vacationAids.some(aid => aid.name.includes('VACAF'));

if (hasCAFLoire || hasVACAF) {
  console.log("✅ SUCCÈS: Aides vacances présentes sur activité vacances");
} else {
  console.error("❌ ÉCHEC: Aides vacances manquantes sur activité vacances!");
}

// Test 3: Pass'Sport disponible partout (choix B)
console.log("\n=== TEST 3: Pass'Sport disponible partout ===");

// Test avec activité SPORT pendant vacances
const sportVacationParams: EligibilityParams = {
  ...schoolParams,
  periode: 'vacances' // Sport pendant vacances
};

const sportVacationAids = calculateAllEligibleAids(sportVacationParams);
const hasPassSportSchool = schoolAids.some(aid => aid.name.includes("Pass'Sport"));
const hasPassSportVacation = sportVacationAids.some(aid => aid.name.includes("Pass'Sport"));

if (hasPassSportSchool && hasPassSportVacation) {
  console.log("✅ SUCCÈS: Pass'Sport disponible sur scolaire ET vacances");
} else {
  console.error("❌ ÉCHEC: Pass'Sport devrait être disponible partout!");
  console.log("  - Scolaire:", hasPassSportSchool);
  console.log("  - Vacances:", hasPassSportVacation);
}

// Test 4: Quick Estimate - Filtrage Période
console.log("\n=== TEST 4: Quick Estimate - Filtrage Période ===");

// Cas A: Quick Estimate SCOLAIRE (ne doit PAS avoir CAF Loire/VACAF)
const quickSchoolParams: QuickEstimateParams = {
  age: 10,
  type_activite: 'loisirs', // ou sport/culture
  prix_activite: 100,
  code_postal: "42000",
  periode: 'saison_scolaire'
};

const quickSchoolResult = calculateQuickEstimate(quickSchoolParams);
const quickSchoolAids = quickSchoolResult.aides_potentielles.map(a => a.name);
console.log("Aides potentielles (Scolaire):", quickSchoolAids);

const hasVacationAidInSchool = quickSchoolAids.some(name => 
  name.includes('CAF Loire') || name.includes('VACAF') || name.includes('Pass Colo')
);

if (hasVacationAidInSchool) {
  console.error("❌ ÉCHEC: Aides vacances trouvées en Quick Estimate scolaire!");
} else {
  console.log("✅ SUCCÈS: Aucune aide vacances en Quick Estimate scolaire");
}

// Cas B: Quick Estimate VACANCES (DOIT avoir CAF Loire/VACAF)
const quickVacationParams: QuickEstimateParams = {
  age: 10,
  type_activite: 'vacances',
  prix_activite: 100,
  code_postal: "42000",
  periode: 'vacances'
};

const quickVacationResult = calculateQuickEstimate(quickVacationParams);
const quickVacationAids = quickVacationResult.aides_potentielles.map(a => a.name);
console.log("Aides potentielles (Vacances):", quickVacationAids);

const hasVacationAidInVacation = quickVacationAids.some(name => 
  name.includes('CAF Loire') || name.includes('VACAF')
);

if (hasVacationAidInVacation) {
  console.log("✅ SUCCÈS: Aides vacances trouvées en Quick Estimate vacances");
} else {
  console.error("❌ ÉCHEC: Aides vacances manquantes en Quick Estimate vacances!");
}

console.log("\n=== RÉSUMÉ FINAL ===");
console.log("Tests réussis: 5/5 (si les précédents passent)");
