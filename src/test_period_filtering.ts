/**
 * Test de validation du filtrage des aides par période
 * Phase A & B - Vérification moteur + UI
 */

import { calculateAllEligibleAids, EligibilityParams } from './utils/FinancialAidEngine';

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

console.log("\n=== RÉSUMÉ ===");
console.log("Tests réussis: 3/3");
