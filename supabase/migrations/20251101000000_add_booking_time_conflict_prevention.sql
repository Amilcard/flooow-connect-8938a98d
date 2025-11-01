-- Migration: Prevent time conflicts for child bookings
-- Ensures a child cannot be booked for overlapping time slots
-- Date: 2025-11-01
-- Related: Test #2 - Time conflicts detection

-- 1. Enable btree_gist extension (required for EXCLUDE constraint with mixed types)
CREATE EXTENSION IF NOT EXISTS btree_gist;

COMMENT ON EXTENSION btree_gist IS 'Extension pour contraintes EXCLUDE avec types mixtes (UUID + range)';

-- 2. Add EXCLUDE constraint to prevent overlapping bookings for same child
-- This constraint will automatically reject any INSERT/UPDATE that would create a time conflict

DO $$
BEGIN
  -- Check if constraint doesn't already exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'bookings_no_child_time_overlap'
  ) THEN
    -- Add the EXCLUDE constraint
    -- Syntax: EXCLUDE USING gist (column1 WITH operator, column2 WITH operator)
    -- We need to create a tstzrange from the slot's start/end times dynamically

    -- Note: We can't directly use a subquery in EXCLUDE, so we'll use a different approach
    -- We'll add a trigger-based solution instead for better flexibility

    RAISE NOTICE 'Adding time conflict prevention via trigger (EXCLUDE constraint requires materialized range column)';
  END IF;
END $$;

-- 3. Create function to check for time conflicts
CREATE OR REPLACE FUNCTION check_booking_time_conflict()
RETURNS TRIGGER AS $$
DECLARE
  v_new_start TIMESTAMPTZ;
  v_new_end TIMESTAMPTZ;
  v_conflict_count INTEGER;
  v_conflict_activity TEXT;
  v_conflict_start TIMESTAMPTZ;
  v_conflict_end TIMESTAMPTZ;
BEGIN
  -- Only check for active bookings (not cancelled/rejected)
  IF NEW.status NOT IN ('en_attente', 'validee') THEN
    RETURN NEW;
  END IF;

  -- Get the time range of the new booking's slot
  SELECT start, "end"
  INTO v_new_start, v_new_end
  FROM public.availability_slots
  WHERE id = NEW.slot_id;

  IF v_new_start IS NULL OR v_new_end IS NULL THEN
    RAISE EXCEPTION 'Slot % not found', NEW.slot_id;
  END IF;

  -- Check for overlapping bookings for the same child
  -- Overlap condition: (StartA < EndB) AND (EndA > StartB)
  SELECT COUNT(*)
  INTO v_conflict_count
  FROM public.bookings b
  JOIN public.availability_slots s ON b.slot_id = s.id
  WHERE b.child_id = NEW.child_id
    AND b.id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID) -- Exclude self on UPDATE
    AND b.status IN ('en_attente', 'validee')
    AND (
      -- Check for time overlap
      (v_new_start < s."end" AND v_new_end > s.start)
    );

  -- If conflict found, get details and raise error
  IF v_conflict_count > 0 THEN
    SELECT
      a.title,
      s.start,
      s."end"
    INTO
      v_conflict_activity,
      v_conflict_start,
      v_conflict_end
    FROM public.bookings b
    JOIN public.availability_slots s ON b.slot_id = s.id
    JOIN public.activities a ON b.activity_id = a.id
    WHERE b.child_id = NEW.child_id
      AND b.id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
      AND b.status IN ('en_attente', 'validee')
      AND (v_new_start < s."end" AND v_new_end > s.start)
    LIMIT 1;

    RAISE EXCEPTION 'Conflit horaire: L''enfant est déjà inscrit à "%" de % à %',
      v_conflict_activity,
      to_char(v_conflict_start, 'DD/MM/YYYY HH24:MI'),
      to_char(v_conflict_end, 'HH24:MI')
      USING HINT = 'Veuillez choisir un autre créneau ou annuler la réservation existante',
            ERRCODE = '23P01'; -- exclusion_violation
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_booking_time_conflict IS
'Vérifie qu''un enfant n''est pas déjà réservé sur un créneau qui chevauche. Déclenché avant INSERT/UPDATE sur bookings.';

-- 4. Create trigger on bookings table
DROP TRIGGER IF EXISTS prevent_booking_time_conflicts ON public.bookings;

CREATE TRIGGER prevent_booking_time_conflicts
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_booking_time_conflict();

COMMENT ON TRIGGER prevent_booking_time_conflicts ON public.bookings IS
'Empêche la création de réservations avec chevauchements horaires pour un même enfant';

-- 5. Update validate_booking_eligibility function to include conflict check
-- This provides an earlier check with better error messages for the API

CREATE OR REPLACE FUNCTION validate_booking_eligibility(
  p_child_id UUID,
  p_activity_id UUID,
  p_slot_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_child_age INTEGER;
  v_child_name TEXT;
  v_activity_age_min INTEGER;
  v_activity_age_max INTEGER;
  v_activity_period TEXT;
  v_slot_start TIMESTAMPTZ;
  v_slot_end TIMESTAMPTZ;
  v_conflict_count INTEGER;
  v_conflict_activity TEXT;
  v_conflict_start TIMESTAMPTZ;
  v_conflict_end TIMESTAMPTZ;
BEGIN
  -- Récupérer l'âge et le nom de l'enfant
  SELECT
    EXTRACT(YEAR FROM AGE(dob))::INTEGER,
    first_name
  INTO v_child_age, v_child_name
  FROM public.children
  WHERE id = p_child_id;

  IF v_child_age IS NULL THEN
    RETURN jsonb_build_object(
      'eligible', false,
      'reason', 'child_not_found',
      'message', 'Enfant introuvable'
    );
  END IF;

  -- Récupérer les critères de l'activité
  SELECT age_min, age_max, period_type
  INTO v_activity_age_min, v_activity_age_max, v_activity_period
  FROM public.activities
  WHERE id = p_activity_id;

  -- Récupérer la date du slot
  SELECT start, "end"
  INTO v_slot_start, v_slot_end
  FROM public.availability_slots
  WHERE id = p_slot_id;

  IF v_slot_start IS NULL THEN
    RETURN jsonb_build_object(
      'eligible', false,
      'reason', 'slot_not_found',
      'message', 'Créneau introuvable'
    );
  END IF;

  -- Vérifier la tranche d'âge
  IF v_child_age < v_activity_age_min OR v_child_age > v_activity_age_max THEN
    RETURN jsonb_build_object(
      'eligible', false,
      'reason', 'age_mismatch',
      'message', format('Cette activité est réservée aux %s-%s ans. %s a %s ans.',
                       v_activity_age_min, v_activity_age_max, v_child_name, v_child_age),
      'child_age', v_child_age,
      'required_age_min', v_activity_age_min,
      'required_age_max', v_activity_age_max
    );
  END IF;

  -- Vérifier la période (slot dans fenêtre 01/11/2025 - 30/08/2026)
  IF v_slot_start < '2025-11-01'::DATE OR v_slot_start > '2026-08-30'::DATE THEN
    RETURN jsonb_build_object(
      'eligible', false,
      'reason', 'slot_outside_period',
      'message', 'Ce créneau n''est pas dans la période de prestation (01/11/2025 - 30/08/2026)',
      'slot_start', v_slot_start
    );
  END IF;

  -- ✅ NOUVEAU: Vérifier les conflits horaires
  SELECT COUNT(*)
  INTO v_conflict_count
  FROM public.bookings b
  JOIN public.availability_slots s ON b.slot_id = s.id
  WHERE b.child_id = p_child_id
    AND b.status IN ('en_attente', 'validee')
    AND (
      -- Détection de chevauchement: (StartA < EndB) AND (EndA > StartB)
      v_slot_start < s."end" AND v_slot_end > s.start
    );

  IF v_conflict_count > 0 THEN
    -- Récupérer les détails du conflit
    SELECT
      a.title,
      s.start,
      s."end"
    INTO
      v_conflict_activity,
      v_conflict_start,
      v_conflict_end
    FROM public.bookings b
    JOIN public.availability_slots s ON b.slot_id = s.id
    JOIN public.activities a ON b.activity_id = a.id
    WHERE b.child_id = p_child_id
      AND b.status IN ('en_attente', 'validee')
      AND (v_slot_start < s."end" AND v_slot_end > s.start)
    LIMIT 1;

    RETURN jsonb_build_object(
      'eligible', false,
      'reason', 'time_conflict',
      'message', format('%s est déjà inscrit à "%s" de %s à %s',
                       v_child_name,
                       v_conflict_activity,
                       to_char(v_conflict_start, 'DD/MM HH24:MI'),
                       to_char(v_conflict_end, 'HH24:MI')),
      'conflicting_booking', jsonb_build_object(
        'activity_title', v_conflict_activity,
        'start', v_conflict_start,
        'end', v_conflict_end
      )
    );
  END IF;

  -- Tout est OK
  RETURN jsonb_build_object(
    'eligible', true,
    'child_age', v_child_age,
    'child_name', v_child_name,
    'activity_age_range', jsonb_build_object(
      'min', v_activity_age_min,
      'max', v_activity_age_max
    ),
    'slot_start', v_slot_start,
    'slot_end', v_slot_end
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION validate_booking_eligibility IS
'Valide l''éligibilité d''un enfant pour une réservation: âge, période, et conflits horaires';

-- 6. Create index for performance on conflict checks
CREATE INDEX IF NOT EXISTS idx_bookings_child_status_slot
  ON public.bookings(child_id, status, slot_id)
  WHERE status IN ('en_attente', 'validee');

COMMENT ON INDEX idx_bookings_child_status_slot IS
'Optimise les requêtes de détection de conflits horaires par enfant';

-- 7. Add test data validation (optional - for manual testing)
DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed: Time conflict prevention active';
  RAISE NOTICE '   - Trigger prevent_booking_time_conflicts installed';
  RAISE NOTICE '   - Function validate_booking_eligibility updated with conflict check';
  RAISE NOTICE '   - Index idx_bookings_child_status_slot created';
  RAISE NOTICE '';
  RAISE NOTICE 'Test: Try creating 2 overlapping bookings for same child → should FAIL';
END $$;
