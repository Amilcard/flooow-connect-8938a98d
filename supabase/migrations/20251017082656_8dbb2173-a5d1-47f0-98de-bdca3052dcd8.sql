-- P1: Ajout des colonnes pour la gestion des périodes et validation des slots
-- Migration non-destructive avec IF NOT EXISTS

-- 1. Ajouter period_type aux activités (année_scolaire ou vacances)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'activities' 
    AND column_name = 'period_type'
  ) THEN
    ALTER TABLE public.activities 
    ADD COLUMN period_type TEXT CHECK (period_type IN ('annee_scolaire', 'vacances'));
    
    COMMENT ON COLUMN public.activities.period_type IS 'Type de période: annee_scolaire (récurrent hebdo) ou vacances (dates fixes)';
  END IF;
END $$;

-- 2. Ajouter vacation_periods aux activités (pour filtrage)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'activities' 
    AND column_name = 'vacation_periods'
  ) THEN
    ALTER TABLE public.activities 
    ADD COLUMN vacation_periods TEXT[];
    
    COMMENT ON COLUMN public.activities.vacation_periods IS 'Périodes de vacances concernées: toussaint_2025, noel_2025, hiver_2026, printemps_2026, ete_2026';
  END IF;
END $$;

-- 3. Rendre slot_id obligatoire pour les nouveaux bookings (après migration des données)
-- Note: On ne modifie pas les bookings existants, on applique juste pour le futur
DO $$ 
BEGIN
  -- Vérifier si la contrainte existe déjà
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'bookings_slot_id_required'
    AND table_name = 'bookings'
  ) THEN
    -- Créer un trigger de validation au lieu d'une contrainte NOT NULL
    -- pour permettre la migration progressive
    CREATE OR REPLACE FUNCTION validate_booking_slot()
    RETURNS TRIGGER AS $func$
    BEGIN
      -- Exiger slot_id pour toutes les nouvelles réservations
      IF NEW.slot_id IS NULL THEN
        RAISE EXCEPTION 'slot_id est obligatoire pour créer une réservation'
          USING HINT = 'Veuillez sélectionner un créneau disponible';
      END IF;
      
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;
    
    CREATE TRIGGER enforce_slot_id_on_booking
      BEFORE INSERT ON public.bookings
      FOR EACH ROW
      EXECUTE FUNCTION validate_booking_slot();
  END IF;
END $$;

-- 4. Fonction de validation d'éligibilité âge/période
CREATE OR REPLACE FUNCTION validate_booking_eligibility(
  p_child_id UUID,
  p_activity_id UUID,
  p_slot_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_child_age INTEGER;
  v_activity_age_min INTEGER;
  v_activity_age_max INTEGER;
  v_activity_period TEXT;
  v_slot_start TIMESTAMP;
  v_result JSONB;
BEGIN
  -- Récupérer l'âge de l'enfant
  SELECT EXTRACT(YEAR FROM AGE(dob))::INTEGER 
  INTO v_child_age
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
  SELECT start
  INTO v_slot_start
  FROM public.availability_slots
  WHERE id = p_slot_id;
  
  -- Vérifier la tranche d'âge
  IF v_child_age < v_activity_age_min OR v_child_age > v_activity_age_max THEN
    RETURN jsonb_build_object(
      'eligible', false,
      'reason', 'age_mismatch',
      'message', format('Cette activité est réservée aux %s-%s ans. Votre enfant a %s ans.', 
                       v_activity_age_min, v_activity_age_max, v_child_age),
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
  
  -- Tout est OK
  RETURN jsonb_build_object(
    'eligible', true,
    'child_age', v_child_age,
    'activity_age_range', jsonb_build_object(
      'min', v_activity_age_min,
      'max', v_activity_age_max
    ),
    'slot_start', v_slot_start
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION validate_booking_eligibility IS 'Valide l''éligibilité d''un enfant pour une réservation (âge + période)';

-- 5. Vue pour trouver des alternatives si slot complet
CREATE OR REPLACE VIEW vw_alternative_slots AS
SELECT 
  s.id as slot_id,
  s.activity_id,
  s.start,
  s.end,
  s.seats_remaining,
  s.seats_total,
  a.title as activity_title,
  a.category,
  a.age_min,
  a.age_max,
  a.price_base,
  a.period_type,
  st.name as structure_name,
  st.address as structure_address
FROM public.availability_slots s
INNER JOIN public.activities a ON a.id = s.activity_id
INNER JOIN public.structures st ON st.id = a.structure_id
WHERE s.seats_remaining > 0
  AND s.start >= NOW()
  AND s.start >= '2025-11-01'::DATE
  AND s.start <= '2026-08-30'::DATE
  AND a.published = true
ORDER BY s.start ASC;

COMMENT ON VIEW vw_alternative_slots IS 'Créneaux alternatifs disponibles avec détails activité/structure';

-- 6. Index pour performances
CREATE INDEX IF NOT EXISTS idx_activities_period_type 
  ON public.activities(period_type) WHERE period_type IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_slots_start_available 
  ON public.availability_slots(start, seats_remaining) 
  WHERE seats_remaining > 0;

CREATE INDEX IF NOT EXISTS idx_slots_activity_start 
  ON public.availability_slots(activity_id, start);
