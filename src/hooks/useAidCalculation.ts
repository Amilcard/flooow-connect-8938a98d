/**
 * Hook unifié pour le calcul d'aides financières Flooow
 * 
 * MIGRATION P0-2: Remplace les calculs TS locaux par appel RPC Supabase
 * Source de vérité: table aid_grid + RPC calculate_aid_from_price()
 * 
 * @version 2.0.0 - Migration RPC
 * @date 2026-01-08
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export interface AidCalculationParams {
  price: number;
  priceType?: 'scolaire' | 'stage' | 'sejour';
  quotientFamilial: number | null;
  externalAidEuros?: number;
}

export interface AidCalculationResult {
  priceBase: number;
  priceType: string;
  quotientFamilial: number;
  gridReductionEuros: number;
  externalAidEuros: number;
  totalAidEuros: number;
  remainingEuros: number;
  aidPercentage: number;
  racPercentage: number;
  capApplied: boolean;
  calculationMethod: string;
  calculatedAt: string;
}

export interface UseAidCalculationReturn {
  calculate: (params: AidCalculationParams) => Promise<AidCalculationResult | null>;
  result: AidCalculationResult | null;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useAidCalculation(): UseAidCalculationReturn {
  const [result, setResult] = useState<AidCalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = useCallback(async (params: AidCalculationParams): Promise<AidCalculationResult | null> => {
    const { price, priceType = 'scolaire', quotientFamilial, externalAidEuros = 0 } = params;

    // Validation basique
    if (price <= 0) {
      const emptyResult: AidCalculationResult = {
        priceBase: price,
        priceType,
        quotientFamilial: quotientFamilial ?? 99999,
        gridReductionEuros: 0,
        externalAidEuros: 0,
        totalAidEuros: 0,
        remainingEuros: price,
        aidPercentage: 0,
        racPercentage: 100,
        capApplied: false,
        calculationMethod: 'validation_skip',
        calculatedAt: new Date().toISOString(),
      };
      setResult(emptyResult);
      return emptyResult;
    }

    setLoading(true);
    setError(null);

    try {
      // Appel RPC Supabase
      const { data, error: rpcError } = await supabase.rpc('calculate_aid_from_price', {
        p_price: price,
        p_price_type: priceType,
        p_quotient_familial: quotientFamilial,
        p_external_aid_euros: externalAidEuros,
      });

      if (rpcError) {
        console.error('[useAidCalculation] RPC error:', rpcError);
        setError(rpcError.message);
        
        // Fallback: calcul local désactivé pour cohérence
        // Si besoin de fallback, décommenter et importer calculateAidFromQFLegacy
        // const fallback = calculateAidFromQFLegacy({ qf: quotientFamilial ?? 0, prixActivite: price });
        // ...
        
        return null;
      }

      // Mapper la réponse RPC vers notre interface
      const mappedResult: AidCalculationResult = {
        priceBase: data.price_base,
        priceType: data.price_type,
        quotientFamilial: data.quotient_familial,
        gridReductionEuros: data.grid_reduction_euros,
        externalAidEuros: data.external_aid_euros,
        totalAidEuros: data.total_aid_euros,
        remainingEuros: data.remaining_euros,
        aidPercentage: data.aid_percentage,
        racPercentage: data.rac_percentage,
        capApplied: data.cap_applied,
        calculationMethod: data.calculation_method,
        calculatedAt: data.calculated_at,
      };

      setResult(mappedResult);
      return mappedResult;

    } catch (err) {
      console.error('[useAidCalculation] Unexpected error:', err);
      setError('Erreur inattendue lors du calcul');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    calculate,
    result,
    loading,
    error,
    reset,
  };
}

// ============================================================================
// FONCTION SYNCHRONE POUR AFFICHAGE BARÈME (lecture seule)
// ============================================================================

/**
 * Grille d'aides pour affichage UI uniquement
 * Source de vérité = table aid_grid (cette constante est pour l'affichage du barème)
 */
export const AID_DISPLAY_BRACKETS = [
  { qf_min: 0, qf_max: 499, label: '0 – 499€', description: 'Aide maximale' },
  { qf_min: 500, qf_max: 799, label: '500 – 799€', description: 'Aide intermédiaire' },
  { qf_min: 800, qf_max: 1199, label: '800 – 1199€', description: 'Aide réduite' },
  { qf_min: 1200, qf_max: null, label: '1200€ et +', description: 'Pas d\'aide QF' },
] as const;

/**
 * Retourne le label de tranche QF pour affichage
 */
export function getQFBracketLabel(qf: number): string {
  for (const bracket of AID_DISPLAY_BRACKETS) {
    if (bracket.qf_max === null) {
      if (qf >= bracket.qf_min) return bracket.label;
    } else {
      if (qf >= bracket.qf_min && qf <= bracket.qf_max) return bracket.label;
    }
  }
  return 'N/A';
}
