-- Add transport_mode column to bookings
ALTER TABLE public.bookings 
ADD COLUMN transport_mode TEXT DEFAULT 'non_renseigne';

-- Add index for analytics queries
CREATE INDEX idx_bookings_transport_mode ON public.bookings(transport_mode) WHERE transport_mode IS NOT NULL;