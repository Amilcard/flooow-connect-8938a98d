/**
 * TESTS UNITAIRES - Moteur d'Aides Financières
 * Validation de chaque règle d'éligibilité
 */

import {
  calculateAllEligibleAids,
  EligibilityParams,
  CalculatedAid,
} from '../FinancialAidEngine';

// ============================================================================
// HELPERS
// ============================================================================

const createBaseParams = (): EligibilityParams => ({
  age: 10,
  conditions_sociales: {
    beneficie_ARS: false,
    beneficie_AEEH: false,
    beneficie_AESH: false,
    beneficie_bourse: false,
    beneficie_ASE: false,
  },
  statut_scolaire: 'primaire',
  quotient_familial: 500,
  nb_fratrie: 1,
  allocataire_caf: false,
  code_postal: '42000',
  ville: 'Saint-Etienne',
  departement: 42,
  est_qpv: false,
  type_activite: 'sport',
  prix_activite: 100,
  periode: 'saison_scolaire',
});

// ============================================================================
// TESTS PAR AIDE
// ============================================================================

describe('FinancialAidEngine', () => {
  describe('1. Pass\'Sport (50€)', () => {
    it('devrait être éligible si 6-17 ans + condition sociale + sport', () => {
      const params = createBaseParams();
      params.age = 10;
      params.type_activite = 'sport';
      params.conditions_sociales.beneficie_ARS = true;

      const aids = calculateAllEligibleAids(params);
      const passSport = aids.find(aid => aid.code === 'PASS_SPORT');

      expect(passSport).toBeDefined();
      expect(passSport?.eligible).toBe(true);
      expect(passSport?.montant).toBe(50);
    });

    it('ne devrait PAS être éligible si pas de condition sociale', () => {
      const params = createBaseParams();
      params.age = 10;
      params.type_activite = 'sport';
      // Aucune condition sociale activée

      const aids = calculateAllEligibleAids(params);
      const passSport = aids.find(aid => aid.code === 'PASS_SPORT');

      expect(passSport).toBeUndefined(); // Pas dans la liste des aides éligibles
    });

    it('ne devrait PAS être éligible si âge < 6 ans', () => {
      const params = createBaseParams();
      params.age = 5;
      params.conditions_sociales.beneficie_ARS = true;

      const aids = calculateAllEligibleAids(params);
      const passSport = aids.find(aid => aid.code === 'PASS_SPORT');

      expect(passSport).toBeUndefined();
    });
  });

  describe('2. Pass Culture (20-30€)', () => {
    it('devrait donner 20€ pour un enfant de 15 ans', () => {
      const params = createBaseParams();
      params.age = 15;
      params.type_activite = 'culture';

      const aids = calculateAllEligibleAids(params);
      const passCulture = aids.find(aid => aid.code === 'PASS_CULTURE');

      expect(passCulture).toBeDefined();
      expect(passCulture?.montant).toBe(20);
    });

    it('devrait donner 30€ pour un enfant de 17 ans', () => {
      const params = createBaseParams();
      params.age = 17;
      params.type_activite = 'culture';

      const aids = calculateAllEligibleAids(params);
      const passCulture = aids.find(aid => aid.code === 'PASS_CULTURE');

      expect(passCulture).toBeDefined();
      expect(passCulture?.montant).toBe(30);
    });

    it('ne devrait PAS être éligible si âge < 15 ans', () => {
      const params = createBaseParams();
      params.age = 14;
      params.type_activite = 'culture';

      const aids = calculateAllEligibleAids(params);
      const passCulture = aids.find(aid => aid.code === 'PASS_CULTURE');

      expect(passCulture).toBeUndefined();
    });
  });

  describe('3. Pass Colo (200-350€)', () => {
    it('devrait être éligible uniquement pour 11 ans + vacances', () => {
      const params = createBaseParams();
      params.age = 11;
      params.type_activite = 'vacances';
      params.periode = 'vacances'; // Required for vacation aids
      params.quotient_familial = 150;

      const aids = calculateAllEligibleAids(params);
      const passColo = aids.find(aid => aid.code === 'PASS_COLO');

      expect(passColo).toBeDefined();
      expect(passColo?.montant).toBe(100); // Limité au prix activité (100€)
    });

    it('devrait donner 350€ pour QF ≤200€', () => {
      const params = createBaseParams();
      params.age = 11;
      params.type_activite = 'vacances';
      params.periode = 'vacances'; // Required for vacation aids
      params.quotient_familial = 150;
      params.prix_activite = 500; // Prix élevé pour voir le vrai montant

      const aids = calculateAllEligibleAids(params);
      const passColo = aids.find(aid => aid.code === 'PASS_COLO');

      expect(passColo?.montant).toBe(350);
    });

    it('ne devrait PAS être éligible pour 10 ou 12 ans', () => {
      const params = createBaseParams();
      params.type_activite = 'vacances';
      params.periode = 'vacances'; // Required for vacation aids
      params.quotient_familial = 150;

      params.age = 10;
      let aids = calculateAllEligibleAids(params);
      let passColo = aids.find(aid => aid.code === 'PASS_COLO');
      expect(passColo).toBeUndefined();

      params.age = 12;
      aids = calculateAllEligibleAids(params);
      passColo = aids.find(aid => aid.code === 'PASS_COLO');
      expect(passColo).toBeUndefined();
    });
  });

  describe('4. VACAF AVE (séjours labellisés)', () => {
    it('devrait être éligible si CAF + séjour labellisé + QF ≤900', () => {
      const params = createBaseParams();
      params.age = 10;
      params.type_activite = 'vacances';
      params.periode = 'vacances'; // Required for vacation aids
      params.allocataire_caf = true;
      params.sejour_labellise = true;
      params.quotient_familial = 500;

      const aids = calculateAllEligibleAids(params);
      const vacafAVE = aids.find(aid => aid.code === 'VACAF_AVE');

      expect(vacafAVE).toBeDefined();
      expect(vacafAVE?.eligible).toBe(true);
    });

    it('ne devrait PAS être éligible si séjour non labellisé', () => {
      const params = createBaseParams();
      params.type_activite = 'vacances';
      params.periode = 'vacances'; // Required for vacation aids
      params.allocataire_caf = true;
      params.sejour_labellise = false;
      params.quotient_familial = 500;

      const aids = calculateAllEligibleAids(params);
      const vacafAVE = aids.find(aid => aid.code === 'VACAF_AVE');

      expect(vacafAVE).toBeUndefined();
    });
  });

  describe('6. Pass\'Région (30€)', () => {
    it('devrait être éligible uniquement pour les lycéens', () => {
      const params = createBaseParams();
      params.statut_scolaire = 'lycee';

      const aids = calculateAllEligibleAids(params);
      const passRegion = aids.find(aid => aid.code === 'PASS_REGION');

      expect(passRegion).toBeDefined();
      expect(passRegion?.montant).toBe(30);
    });

    it('ne devrait PAS être éligible pour collégiens', () => {
      const params = createBaseParams();
      params.statut_scolaire = 'college';

      const aids = calculateAllEligibleAids(params);
      const passRegion = aids.find(aid => aid.code === 'PASS_REGION');

      expect(passRegion).toBeUndefined();
    });
  });

  describe('7. CAF Loire Temps Libre (20-80€)', () => {
    it('devrait donner 80€ pour QF ≤350€', () => {
      const params = createBaseParams();
      params.allocataire_caf = true;
      params.quotient_familial = 300;
      params.age = 10;
      params.periode = 'vacances'; // CAF Loire only applies to vacation period

      const aids = calculateAllEligibleAids(params);
      const cafLoire = aids.find(aid => aid.code === 'CAF_LOIRE_TEMPS_LIBRE');

      expect(cafLoire).toBeDefined();
      expect(cafLoire?.montant).toBe(80);
    });

    it('devrait donner 20€ pour QF 701-850€', () => {
      const params = createBaseParams();
      params.allocataire_caf = true;
      params.quotient_familial = 800;
      params.periode = 'vacances'; // CAF Loire only applies to vacation period

      const aids = calculateAllEligibleAids(params);
      const cafLoire = aids.find(aid => aid.code === 'CAF_LOIRE_TEMPS_LIBRE');

      expect(cafLoire).toBeDefined();
      expect(cafLoire?.montant).toBe(20);
    });
  });

  describe('8. Chèques Loisirs 42 (30€)', () => {
    it('devrait être éligible si département 42 + QF ≤900', () => {
      const params = createBaseParams();
      params.departement = 42;
      params.quotient_familial = 500;

      const aids = calculateAllEligibleAids(params);
      const cheques = aids.find(aid => aid.code === 'CHEQUES_LOISIRS_42');

      expect(cheques).toBeDefined();
      expect(cheques?.montant).toBe(30);
    });

    it('ne devrait PAS être éligible pour autre département', () => {
      const params = createBaseParams();
      params.departement = 69; // Rhône
      params.quotient_familial = 500;

      const aids = calculateAllEligibleAids(params);
      const cheques = aids.find(aid => aid.code === 'CHEQUES_LOISIRS_42');

      expect(cheques).toBeUndefined();
    });
  });

  describe('10. Carte BÔGE (10€)', () => {
    it('devrait être éligible pour 13-29 ans', () => {
      const params = createBaseParams();
      params.age = 16;

      const aids = calculateAllEligibleAids(params);
      const boge = aids.find(aid => aid.code === 'CARTE_BOGE');

      expect(boge).toBeDefined();
      expect(boge?.montant).toBe(10);
    });

    it('ne devrait PAS être éligible pour moins de 13 ans', () => {
      const params = createBaseParams();
      params.age = 12;

      const aids = calculateAllEligibleAids(params);
      const boge = aids.find(aid => aid.code === 'CARTE_BOGE');

      expect(boge).toBeUndefined();
    });
  });

  describe('11. Bonus QPV (20€)', () => {
    it('devrait être éligible si résidence en QPV', () => {
      const params = createBaseParams();
      params.est_qpv = true;

      const aids = calculateAllEligibleAids(params);
      const bonusQPV = aids.find(aid => aid.code === 'BONUS_QPV_SEM');

      expect(bonusQPV).toBeDefined();
      expect(bonusQPV?.montant).toBe(20);
    });
  });

  describe('12. Réduction fratrie (10%)', () => {
    it('devrait donner 10% de réduction pour 2+ enfants', () => {
      const params = createBaseParams();
      params.nb_fratrie = 3;
      params.prix_activite = 100;

      const aids = calculateAllEligibleAids(params);
      const fratrie = aids.find(aid => aid.code === 'REDUCTION_FRATRIE');

      expect(fratrie).toBeDefined();
      expect(fratrie?.montant).toBe(10); // 10% de 100€
    });

    it('ne devrait PAS être éligible pour enfant unique', () => {
      const params = createBaseParams();
      params.nb_fratrie = 1;

      const aids = calculateAllEligibleAids(params);
      const fratrie = aids.find(aid => aid.code === 'REDUCTION_FRATRIE');

      expect(fratrie).toBeUndefined();
    });
  });

  describe('CUMUL D\'AIDES', () => {
    it('devrait cumuler plusieurs aides éligibles', () => {
      const params = createBaseParams();
      params.age = 16;
      params.type_activite = 'sport';
      params.conditions_sociales.beneficie_ARS = true; // Pass'Sport
      params.statut_scolaire = 'lycee'; // Pass'Région
      params.est_qpv = true; // Bonus QPV
      params.nb_fratrie = 2; // Réduction fratrie
      params.prix_activite = 200;

      const aids = calculateAllEligibleAids(params);

      expect(aids.length).toBeGreaterThanOrEqual(4);
      expect(aids.find(aid => aid.code === 'PASS_SPORT')).toBeDefined();
      expect(aids.find(aid => aid.code === 'PASS_REGION')).toBeDefined();
      expect(aids.find(aid => aid.code === 'BONUS_QPV_SEM')).toBeDefined();
      expect(aids.find(aid => aid.code === 'REDUCTION_FRATRIE')).toBeDefined();
    });
  });
});
