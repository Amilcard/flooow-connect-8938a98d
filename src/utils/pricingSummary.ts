/**
 * Single source of truth for pricing calculations across all zones
 * Ensures consistent display of:
 * - Prix initial
 * - Aides confirmées
 * - Reste actuel
 * - Aides potentielles
 * - Reste estimé
 *
 * UPDATED: Now integrates with Supabase RPC functions for real eligibility
 */

import type { EligibleAid } from "@/hooks/useEligibleAids";
import type { ResteAChargeResult } from "@/hooks/useResteACharge";

export interface FinancialAid {
  aid_name: string;
  amount: number;
  territory_level: string;
  official_link: string | null;
  is_informational?: boolean;
  is_potential?: boolean;
}

export interface PricingSummary {
  /** Original activity price */
  priceInitial: number;
  /** Price after QF reduction (vacances only) */
  prixApplicable: number;
  /** QF reduction percentage */
  qfReductionPercent: number;
  /** QF tranche applied */
  trancheAppliquee: string;
  /** List of eligible aids with amounts */
  eligibleAids: Array<{ name: string; amount: number }>;
  /** Total confirmed aids (already applied) */
  confirmedAidTotal: number;
  /** Remaining price after confirmed aids */
  resteActuel: number;
  /** Total potential aids (require QF or other info to confirm) */
  potentialAidTotal: number;
  /** Estimated remaining price after all aids (confirmed + potential) */
  resteEstime: number;
  /** Whether there are any potential aids */
  hasPotentialAids: boolean;
  /** Whether there are any confirmed aids */
  hasConfirmedAids: boolean;
  /** Savings percentage from confirmed aids */
  savingsPercent: number;
  /** Potential savings percentage including potential aids */
  potentialSavingsPercent: number;
  /** Whether QF is provided */
  hasQf: boolean;
}

export interface AidsData {
  childId: string;
  quotientFamilial: string;
  cityCode: string;
  aids: FinancialAid[];
  totalAids: number;
  remainingPrice: number;
}

/**
 * Maximum percentage of price that can be covered by aids
 * Rule: 70% max coverage = 30% minimum reste à charge
 */
export const MAX_AID_COVERAGE_PERCENT = 0.70;

/**
 * Apply aid cap to ensure minimum remaining price
 *
 * RÈGLE CRITIQUE: Maximum 70% du prix couvert par les aides
 * - Reste à charge minimum = max(30% du prix, 1€)
 * - Évite l'affichage "gratuit" trompeur en démo
 *
 * @param price - The price to apply aids against
 * @param totalAids - Total amount of aids
 * @returns Object with applied aid amount, remaining price, and cap info
 */
export const applyAidCap = (price: number, totalAids: number): {
  applied: number;
  remaining: number;
  wasCapped: boolean;
  maxAllowed: number;
} => {
  if (price <= 0) {
    return { applied: 0, remaining: 0, wasCapped: false, maxAllowed: 0 };
  }

  // Minimum remaining = max(30% of price, 1€)
  const minRemaining = Math.max(price * (1 - MAX_AID_COVERAGE_PERCENT), 1);

  // Maximum aids = price - minimum remaining
  const maxAllowed = Math.max(price - minRemaining, 0);

  // Apply the cap
  const applied = Math.min(totalAids, maxAllowed);
  const remaining = price - applied;
  const wasCapped = totalAids > maxAllowed;

  return {
    applied,
    remaining,
    wasCapped,
    maxAllowed,
  };
};

/**
 * NEW: Compute pricing summary from Supabase RPC results
 * This is the preferred method - uses real eligibility from DB
 *
 * @param eligibleAids - Result from get_eligible_aids RPC
 * @param resteACharge - Result from calculate_reste_a_charge RPC
 * @param hasQf - Whether QF was provided (determines if aids are "confirmed" or "potential")
 * @returns A complete pricing summary for display
 */
export function computePricingSummaryFromSupabase(
  eligibleAids: EligibleAid[],
  resteACharge: ResteAChargeResult,
  hasQf: boolean
): PricingSummary {
  const { prix_initial, prix_applicable, reduction_pct, tranche_appliquee } = resteACharge;

  // Map eligible aids to display format
  const aidsWithAmounts = eligibleAids.map(aid => ({
    name: aid.aid_name,
    amount: Number(aid.aid_amount),
  }));

  // Calculate total aids
  const totalAids = aidsWithAmounts.reduce((sum, aid) => sum + aid.amount, 0);

  // Apply cap: maximum 70% coverage (30% minimum reste à charge)
  const cappedAids = applyAidCap(prix_applicable, totalAids);

  // If QF is provided, aids are "confirmed", otherwise "potential"
  const confirmedAidTotal = hasQf ? cappedAids.applied : 0;
  const potentialAidTotal = hasQf ? 0 : cappedAids.applied;

  // Calculate reste à charge
  const resteActuel = hasQf ? cappedAids.remaining : prix_applicable;
  const resteEstime = hasQf ? Math.max(0, prix_applicable - totalAids) : cappedAids.remaining;

  // Percentages
  const savingsPercent = prix_initial > 0
    ? Math.round((confirmedAidTotal / prix_initial) * 100)
    : 0;

  const potentialSavingsPercent = prix_initial > 0
    ? Math.round(((confirmedAidTotal + potentialAidTotal) / prix_initial) * 100)
    : 0;

  return {
    priceInitial: prix_initial,
    prixApplicable: prix_applicable,
    qfReductionPercent: reduction_pct,
    trancheAppliquee: tranche_appliquee,
    eligibleAids: aidsWithAmounts,
    confirmedAidTotal,
    resteActuel,
    potentialAidTotal,
    resteEstime,
    hasPotentialAids: potentialAidTotal > 0,
    hasConfirmedAids: confirmedAidTotal > 0,
    savingsPercent,
    potentialSavingsPercent,
    hasQf,
  };
}

/**
 * @deprecated Use computePricingSummaryFromSupabase instead
 * Compute a comprehensive pricing summary from aids data
 * This is the single source of truth for all pricing displays
 *
 * @param priceBase - The base price of the activity
 * @param aidsData - The calculated aids data (or null if not calculated)
 * @returns A complete pricing summary for display
 */
export function computePricingSummary(
  priceBase: number,
  aidsData: AidsData | null
): PricingSummary {
  // No aids calculated - return base price only
  if (!aidsData || !aidsData.aids || aidsData.aids.length === 0) {
    return {
      priceInitial: priceBase,
      prixApplicable: priceBase,
      qfReductionPercent: 0,
      trancheAppliquee: 'N/A',
      eligibleAids: [],
      confirmedAidTotal: 0,
      resteActuel: priceBase,
      potentialAidTotal: 0,
      resteEstime: priceBase,
      hasPotentialAids: false,
      hasConfirmedAids: false,
      savingsPercent: 0,
      potentialSavingsPercent: 0,
      hasQf: false,
    };
  }

  // Separate confirmed vs potential aids
  const confirmedAids = aidsData.aids.filter(a => !a.is_potential);
  const potentialAids = aidsData.aids.filter(a => a.is_potential);

  // Map to eligibleAids format
  const eligibleAids = aidsData.aids.map(a => ({
    name: a.aid_name,
    amount: Number(a.amount),
  }));

  // Calculate totals (capped at 70% of price)
  const rawConfirmedTotal = confirmedAids.reduce((sum, aid) => sum + Number(aid.amount), 0);
  const rawPotentialTotal = potentialAids.reduce((sum, aid) => sum + Number(aid.amount), 0);

  // Apply cap: maximum 70% coverage (30% minimum reste à charge)
  const cappedTotals = applyAidCap(priceBase, rawConfirmedTotal + rawPotentialTotal);

  // Confirmed aids cannot exceed capped total
  const confirmedAidTotal = Math.min(rawConfirmedTotal, cappedTotals.applied);

  // Remaining after confirmed aids
  const resteActuel = Math.max(0, priceBase - confirmedAidTotal);

  // Potential aids cannot reduce remaining below demo floor
  const remainingAidCapacity = Math.max(cappedTotals.applied - confirmedAidTotal, 0);
  const potentialAidTotal = Math.min(rawPotentialTotal, remainingAidCapacity);

  // Final estimated remaining
  const resteEstime = Math.max(0, priceBase - (confirmedAidTotal + potentialAidTotal));

  // Percentages
  const savingsPercent = priceBase > 0
    ? Math.round((confirmedAidTotal / priceBase) * 100)
    : 0;

  const potentialSavingsPercent = priceBase > 0
    ? Math.round(((confirmedAidTotal + potentialAidTotal) / priceBase) * 100)
    : 0;

  return {
    priceInitial: priceBase,
    prixApplicable: priceBase,
    qfReductionPercent: 0,
    trancheAppliquee: 'N/A',
    eligibleAids,
    confirmedAidTotal,
    resteActuel,
    potentialAidTotal,
    resteEstime,
    hasPotentialAids: potentialAidTotal > 0,
    hasConfirmedAids: confirmedAidTotal > 0,
    savingsPercent,
    potentialSavingsPercent,
    hasQf: !!aidsData.quotientFamilial,
  };
}

/**
 * Format a price for display (French locale)
 */
export function formatPrice(amount: number, showDecimals = true): string {
  if (amount === 0) return "Gratuit";
  return showDecimals
    ? `${amount.toFixed(2)}€`
    : `${Math.round(amount)}€`;
}
