/**
 * useAidCalculation - Hook to call calculate_family_aid RPC
 *
 * SOURCE OF TRUTH: Supabase aid_grid table + RPC
 * Replaces local calculateAidFromQF() function
 *
 * @version 2.0.0 - Migration to Supabase RPC
 * @date 2026-01-08
 */

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { safeErrorMessage } from '@/utils/sanitize';

// ============================================================================
// TYPES
// ============================================================================

export interface AidCalculationParams {
  activityId?: string;  // If provided, uses activity price from DB
  price?: number;       // If no activityId, use this price
  priceType?: 'scolaire' | 'stage' | 'sejour';
  quotientFamilial: number;
  externalAidEuros?: number; // Pass'Sport, etc.
}

export interface AidCalculationResult {
  totalAidEuros: number;
  aidPercentage: number;
  remainingEuros: number;
  priceType: string;
  qfBracket: string;
  priceBase: number;
  qfReduction: number;
  externalAids: number;
}

// ============================================================================
// DISPLAY BRACKETS (for UI rendering)
// ============================================================================

export const AID_DISPLAY_BRACKETS = [
  { label: 'QF < 500', min: 0, max: 499, description: 'Aide maximale' },
  { label: 'QF 500-799', min: 500, max: 799, description: 'Aide moyenne' },
  { label: 'QF 800-1199', min: 800, max: 1199, description: 'Aide réduite' },
  { label: 'QF ≥ 1200', min: 1200, max: 9999, description: 'Aucune aide' },
] as const;

/**
 * Get QF bracket label from QF value
 */
export function getQFBracketLabel(qf: number): string {
  if (qf < 500) return 'QF < 500';
  if (qf < 800) return 'QF 500-799';
  if (qf < 1200) return 'QF 800-1199';
  return 'QF ≥ 1200';
}

// ============================================================================
// HOOK
// ============================================================================

export function useAidCalculation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Calculate aid using Supabase RPC (source of truth)
   */
  const calculate = async (params: AidCalculationParams): Promise<AidCalculationResult | null> => {
    const {
      activityId,
      price,
      priceType = 'scolaire',
      quotientFamilial,
      externalAidEuros = 0
    } = params;

    setLoading(true);
    setError(null);

    try {
      // Case 1: With activityId - fetch from DB and use RPC
      if (activityId) {
        const { data, error: rpcError } = await supabase.rpc('calculate_family_aid', {
          p_activity_id: activityId,
          p_quotient_familial: quotientFamilial,
          p_external_aid_euros: externalAidEuros
        });

        if (rpcError) {
          console.error('[useAidCalculation] RPC error:', rpcError);
          setError(rpcError.message);
          return null;
        }

        return {
          totalAidEuros: data.total_aid_euros,
          aidPercentage: data.aid_percentage,
          remainingEuros: data.remaining_euros,
          priceType: data.price_type,
          qfBracket: data.qf_bracket,
          priceBase: data.price_base,
          qfReduction: data.qf_reduction,
          externalAids: data.external_aids
        };
      }

      // Case 2: No activityId - simulate with provided price
      // We need to query aid_grid directly since we don't have an activity
      if (!price) {
        throw new Error('Either activityId or price must be provided');
      }

      // Determine QF threshold
      const qfThreshold = quotientFamilial < 500 ? 500
        : quotientFamilial < 800 ? 800
        : quotientFamilial < 1200 ? 1200
        : 9999;

      // Query aid_grid for reduction
      const { data: gridData, error: gridError } = await supabase
        .from('aid_grid')
        .select('reduction_euros')
        .eq('price_type', priceType)
        .lte('price_min', price)
        .gte('price_max', price)
        .eq('qf_threshold', qfThreshold)
        .single();

      if (gridError) {
        console.error('[useAidCalculation] Grid query error:', gridError);
        // No aid found in grid, return 0
        return {
          totalAidEuros: 0,
          aidPercentage: 0,
          remainingEuros: price,
          priceType,
          qfBracket: getQFBracketLabel(quotientFamilial),
          priceBase: price,
          qfReduction: 0,
          externalAids: 0
        };
      }

      const qfReduction = gridData?.reduction_euros || 0;

      // Apply RAC minimum 30% rule
      let totalAid = qfReduction + externalAidEuros;
      const minRemaining = price * 0.30;

      if ((price - totalAid) < minRemaining) {
        totalAid = price - minRemaining;
      }

      const remaining = Math.max(price - totalAid, 0);
      const aidPercentage = price > 0 ? Math.round((totalAid / price) * 100) : 0;

      return {
        totalAidEuros: Math.round(totalAid * 100) / 100, // Round to 2 decimals
        aidPercentage,
        remainingEuros: Math.round(remaining * 100) / 100,
        priceType,
        qfBracket: getQFBracketLabel(quotientFamilial),
        priceBase: price,
        qfReduction,
        externalAids: externalAidEuros
      };

    } catch (err) {
      const errorMsg = safeErrorMessage(err, 'useAidCalculation.calculate');
      console.error(errorMsg);
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    calculate,
    loading,
    error
  };
}
