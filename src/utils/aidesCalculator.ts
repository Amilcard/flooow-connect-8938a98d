/**
 * Calculateur d'aides financières Flooow
 * Fonction pure basée sur le Quotient Familial (QF)
 *
 * Spec: CALCULATEUR_AIDES_QF
 * Ne fait AUCUN appel Supabase direct - fonction pure réutilisable
 */

export interface AidCalculationParams {
  quotientFamilial: number;
  age: number;
  prixActivite: number;
}

export interface AidCalculationResult {
  montantAide: number;
  message: string;
  trancheQF: string;
}

export interface AidFromQFParams {
  qf: number;
  prixActivite: number;
}

export interface AidFromQFResult {
  aide: number;
  resteACharge: number;
  economiePourcent: number;
  trancheQF: string;
}

export const QF_BRACKETS = [
  { min: 0, max: 450, montantAide: 50 },
  { min: 451, max: 700, montantAide: 40 },
  { min: 701, max: 1000, montantAide: 25 },
  { min: 1001, max: null, montantAide: 0 }
] as const;

/**
 * Barème QF simplifié pour calcul d'aides (version utilisateur)
 * Utilisé par calculateAidFromQF
 */
export const QF_AID_BRACKETS = [
  { qf_min: 0, qf_max: 450, aide_euros: 50 },
  { qf_min: 451, qf_max: 700, aide_euros: 40 },
  { qf_min: 701, qf_max: 1000, aide_euros: 25 },
  { qf_min: 1001, qf_max: null, aide_euros: 0 }
] as const;

/**
 * Calcule le montant d'aide estimé selon le QF
 * @param params - Paramètres de calcul (QF, âge, prix activité)
 * @returns Résultat avec montant, message et tranche QF
 */
export function calculateEstimatedAid(params: AidCalculationParams): AidCalculationResult {
  const { quotientFamilial, age, prixActivite } = params;

  // Validation
  if (quotientFamilial < 0 || age < 0 || prixActivite < 0) {
    return {
      montantAide: 0,
      message: "Paramètres invalides",
      trancheQF: "N/A"
    };
  }

  // Déterminer la tranche QF
  let bracket = QF_BRACKETS[QF_BRACKETS.length - 1]; // Par défaut: dernière tranche (1001+)
  let trancheLabel = "1001€ et +";

  for (const b of QF_BRACKETS) {
    if (b.max === null) {
      // Dernière tranche (1001+)
      if (quotientFamilial >= b.min) {
        bracket = b;
        trancheLabel = `${b.min}€ et +`;
        break;
      }
    } else {
      // Tranches avec max défini
      if (quotientFamilial >= b.min && quotientFamilial <= b.max) {
        bracket = b;
        trancheLabel = `${b.min}–${b.max}€`;
        break;
      }
    }
  }

  const montantAide = bracket.montantAide;

  // Générer le message selon le montant
  let message: string;
  if (montantAide === 0) {
    message = "Aucune aide disponible pour ces critères";
  } else {
    message = `Profil QF ${trancheLabel} : aide estimée ${montantAide} €`;
  }

  return {
    montantAide,
    message,
    trancheQF: trancheLabel
  };
}

/**
 * Calcule le reste à charge après application de l'aide
 * @param prixInitial - Prix initial de l'activité
 * @param montantAide - Montant de l'aide calculée
 * @returns Reste à charge (ne peut pas être négatif)
 */
export function calculateResteACharge(prixInitial: number, montantAide: number): number {
  return Math.max(0, prixInitial - montantAide);
}

/**
 * Calcule le pourcentage d'économie
 * @param prixInitial - Prix initial de l'activité
 * @param montantAide - Montant de l'aide
 * @returns Pourcentage d'économie arrondi
 */
export function calculatePourcentageEconomie(prixInitial: number, montantAide: number): number {
  if (prixInitial <= 0) return 0;
  return Math.round((montantAide / prixInitial) * 100);
}

/**
 * Fonction centralisée pour calculer l'aide basée sur le QF
 * Utilisée par les deux écrans (simulateur global + détail activité)
 * 
 * @param params - QF et prix de l'activité
 * @returns Aide, reste à charge, % économie et tranche QF
 */
export function calculateAidFromQF(params: AidFromQFParams): AidFromQFResult {
  const { qf, prixActivite } = params;

  // Validation
  if (qf < 0 || prixActivite < 0) {
    return {
      aide: 0,
      resteACharge: prixActivite,
      economiePourcent: 0,
      trancheQF: "N/A"
    };
  }

  // Identifier la tranche QF
  let aide_euros = 0;
  let trancheLabel = "N/A";

  for (const bracket of QF_AID_BRACKETS) {
    if (bracket.qf_max === null) {
      // Dernière tranche (1001+)
      if (qf >= bracket.qf_min) {
        aide_euros = bracket.aide_euros;
        trancheLabel = `${bracket.qf_min}€ et +`;
        break;
      }
    } else {
      // Tranches avec max défini
      if (qf >= bracket.qf_min && qf <= bracket.qf_max) {
        aide_euros = bracket.aide_euros;
        trancheLabel = `${bracket.qf_min}–${bracket.qf_max}€`;
        break;
      }
    }
  }

  // Limiter l'aide au prix de l'activité (pas de reste négatif)
  const aide = Math.min(aide_euros, prixActivite);
  
  // Calculer reste à charge
  const resteACharge = Math.max(0, prixActivite - aide);
  
  // Calculer % économie
  const economiePourcent = prixActivite > 0 ? Math.round((aide / prixActivite) * 100) : 0;

  return {
    aide,
    resteACharge,
    economiePourcent,
    trancheQF: trancheLabel
  };
}
