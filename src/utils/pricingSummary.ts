/**
 * Single source of truth for pricing calculations across all zones
 * Ensures consistent display of:
 * - Prix initial
 * - Aides confirmées
 * - Reste actuel
 * - Aides potentielles
 * - Reste estimé
 */

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
      confirmedAidTotal: 0,
      resteActuel: priceBase,
      potentialAidTotal: 0,
      resteEstime: priceBase,
      hasPotentialAids: false,
      hasConfirmedAids: false,
      savingsPercent: 0,
      potentialSavingsPercent: 0,
    };
  }

  // Separate confirmed vs potential aids
  const confirmedAids = aidsData.aids.filter(a => !a.is_potential);
  const potentialAids = aidsData.aids.filter(a => a.is_potential);

  // Calculate totals (capped at price)
  const rawConfirmedTotal = confirmedAids.reduce((sum, aid) => sum + Number(aid.amount), 0);
  const rawPotentialTotal = potentialAids.reduce((sum, aid) => sum + Number(aid.amount), 0);

  // Confirmed aids cannot exceed price
  const confirmedAidTotal = Math.min(priceBase, rawConfirmedTotal);

  // Remaining after confirmed aids
  const resteActuel = Math.max(0, priceBase - confirmedAidTotal);

  // Potential aids cannot reduce remaining below 0
  const potentialAidTotal = Math.min(resteActuel, rawPotentialTotal);

  // Final estimated remaining
  const resteEstime = Math.max(0, resteActuel - potentialAidTotal);

  // Percentages
  const savingsPercent = priceBase > 0
    ? Math.round((confirmedAidTotal / priceBase) * 100)
    : 0;

  const potentialSavingsPercent = priceBase > 0
    ? Math.round(((confirmedAidTotal + potentialAidTotal) / priceBase) * 100)
    : 0;

  return {
    priceInitial: priceBase,
    confirmedAidTotal,
    resteActuel,
    potentialAidTotal,
    resteEstime,
    hasPotentialAids: potentialAidTotal > 0,
    hasConfirmedAids: confirmedAidTotal > 0,
    savingsPercent,
    potentialSavingsPercent,
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
