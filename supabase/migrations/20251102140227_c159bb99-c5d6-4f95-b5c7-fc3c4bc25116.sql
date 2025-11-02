-- Fix bookings schema mismatch with backend function
-- 1) Add missing pricing columns used by backend
ALTER TABLE public.bookings 
  ADD COLUMN IF NOT EXISTS base_price_cents integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS aids_total_cents integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS final_price_cents integer NOT NULL DEFAULT 0;

-- 2) Ensure aids_applied column exists (JSONB array)
ALTER TABLE public.bookings 
  ADD COLUMN IF NOT EXISTS aids_applied jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.bookings.base_price_cents IS 'Activity base price in cents at booking time';
COMMENT ON COLUMN public.bookings.aids_total_cents IS 'Total financial aids applied in cents';
COMMENT ON COLUMN public.bookings.final_price_cents IS 'Final price to pay in cents after aids';
COMMENT ON COLUMN public.bookings.aids_applied IS 'List of aids applied with amounts in cents';

-- 3) Add triggers for slot validation + atomic seat decrement if not present
DO $$
BEGIN
  -- Drop and recreate to ensure correct definition
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'validate_booking_slot_before_insert'
  ) THEN
    DROP TRIGGER validate_booking_slot_before_insert ON public.bookings;
  END IF;

  CREATE TRIGGER validate_booking_slot_before_insert
  BEFORE INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_booking_slot();

  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'booking_after_insert_seat_decrement'
  ) THEN
    DROP TRIGGER booking_after_insert_seat_decrement ON public.bookings;
  END IF;

  CREATE TRIGGER booking_after_insert_seat_decrement
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_booking_creation();
END $$;