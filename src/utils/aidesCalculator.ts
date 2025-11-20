/**
 * Calculateur d'aides financières Flooow
 * Fonction pure basée sur le Quotient Familial (QF)
 *
 * Spec: CALCULATEUR_AIDES_QF
 * Ne fait AUCUN appel Supabase direct - fonction pure réutilisable
 *
 * NOTE: Cette module utilise une seule source de vérité pour les tranches QF
 * afin de garantir la cohérence entre tous les écrans (simulateur, détail activité, mes aides)
 */

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

/**
 * Barème QF unique - SOURCE DE VÉRITÉ pour toute l'application
 * Utilisé par calculateAidFromQF et pour l'affichage des tranches
 */
export const QF_AID_BRACKETS = [
  { qf_min: 0, qf_max: 450, aide_euros: 50 },
  { qf_min: 451, qf_max: 700, aide_euros: 40 },
  { qf_min: 701, qf_max: 1000, aide_euros: 25 },
  { qf_min: 1001, qf_max: null, aide_euros: 0 }
] as const;

/**
 * @deprecated Utiliser QF_AID_BRACKETS à la place
 * Gardé temporairement pour compatibilité avec code existant
 */
export const QF_BRACKETS = [
  { min: 0, max: 450, montantAide: 50 },
  { min: 451, max: 700, montantAide: 40 },
  { min: 701, max: 1000, montantAide: 25 },
  { min: 1001, max: null, montantAide: 0 }
] as const;


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
