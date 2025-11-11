-- Fix: Add search_path to slot management functions for security
CREATE OR REPLACE FUNCTION public.increment_slot_seats(slot_id UUID)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.availability_slots
  SET seats_remaining = LEAST(seats_remaining + 1, seats_total), updated_at = now()
  WHERE id = slot_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Slot % introuvable', slot_id; END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_slot_seats(slot_id UUID)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.availability_slots
  SET seats_remaining = GREATEST(seats_remaining - 1, 0), updated_at = now()
  WHERE id = slot_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Slot % introuvable', slot_id; END IF;
  PERFORM 1 FROM public.availability_slots WHERE id = slot_id AND seats_remaining < 0;
  IF FOUND THEN RAISE EXCEPTION 'Plus de places disponibles pour le slot %', slot_id; END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_slot_availability(slot_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_seats_remaining INT;
BEGIN
  SELECT seats_remaining INTO v_seats_remaining FROM public.availability_slots WHERE id = slot_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Slot % introuvable', slot_id; END IF;
  RETURN v_seats_remaining > 0;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_slot_availability(slot_id UUID)
RETURNS TABLE (total_seats INT, remaining_seats INT, booked_seats INT, availability_percentage NUMERIC) 
LANGUAGE plpgsql 
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT s.seats_total, s.seats_remaining, s.seats_total - s.seats_remaining AS booked_seats,
    ROUND((s.seats_remaining::NUMERIC / NULLIF(s.seats_total, 0)::NUMERIC) * 100, 2) AS availability_percentage
  FROM public.availability_slots s WHERE s.id = slot_id;
END;
$$;