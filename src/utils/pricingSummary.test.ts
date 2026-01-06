import { describe, expect, it } from "vitest";
import { computePricingSummary, computePricingSummaryFromSupabase } from "./pricingSummary";

describe("pricingSummary caps aids to avoid free demo pricing", () => {
  it("caps confirmed aids from Supabase when they exceed the price", () => {
    const summary = computePricingSummaryFromSupabase(
      [{ aid_name: "Aid A", aid_amount: 120, is_eligible: true }],
      {
        prix_initial: 120,
        prix_applicable: 120,
        reduction_pct: 0,
        tranche_appliquee: "N/A",
      },
      true
    );

    expect(summary.confirmedAidTotal).toBe(119);
    expect(summary.resteActuel).toBe(1);
  });

  it("caps potential aids from Supabase when no QF is provided", () => {
    const summary = computePricingSummaryFromSupabase(
      [{ aid_name: "Aid A", aid_amount: 200, is_eligible: true }],
      {
        prix_initial: 120,
        prix_applicable: 120,
        reduction_pct: 0,
        tranche_appliquee: "N/A",
      },
      false
    );

    expect(summary.potentialAidTotal).toBe(119);
    expect(summary.resteEstime).toBe(1);
  });

  it("caps combined aids in legacy summary", () => {
    const summary = computePricingSummary(120, {
      childId: "child-1",
      quotientFamilial: "800",
      cityCode: "42000",
      aids: [
        { aid_name: "Aid A", amount: 100, territory_level: "national", official_link: null },
        { aid_name: "Aid B", amount: 50, territory_level: "local", official_link: null },
      ],
      totalAids: 150,
      remainingPrice: 0,
    });

    expect(summary.confirmedAidTotal + summary.potentialAidTotal).toBe(119);
    expect(summary.resteEstime).toBe(1);
  });

  it("allows full price when aids are below price minus 1", () => {
    const summary = computePricingSummaryFromSupabase(
      [{ aid_name: "Aid A", aid_amount: 50, is_eligible: true }],
      {
        prix_initial: 120,
        prix_applicable: 120,
        reduction_pct: 0,
        tranche_appliquee: "N/A",
      },
      true
    );

    expect(summary.confirmedAidTotal).toBe(50);
    expect(summary.resteActuel).toBe(70);
  });

  it("handles free activities (price = 0)", () => {
    const summary = computePricingSummaryFromSupabase(
      [],
      {
        prix_initial: 0,
        prix_applicable: 0,
        reduction_pct: 0,
        tranche_appliquee: "N/A",
      },
      true
    );

    expect(summary.confirmedAidTotal).toBe(0);
    expect(summary.resteActuel).toBe(0);
  });
});
