/**
 * Calculateur d'aides financières Flooow
 * 
 * ⚠️ MIGRATION P0-3: Ce fichier est DÉPRÉCIÉ
 * 
 * La source de vérité est maintenant:
 * - Table Supabase: aid_grid
 * - RPC: calculate_aid_from_price() / calculate_family_aid()
 * - Hook React: useAidCalculation
 * 
 * Ce fichier est conservé pour:
 * 1. Référence historique
 * 2. Rollback d'urgence si nécessaire
 * 
 * @deprecated Utiliser useAidCalculation à la place
 * @version 1.0.0 - LEGACY
 * @date 2026-01-08
 */

// ============================================================================
// EXPORTS POUR COMPATIBILITÉ (redirigent vers le nouveau système)
// ============================================================================

export { 
  useAidCalculation,
  AID_DISPLAY_BRACKETS,
  getQFBracketLabel 
} from '@/hooks/useAidCalculation';

// ============================================================================
// ANCIEN CODE - CONSERVÉ POUR ROLLBACK D'URGENCE
// Décommenter uniquement si la RPC Supabase est indisponible
// ============================================================================

/*
// ============================================================================
// LEGACY: Types
// ============================================================================

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

// ============================================================================
// LEGACY: Barème QF (OBSOLÈTE - ne plus utiliser)
// Les vraies valeurs sont dans la table aid_grid
// ============================================================================

export const QF_AID_BRACKETS_LEGACY = [
  { qf_min: 0, qf_max: 450, aide_euros: 50 },
  { qf_min: 451, qf_max: 700, aide_euros: 40 },
  { qf_min: 701, qf_max: 1000, aide_euros: 25 },
  { qf_min: 1001, qf_max: null, aide_euros: 0 }
] as const;

// ============================================================================
// LEGACY: Fonction de calcul (OBSOLÈTE - ne plus utiliser)
// ============================================================================

export function calculateAidFromQFLegacy(params: AidFromQFParams): AidFromQFResult {
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

  for (const bracket of QF_AID_BRACKETS_LEGACY) {
    if (bracket.qf_max === null) {
      if (qf >= bracket.qf_min) {
        aide_euros = bracket.aide_euros;
        trancheLabel = `${bracket.qf_min}€ et +`;
        break;
      }
    } else {
      if (qf >= bracket.qf_min && qf <= bracket.qf_max) {
        aide_euros = bracket.aide_euros;
        trancheLabel = `${bracket.qf_min}–${bracket.qf_max}€`;
        break;
      }
    }
  }

  // Limiter l'aide au prix de l'activité
  const aide = Math.min(aide_euros, prixActivite);
  const resteACharge = Math.max(0, prixActivite - aide);
  const economiePourcent = prixActivite > 0 ? Math.round((aide / prixActivite) * 100) : 0;

  return {
    aide,
    resteACharge,
    economiePourcent,
    trancheQF: trancheLabel
  };
}
*/

// ============================================================================
// FIN DU FICHIER - NE PAS AJOUTER DE NOUVEAU CODE ICI
// Utiliser useAidCalculation pour toute nouvelle implémentation
// ============================================================================
