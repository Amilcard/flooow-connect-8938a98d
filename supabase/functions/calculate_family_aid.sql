-- ============================================================================
-- RPC: calculate_family_aid
-- Description: Calculate family aid based on aid_grid (source of truth)
--
-- INPUT:
--   p_activity_id: UUID of activity
--   p_quotient_familial: QF in euros
--   p_external_aid_euros: External aids (Pass'Sport, etc.) - default 0
--
-- OUTPUT: JSON
--   {
--     "total_aid_euros": 95.50,
--     "aid_percentage": 45,
--     "remaining_euros": 105.50,
--     "price_type": "scolaire",
--     "qf_bracket": "QF < 500"
--   }
--
-- BUSINESS RULES:
--   - RAC minimum 30% (famille paie toujours au moins 30%)
--   - Aides externes cumulables avec limite RAC 30%
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_family_aid(
  p_activity_id UUID,
  p_quotient_familial INTEGER,
  p_external_aid_euros NUMERIC DEFAULT 0
)
RETURNS JSON
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_price_base NUMERIC;
  v_price_type TEXT;
  v_qf_threshold INTEGER;
  v_reduction_euros NUMERIC;
  v_total_aid NUMERIC;
  v_remaining NUMERIC;
  v_aid_percentage INTEGER;
  v_qf_label TEXT;
  v_min_remaining NUMERIC; -- 30% du prix
BEGIN
  -- ============================================================================
  -- ÉTAPE 1: Récupérer le prix et type de l'activité
  -- ============================================================================
  SELECT
    price_base,
    CASE
      WHEN period_type = 'vacances' AND price_unit = 'stage' THEN 'stage'
      WHEN period_type = 'vacances' AND price_unit = 'sejour' THEN 'sejour'
      ELSE 'scolaire'
    END
  INTO v_price_base, v_price_type
  FROM activities
  WHERE id = p_activity_id;

  -- Activité non trouvée
  IF v_price_base IS NULL THEN
    RETURN json_build_object(
      'error', 'Activity not found',
      'total_aid_euros', 0,
      'aid_percentage', 0,
      'remaining_euros', 0
    );
  END IF;

  -- ============================================================================
  -- ÉTAPE 2: Déterminer le seuil QF
  -- ============================================================================
  v_qf_threshold := CASE
    WHEN p_quotient_familial < 500 THEN 500
    WHEN p_quotient_familial < 800 THEN 800
    WHEN p_quotient_familial < 1200 THEN 1200
    ELSE 9999
  END;

  v_qf_label := CASE v_qf_threshold
    WHEN 500 THEN 'QF < 500'
    WHEN 800 THEN 'QF 500-799'
    WHEN 1200 THEN 'QF 800-1199'
    ELSE 'QF ≥ 1200'
  END;

  -- ============================================================================
  -- ÉTAPE 3: Lire la réduction depuis aid_grid (SOURCE OF TRUTH)
  -- ============================================================================
  SELECT reduction_euros
  INTO v_reduction_euros
  FROM aid_grid
  WHERE
    price_type = v_price_type
    AND v_price_base >= price_min
    AND v_price_base <= price_max
    AND qf_threshold = v_qf_threshold
  LIMIT 1;

  -- Aucune aide trouvée dans la grille
  IF v_reduction_euros IS NULL THEN
    v_reduction_euros := 0;
  END IF;

  -- ============================================================================
  -- ÉTAPE 4: Appliquer la règle RAC minimum 30%
  -- ============================================================================
  -- Calcul: Total aides = aide QF + aides externes
  v_total_aid := v_reduction_euros + p_external_aid_euros;

  -- RAC minimum = 30% du prix
  v_min_remaining := v_price_base * 0.30;

  -- Si les aides dépassent 70%, on les plafonne
  IF (v_price_base - v_total_aid) < v_min_remaining THEN
    v_total_aid := v_price_base - v_min_remaining;
  END IF;

  -- Reste à charge final
  v_remaining := GREATEST(v_price_base - v_total_aid, 0);

  -- Pourcentage d'aide
  v_aid_percentage := CASE
    WHEN v_price_base > 0 THEN ROUND((v_total_aid / v_price_base) * 100)::INTEGER
    ELSE 0
  END;

  -- ============================================================================
  -- ÉTAPE 5: Retour JSON
  -- ============================================================================
  RETURN json_build_object(
    'total_aid_euros', ROUND(v_total_aid, 2),
    'aid_percentage', v_aid_percentage,
    'remaining_euros', ROUND(v_remaining, 2),
    'price_type', v_price_type,
    'qf_bracket', v_qf_label,
    'price_base', v_price_base,
    'qf_reduction', v_reduction_euros,
    'external_aids', p_external_aid_euros
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'error', SQLERRM,
      'total_aid_euros', 0,
      'aid_percentage', 0,
      'remaining_euros', v_price_base
    );
END;
$$;

-- ============================================================================
-- Grant permissions
-- ============================================================================
GRANT EXECUTE ON FUNCTION calculate_family_aid(UUID, INTEGER, NUMERIC) TO authenticated, anon;

-- ============================================================================
-- Test examples
-- ============================================================================
COMMENT ON FUNCTION calculate_family_aid IS '
Calcule l''aide famille basée sur aid_grid (source of truth)

EXEMPLES:
-- Gymnastique 190€, QF 350
SELECT calculate_family_aid(''activity-uuid''::UUID, 350, 0);
--> {"total_aid_euros": 95, "remaining_euros": 95, "qf_bracket": "QF < 500"}

-- Danse 320€, QF 650 + Pass''Sport 50€
SELECT calculate_family_aid(''activity-uuid''::UUID, 650, 50);
--> {"total_aid_euros": 145, "remaining_euros": 175}

-- Test RAC minimum 30%: Piano 420€, QF 300 + Pass''Sport 50€
-- Aide QF=150 + Pass''Sport=50 = 200€ → RAC = 220€ (>30% ✓)
SELECT calculate_family_aid(''activity-uuid''::UUID, 300, 50);
';
