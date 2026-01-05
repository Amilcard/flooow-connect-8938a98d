/**
 * useResteACharge - Hook to calculate applicable price based on QF tranches
 *
 * Calls calculate_reste_a_charge() which applies QF-based pricing:
 * - QF 0-400: 50% reduction (tranche 1)
 * - QF 401-700: 30% reduction (tranche 2)
 * - QF 701-1000: 15% reduction (tranche 3)
 * - QF 1001+: Full price (plein_tarif)
 *
 * NOTE: QF tranches apply ONLY to VACANCES activities
 * SCOLAIRE activities use price_base directly
 *
 * @see supabase/functions calculate_reste_a_charge
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ResteAChargeResult {
  prix_initial: number;
  prix_applicable: number;
  reduction_pct: number;
  tranche_appliquee: string;
}

export interface UseResteAChargeParams {
  activityId: string;
  quotientFamilial?: number | null;
  periodType?: string | null;
  priceBase?: number; // Fallback if RPC fails
}

/**
 * Fetches applicable price based on QF tranches (VACANCES only)
 *
 * @param params - Activity ID, QF, and period type
 * @returns Query result with pricing information
 */
export function useResteACharge({
  activityId,
  quotientFamilial,
  periodType,
  priceBase = 0,
}: UseResteAChargeParams) {
  return useQuery({
    queryKey: ['reste-a-charge', activityId, quotientFamilial],
    queryFn: async (): Promise<ResteAChargeResult> => {
      // Don't call RPC for scolaire activities - they don't have QF tranches
      if (periodType === 'scolaire') {
        return {
          prix_initial: priceBase,
          prix_applicable: priceBase,
          reduction_pct: 0,
          tranche_appliquee: 'N/A (scolaire)',
        };
      }

      // If no QF provided, return base price
      if (!quotientFamilial) {
        return {
          prix_initial: priceBase,
          prix_applicable: priceBase,
          reduction_pct: 0,
          tranche_appliquee: 'Non renseigné',
        };
      }

      const { data, error } = await supabase.rpc('calculate_reste_a_charge', {
        p_activity_id: activityId,
        p_quotient_familial: quotientFamilial,
      });

      if (error) {
        console.error('[useResteACharge] RPC error:', error);
        // Return fallback with base price
        return {
          prix_initial: priceBase,
          prix_applicable: priceBase,
          reduction_pct: 0,
          tranche_appliquee: 'Erreur',
        };
      }

      // RPC returns an array with one result
      const result = Array.isArray(data) ? data[0] : data;

      if (!result) {
        return {
          prix_initial: priceBase,
          prix_applicable: priceBase,
          reduction_pct: 0,
          tranche_appliquee: 'Non disponible',
        };
      }

      return {
        prix_initial: Number(result.prix_initial) || priceBase,
        prix_applicable: Number(result.prix_applicable) || priceBase,
        reduction_pct: Number(result.reduction_pct) || 0,
        tranche_appliquee: result.tranche_appliquee || 'Standard',
      };
    },
    enabled: !!activityId,
    staleTime: 60000, // 1 minute cache
    gcTime: 300000, // 5 minute garbage collection
    retry: 1,
  });
}

/**
 * Calculate final reste à charge after aids
 *
 * @param prixApplicable - Price after QF reduction (for vacances) or base price (for scolaire)
 * @param totalAids - Sum of all eligible aids
 * @returns Final price (minimum 0)
 */
export function calculateFinalResteACharge(
  prixApplicable: number,
  totalAids: number
): number {
  return Math.max(0, prixApplicable - totalAids);
}
