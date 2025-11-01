-- ============================================================
-- Migration: Add pricing and aids tracking to bookings
-- Date: 2025-11-01
-- Purpose: Store base price, aids, and final price for each booking
-- Related: Fix reservation aids validation issue
-- ============================================================

-- 1. Add pricing and aids columns to bookings table
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS base_price_cents INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS aids_total_cents INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS final_price_cents INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS aids_applied JSONB DEFAULT '[]'::jsonb;

-- 2. Add check constraints to ensure data consistency
ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS check_price_consistency;

ALTER TABLE public.bookings
  ADD CONSTRAINT check_price_consistency
  CHECK (
    base_price_cents >= 0
    AND aids_total_cents >= 0
    AND final_price_cents >= 0
    AND final_price_cents <= base_price_cents
  );

ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS check_aids_not_exceed_price;

ALTER TABLE public.bookings
  ADD CONSTRAINT check_aids_not_exceed_price
  CHECK (aids_total_cents <= base_price_cents);

-- 3. Create index for analytics queries on pricing
CREATE INDEX IF NOT EXISTS idx_bookings_pricing
  ON public.bookings(base_price_cents, aids_total_cents, final_price_cents)
  WHERE base_price_cents > 0;

-- 4. Add comments for documentation
COMMENT ON COLUMN public.bookings.base_price_cents IS 'Prix de base de l''activité en centimes (sans aides)';
COMMENT ON COLUMN public.bookings.aids_total_cents IS 'Total des aides financières appliquées en centimes';
COMMENT ON COLUMN public.bookings.final_price_cents IS 'Prix final à payer en centimes (base_price - aids_total)';
COMMENT ON COLUMN public.bookings.aids_applied IS 'Liste des aides appliquées avec montants: [{aid_name, amount_cents, territory_level}]';

-- 5. Create helper view for booking pricing analytics
CREATE OR REPLACE VIEW public.booking_pricing_analytics AS
SELECT
  DATE_TRUNC('day', created_at) as booking_date,
  COUNT(*) as total_bookings,
  COUNT(*) FILTER (WHERE aids_total_cents > 0) as bookings_with_aids,
  ROUND(
    COUNT(*) FILTER (WHERE aids_total_cents > 0)::numeric /
    NULLIF(COUNT(*), 0) * 100,
    2
  ) as aids_usage_rate_pct,
  SUM(base_price_cents) / 100.0 as total_base_price_euros,
  SUM(aids_total_cents) / 100.0 as total_aids_euros,
  SUM(final_price_cents) / 100.0 as total_final_price_euros,
  AVG(aids_total_cents) FILTER (WHERE aids_total_cents > 0) / 100.0 as avg_aid_per_booking_euros
FROM public.bookings
WHERE base_price_cents > 0
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY booking_date DESC;

COMMENT ON VIEW public.booking_pricing_analytics IS
'Analytics sur les réservations avec aides financières: taux d''utilisation, montants moyens, etc.';

-- 6. Migration success log
DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed: Pricing and aids tracking added to bookings';
  RAISE NOTICE '   - Added columns: base_price_cents, aids_total_cents, final_price_cents, aids_applied';
  RAISE NOTICE '   - Added constraints: price consistency checks';
  RAISE NOTICE '   - Created view: booking_pricing_analytics';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '   - Update edge function to calculate/validate aids server-side';
  RAISE NOTICE '   - Update frontend to send pricing data with booking request';
END $$;
