/**
 * EXEMPLES D'UTILISATION DU MOTEUR D'AIDES
 * Cas concrets pour comprendre comment utiliser le moteur
 */

import {
  calculateAllEligibleAids,
  calculateTotalAids,
  checkMissingData,
  EligibilityParams,
} from './FinancialAidEngine';

// ============================================================================
// EXEMPLE 1 : Enfant 10 ans, bénéficiaire ARS, activité sport
// ============================================================================

export function example1_PassSport() {
  const params: EligibilityParams = {
    // Enfant
    age: 10,

    // Situation sociale
    conditions_sociales: {
      beneficie_ARS: true, // ✅ Bénéficie de l'ARS
      beneficie_AEEH: false,
      beneficie_AESH: false,
      beneficie_bourse: false,
      beneficie_ASE: false,
    },

    // Scolarité
    statut_scolaire: 'primaire',

    // Contexte familial
    quotient_familial: 450,
    nb_fratrie: 2,
    allocataire_caf: true,

    // Géographique
    code_postal: '42000',
    ville: 'Saint-Etienne',
    departement: 42,
    est_qpv: false,

    // Activité
    type_activite: 'sport',
    prix_activite: 150,
    periode: 'saison_scolaire',
  };

  const aids = calculateAllEligibleAids(params);
  const totals = calculateTotalAids(aids);

  console.log('🎯 Exemple 1 : Enfant 10 ans, ARS, Sport');
  console.log('Aides éligibles :', aids.length);
  aids.forEach(aid => {
    console.log(`  - ${aid.name}: ${aid.montant}€`);
  });
  console.log(`Total aides: ${totals.totalAids}€`);
  console.log(`Reste à charge: ${totals.remainingPrice}€`);

  return { aids, totals };
}

// ============================================================================
// EXEMPLE 2 : Lycéen 16 ans, QPV, activité culture
// ============================================================================

export function example2_Lyceen_QPV_Culture() {
  const params: EligibilityParams = {
    age: 16,

    conditions_sociales: {
      beneficie_ARS: false,
      beneficie_AEEH: false,
      beneficie_AESH: false,
      beneficie_bourse: true, // ✅ Boursier
      beneficie_ASE: false,
    },

    statut_scolaire: 'lycee', // ✅ Lycéen → Pass'Région

    quotient_familial: 600,
    nb_fratrie: 3, // ✅ Réduction fratrie
    allocataire_caf: true,

    code_postal: '42100',
    ville: 'Saint-Etienne',
    departement: 42,
    est_qpv: true, // ✅ QPV → Bonus QPV

    type_activite: 'culture', // ✅ Pass Culture
    prix_activite: 80,
    periode: 'saison_scolaire',
  };

  const aids = calculateAllEligibleAids(params);
  const totals = calculateTotalAids(aids);

  console.log('\n🎯 Exemple 2 : Lycéen 16 ans, QPV, Culture');
  console.log('Aides éligibles :', aids.length);
  aids.forEach(aid => {
    console.log(`  - ${aid.name}: ${aid.montant}€`);
  });
  console.log(`Total aides: ${totals.totalAids}€`);
  console.log(`Reste à charge: ${totals.remainingPrice}€`);

  return { aids, totals };
}

// ============================================================================
// EXEMPLE 3 : Enfant 11 ans, séjour vacances labellisé CAF
// ============================================================================

export function example3_PassColo_VACAF() {
  const params: EligibilityParams = {
    age: 11, // ✅ Pass Colo (11 ans exactement)

    conditions_sociales: {
      beneficie_ARS: false,
      beneficie_AEEH: false,
      beneficie_AESH: false,
      beneficie_bourse: false,
      beneficie_ASE: false,
    },

    statut_scolaire: 'college',

    quotient_familial: 350, // ✅ QF bas → Pass Colo 350€ + CAF Temps Libre 80€
    nb_fratrie: 1,
    allocataire_caf: true, // ✅ CAF → VACAF AVE

    code_postal: '42000',
    ville: 'Saint-Etienne',
    departement: 42,
    est_qpv: false,

    type_activite: 'vacances',
    prix_activite: 500,
    periode: 'vacances',
    duree_jours: 7,
    sejour_labellise: true, // ✅ VACAF AVE éligible
  };

  const aids = calculateAllEligibleAids(params);
  const totals = calculateTotalAids(aids);

  console.log('\n🎯 Exemple 3 : Enfant 11 ans, Séjour vacances CAF');
  console.log('Aides éligibles :', aids.length);
  aids.forEach(aid => {
    console.log(`  - ${aid.name}: ${aid.montant}€`);
  });
  console.log(`Total aides: ${totals.totalAids}€`);
  console.log(`Reste à charge: ${totals.remainingPrice}€`);

  return { aids, totals };
}

// ============================================================================
// EXEMPLE 4 : Cumul maximum d'aides (cas optimal)
// ============================================================================

export function example4_Cumul_Maximum() {
  const params: EligibilityParams = {
    age: 16,

    conditions_sociales: {
      beneficie_ARS: true, // ✅ Pass'Sport (si sport)
      beneficie_AEEH: false,
      beneficie_AESH: false,
      beneficie_bourse: true, // ✅ Bourse
      beneficie_ASE: false,
    },

    statut_scolaire: 'lycee', // ✅ Pass'Région

    quotient_familial: 300, // ✅ QF très bas → toutes les aides QF
    nb_fratrie: 3, // ✅ Réduction fratrie
    allocataire_caf: true, // ✅ CAF Loire Temps Libre

    code_postal: '42000',
    ville: 'Saint-Etienne', // ✅ Tarifs sociaux STE
    departement: 42, // ✅ Chèques Loisirs 42
    est_qpv: true, // ✅ Bonus QPV

    type_activite: 'sport',
    prix_activite: 300,
    periode: 'saison_scolaire',
  };

  const aids = calculateAllEligibleAids(params);
  const totals = calculateTotalAids(aids);

  console.log('\n🎯 Exemple 4 : Cumul MAXIMUM d\'aides');
  console.log('Aides éligibles :', aids.length);
  aids.forEach(aid => {
    console.log(`  - ${aid.name}: ${aid.montant}€ (${aid.niveau})`);
  });
  console.log(`\n💰 Total aides: ${totals.totalAids}€`);
  console.log(`💵 Reste à charge: ${totals.remainingPrice}€`);
  console.log(`🎉 Économie: ${totals.savingsPercent}%`);

  return { aids, totals };
}

// ============================================================================
// EXEMPLE 5 : Vérification données manquantes
// ============================================================================

export function example5_CheckMissingData() {
  const incompleteParams: Partial<EligibilityParams> = {
    age: 10,
    quotient_familial: 500,
    // Données manquantes...
  };

  const missing = checkMissingData(incompleteParams);

  console.log('\n🎯 Exemple 5 : Vérification données manquantes');
  if (missing.length > 0) {
    console.log('⚠️ Données manquantes :');
    missing.forEach(field => console.log(`  - ${field}`));
  } else {
    console.log('✅ Toutes les données sont présentes');
  }

  return missing;
}

// ============================================================================
// EXÉCUTION DES EXEMPLES (pour démo)
// ============================================================================

export function runAllExamples() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  EXEMPLES D\'UTILISATION DU MOTEUR D\'AIDES FLOOOW');
  console.log('═══════════════════════════════════════════════════════');

  example1_PassSport();
  example2_Lyceen_QPV_Culture();
  example3_PassColo_VACAF();
  example4_Cumul_Maximum();
  example5_CheckMissingData();

  console.log('\n═══════════════════════════════════════════════════════');
}

// Décommenter pour tester :
// runAllExamples();
