
-- Corriger search_path des fonctions (sans les supprimer)

CREATE OR REPLACE FUNCTION public.calculate_reste_a_charge(p_price_base numeric, p_simulated_aids jsonb)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  v_total_aids NUMERIC := 0;
  v_aid JSONB;
BEGIN
  IF p_simulated_aids IS NOT NULL THEN
    FOR v_aid IN SELECT * FROM jsonb_array_elements(p_simulated_aids)
    LOOP
      v_total_aids := v_total_aids + COALESCE((v_aid->>'montant')::numeric, 0);
    END LOOP;
  END IF;
  RETURN GREATEST(p_price_base - v_total_aids, 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_booking_slot()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.slot_id IS NULL THEN
    RAISE EXCEPTION 'slot_id est obligatoire pour créer une réservation'
      USING HINT = 'Veuillez sélectionner un créneau disponible';
  END IF;
  RETURN NEW;
END;
$$;
