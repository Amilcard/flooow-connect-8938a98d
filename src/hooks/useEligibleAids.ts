/**
 * useEligibleAids - Hook to fetch eligible aids from Supabase RPC
 *
 * Calls get_eligible_aids() which respects:
 * - Activity's accepts_aid_types (only shows aids the activity accepts)
 * - Eligibility criteria (QF, age, territory, QPV, etc.)
 *
 * @see supabase/functions get_eligible_aids
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EligibleAid {
  aid_name: string;
  aid_amount: number;
  aid_type: 'fixed' | 'percentage';
  is_eligible: boolean;
  reason: string | null;
}

export interface UseEligibleAidsParams {
  activityId: string;
  childAge?: number | null;
  quotientFamilial?: number | null;
  isQpv?: boolean;
  territoryCode?: string;
  nbChildren?: number;
}

/**
 * Fetches eligible aids for an activity based on family profile
 *
 * @param params - Activity ID and family profile data
 * @returns Query result with eligible aids array (filtered to is_eligible=true)
 */
export function useEligibleAids({
  activityId,
  childAge,
  quotientFamilial,
  isQpv = false,
  territoryCode = '42', // Default to Loire
  nbChildren = 1,
}: UseEligibleAidsParams) {
  return useQuery({
    queryKey: ['eligible-aids', activityId, childAge, quotientFamilial, isQpv, territoryCode, nbChildren],
    queryFn: async (): Promise<EligibleAid[]> => {
      // Don't call if no activity ID
      if (!activityId) return [];

      const { data, error } = await supabase.rpc('get_eligible_aids', {
        p_activity_id: activityId,
        p_age: childAge ?? 10, // Default age if not provided
        p_qf: quotientFamilial ?? 0, // Default QF if not provided (will show potential)
        p_is_qpv: isQpv,
        p_territory_code: territoryCode,
        p_nb_children: nbChildren,
      });

      if (error) {
        console.error('[useEligibleAids] RPC error:', error);
        // Don't throw - return empty array to avoid breaking UI
        return [];
      }

      // Filter to only eligible aids
      const eligibleAids = (data || []).filter((aid: EligibleAid) => aid.is_eligible);

      return eligibleAids;
    },
    enabled: !!activityId,
    staleTime: 60000, // 1 minute cache
    gcTime: 300000, // 5 minute garbage collection
    retry: 1,
  });
}

/**
 * Calculate total eligible aids amount
 */
export function calculateTotalAids(aids: EligibleAid[]): number {
  return aids.reduce((sum, aid) => sum + Number(aid.aid_amount), 0);
}
