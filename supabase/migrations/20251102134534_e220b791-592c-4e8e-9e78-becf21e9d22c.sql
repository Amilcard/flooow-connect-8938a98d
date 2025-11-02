-- Add missing aids_applied column to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS aids_applied jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.bookings.aids_applied IS 'List of financial aids applied to this booking (aid_id, amount, etc.)';