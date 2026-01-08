-- ============================================================================
-- Migration: Add price_override support to calculate_family_aid RPC
-- Date: 2026-01-08
-- Author: Claude Code
-- ============================================================================
--
-- PROBLÈME CRITIQUE P0-3:
-- Les slots avec price_override (prix custom) n'étaient pas gérés
-- → Le booking utilisait toujours activity.price_base
-- → Prix incorrect facturé si un slot a un tarif spécial
--
-- SOLUTION:
-- Ajouter paramètre optionnel p_price_override à calculate_family_aid
-- Si fourni, il remplace price_base pour le calcul des aides
--
-- RÉTROCOMPATIBILITÉ:
-- ✅ Paramètre optionnel (DEFAULT NULL)
-- ✅ Les appels existants continuent de fonctionner
-- ✅ Seul bookings/index.ts l'utilise pour l'instant
-- ============================================================================

-- Drop old function signature (will be recreated with new signature)
DROP FUNCTION IF EXISTS calculate_family_aid(UUID, INTEGER, NUMERIC);

-- Recreate with price_override parameter
CREATE OR REPLACE FUNCTION calculate_family_aid(
  p_activity_id UUID,
  p_quotient_familial INTEGER,
  p_external_aid_euros NUMERIC DEFAULT 0,
  p_price_override NUMERIC DEFAULT NULL
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
  -- Si p_price_override fourni, l'utiliser au lieu de price_base
  -- ============================================================================
  SELECT
    COALESCE(p_price_override, price_base) AS price_base,
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
GRANT EXECUTE ON FUNCTION calculate_family_aid(UUID, INTEGER, NUMERIC, NUMERIC) TO authenticated, anon;

-- ============================================================================
-- Log de migration
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Migration price_override support appliquée';
  RAISE NOTICE '';
  RAISE NOTICE 'Modification: calculate_family_aid';
  RAISE NOTICE '  - Ajout paramètre p_price_override (NUMERIC, optionnel)';
  RAISE NOTICE '  - COALESCE(p_price_override, price_base) pour utiliser prix custom si fourni';
  RAISE NOTICE '  - Rétrocompatible: DEFAULT NULL';
  RAISE NOTICE '';
  RAISE NOTICE 'Impact:';
  RAISE NOTICE '  ✅ Slots avec tarifs spéciaux correctement facturés';
  RAISE NOTICE '  ✅ Aides calculées sur le prix réel du slot';
  RAISE NOTICE '  ✅ Cap 70%% appliqué sur prix custom';
  RAISE NOTICE '';
  RAISE NOTICE 'Fichiers modifiés:';
  RAISE NOTICE '  - supabase/functions/bookings/index.ts (utilise p_price_override)';
  RAISE NOTICE '  - supabase/functions/calculate_family_aid.sql (accept p_price_override)';
END $$;
