/**
 * Calculateur d'aides financières Flooow
 * Barème basé sur Quotient Familial (QF)
 */

export const BAREME_AIDES = {
  TRANCHE_1: { max: 450, montant: 50, label: "QF 0-450€" },
  TRANCHE_2: { max: 700, montant: 40, label: "QF 451-700€" },
  TRANCHE_3: { max: 1000, montant: 25, label: "QF 701-1000€" },
  TRANCHE_4: { max: Infinity, montant: 0, label: "QF 1001€ et +" }
};

/**
 * Calcule le montant d'aide selon le QF
 * @param {number} qf - Quotient Familial
 * @returns {number} Montant de l'aide en euros
 */
export const calculerMontantAide = (qf) => {
  if (!qf || qf < 0) return 0;

  if (qf <= BAREME_AIDES.TRANCHE_1.max) return BAREME_AIDES.TRANCHE_1.montant;
  if (qf <= BAREME_AIDES.TRANCHE_2.max) return BAREME_AIDES.TRANCHE_2.montant;
  if (qf <= BAREME_AIDES.TRANCHE_3.max) return BAREME_AIDES.TRANCHE_3.montant;
  return BAREME_AIDES.TRANCHE_4.montant;
};

/**
 * Retourne la tranche QF applicable
 */
const getTranche = (qf) => {
  if (!qf || qf < 0) return "TRANCHE_4";
  if (qf <= 450) return "TRANCHE_1";
  if (qf <= 700) return "TRANCHE_2";
  if (qf <= 1000) return "TRANCHE_3";
  return "TRANCHE_4";
};

/**
 * Génère un message d'éligibilité
 */
const getMessageEligibilite = (montantAide, prixActivite) => {
  if (montantAide === 0) {
    return "Aucune aide disponible pour ce quotient familial";
  }
  if (montantAide >= prixActivite) {
    return "Activité entièrement prise en charge !";
  }
  return `Aide de ${montantAide}€ applicable`;
};

/**
 * Calcule l'aide pour une activité spécifique
 * @param {number} prixActivite - Prix de l'activité
 * @param {number} qf - Quotient Familial
 * @param {number} ageEnfant - Âge de l'enfant
 * @returns {Object} Détail du calcul
 */
export const calculerAidesParActivite = (prixActivite, qf, ageEnfant) => {
  const montantAide = calculerMontantAide(qf);

  // Plafonner l'aide au prix de l'activité
  const montantAideApplique = Math.min(montantAide, prixActivite);

  // Calculer reste à charge
  const resteACharge = Math.max(0, prixActivite - montantAideApplique);

  // Calculer pourcentage d'économie
  const pourcentageEconomie = prixActivite > 0
    ? Math.round((montantAideApplique / prixActivite) * 100)
    : 0;

  return {
    prixInitial: prixActivite,
    montantAide: montantAideApplique,
    resteACharge: resteACharge,
    tauxApplique: montantAide,
    trancheQF: getTranche(qf),
    eligibilite: montantAide > 0,
    pourcentageEconomie: pourcentageEconomie,
    message: getMessageEligibilite(montantAide, prixActivite)
  };
};

/**
 * Calcule les aides totales pour une famille
 * @param {Array} enfants - Liste des enfants avec leurs activités
 * @param {number} qf - Quotient Familial de la famille
 * @returns {Object} Récapitulatif des aides
 */
export const calculerAidesTotalesFamille = (enfants, qf) => {
  let totalAides = 0;
  let totalActivites = 0;
  let aidesParEnfant = [];

  enfants.forEach(enfant => {
    let aidesEnfant = 0;
    let nbActivitesEnfant = 0;

    if (enfant.activites && enfant.activites.length > 0) {
      enfant.activites.forEach(activite => {
        const calcul = calculerAidesParActivite(activite.prix, qf, enfant.age);
        aidesEnfant += calcul.montantAide;
        nbActivitesEnfant++;
      });
    }

    aidesParEnfant.push({
      enfantId: enfant.id,
      nom: enfant.prenom,
      age: enfant.age,
      montantTotal: aidesEnfant,
      nbActivites: nbActivitesEnfant
    });

    totalAides += aidesEnfant;
    totalActivites += nbActivitesEnfant;
  });

  return {
    montantTotal: totalAides,
    nombreActivites: totalActivites,
    aidesParEnfant: aidesParEnfant,
    qfUtilise: qf,
    trancheApplicable: getTranche(qf)
  };
};
