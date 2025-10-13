-- Create function to atomically decrement seats remaining
CREATE OR REPLACE FUNCTION public.decrement_seat_atomic(
  _slot_id uuid,
  _booking_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _current_seats integer;
  _result jsonb;
BEGIN
  -- Lock the row for update to prevent race conditions
  SELECT seats_remaining INTO _current_seats
  FROM availability_slots
  WHERE id = _slot_id
  FOR UPDATE;

  -- Check if seats are available
  IF _current_seats <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'NO_SEATS_AVAILABLE',
      'message', 'Aucune place disponible'
    );
  END IF;

  -- Decrement the seat
  UPDATE availability_slots
  SET seats_remaining = seats_remaining - 1,
      updated_at = now()
  WHERE id = _slot_id;

  -- Update booking history
  UPDATE bookings
  SET history = COALESCE(history, '[]'::jsonb) || 
    jsonb_build_array(
      jsonb_build_object(
        'timestamp', now(),
        'action', 'seat_reserved',
        'seats_before', _current_seats,
        'seats_after', _current_seats - 1
      )
    ),
    updated_at = now()
  WHERE id = _booking_id;

  RETURN jsonb_build_object(
    'success', true,
    'seats_remaining', _current_seats - 1
  );
END;
$$;

-- Create trigger to handle booking creation with atomic seat decrement
CREATE OR REPLACE FUNCTION public.handle_booking_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _result jsonb;
BEGIN
  -- Call atomic decrement function
  _result := public.decrement_seat_atomic(NEW.slot_id, NEW.id);

  -- Check if decrement was successful
  IF (_result->>'success')::boolean = false THEN
    RAISE EXCEPTION '%', _result->>'message';
  END IF;

  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_booking_created ON bookings;

CREATE TRIGGER on_booking_created
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_booking_creation();

-- Add index on idempotency_key for faster lookups
CREATE INDEX IF NOT EXISTS idx_bookings_idempotency_key ON bookings(idempotency_key);

-- Add constraint to ensure idempotency_key uniqueness
ALTER TABLE bookings 
  DROP CONSTRAINT IF EXISTS unique_idempotency_key;

ALTER TABLE bookings
  ADD CONSTRAINT unique_idempotency_key UNIQUE (idempotency_key);