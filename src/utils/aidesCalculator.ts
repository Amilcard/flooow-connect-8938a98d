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

export const QF_BRACKETS = [
  { min: 0, max: 450, montantAide: 50 },
  { min: 451, max: 700, montantAide: 40 },
  { min: 701, max: 1000, montantAide: 25 },
  { min: 1001, max: null, montantAide: 0 }
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
