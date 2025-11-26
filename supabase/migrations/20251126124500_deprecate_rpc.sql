-- Migration to deprecate the obsolete financial aid system
-- Date: 2025-11-26
-- Description: Marks the `calculate_eligible_aids` function and `financial_aids` table as deprecated.
-- This is a safe alternative to deletion, preserving data integrity while signaling obsolescence.

-- 1. Deprecate the RPC function
COMMENT ON FUNCTION calculate_eligible_aids(json) IS 'DEPRECATED: This function is no longer used by the frontend. Financial aid calculations are now handled client-side by FinancialAidEngine.ts. Do not use for new development.';

-- 2. Deprecate the table
COMMENT ON TABLE financial_aids IS 'DEPRECATED: This table is no longer the source of truth for financial aid calculations. Logic has moved to FinancialAidEngine.ts. Preserved for historical data only.';

-- 3. (Optional) Rename function to break any remaining unknown dependencies (Uncomment if desired)
-- ALTER FUNCTION calculate_eligible_aids(json) RENAME TO calculate_eligible_aids_deprecated;
