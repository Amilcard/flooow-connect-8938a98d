-- ============================================
-- MIGRATION: Plafonnement aides financières 70%
-- Date: 2026-01-06
-- Auteur: Claude
-- ============================================
--
-- RÈGLE MÉTIER: Maximum 70% du prix couvert par les aides
-- - Reste à charge minimum = max(30% du prix, 1€)
-- - Évite l'affichage "gratuit" trompeur
--
-- TRANCHES QF HARMONISÉES (pour activités vacances):
-- - QF 0-450: 50% reduction (tranche 1)
-- - QF 451-700: 30% reduction (tranche 2)
-- - QF 701-1000: 15% reduction (tranche 3)
-- - QF 1001+: Full price (plein_tarif)
-- ============================================

-- Constante pour le plafond maximum des aides (70%)
DO $$
BEGIN
  -- Create a schema-level constant if needed (for documentation)
  RAISE NOTICE 'MAX_AID_COVERAGE_PERCENT = 0.70 (70%% max coverage)';
  RAISE NOTICE 'MIN_REMAINING_PERCENT = 0.30 (30%% minimum reste à charge)';
END $$;

-- ============================================
-- FONCTION: get_eligible_aids avec plafond 70%
-- ============================================
-- Note: Cette fonction est appelée par useEligibleAids.ts
-- Elle retourne les aides éligibles AVEC plafonnement automatique

CREATE OR REPLACE FUNCTION public.get_eligible_aids(
  p_activity_id UUID,
  p_age INTEGER DEFAULT 10,
  p_qf INTEGER DEFAULT 0,
  p_is_qpv BOOLEAN DEFAULT FALSE,
  p_territory_code TEXT DEFAULT '42',
  p_nb_children INTEGER DEFAULT 1
)
RETURNS TABLE(
  aid_name TEXT,
  aid_amount NUMERIC,
  aid_type TEXT,
  is_eligible BOOLEAN,
  reason TEXT,
  is_capped BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_activity RECORD;
  v_total_aids NUMERIC := 0;
  v_max_aids NUMERIC;
  v_price NUMERIC;
BEGIN
  -- Récupérer l'activité
  SELECT a.id, a.price_base, a.accepts_aid_types, a.period_type
  INTO v_activity
  FROM activities a
  WHERE a.id = p_activity_id;

  IF v_activity IS NULL THEN
    RETURN;
  END IF;

  v_price := COALESCE(v_activity.price_base, 0);

  -- RÈGLE CRITIQUE: Maximum 70% du prix couvert par les aides
  -- Reste à charge minimum = max(30% du prix, 1€)
  v_max_aids := GREATEST(v_price * 0.70, 0);
  IF v_price > 0 THEN
    v_max_aids := LEAST(v_max_aids, v_price - 1); -- Au moins 1€ de reste
  END IF;

  -- Retourner les aides potentielles avec indication de plafonnement
  -- Note: La logique complète d'éligibilité est dans FinancialAidEngine.ts côté front
  -- Cette fonction sert de fallback/validation serveur

  RETURN QUERY
  WITH potential_aids AS (
    -- Pass'Sport (50€, sport, 6-17 ans, condition sociale)
    SELECT
      'Pass''Sport'::TEXT as name,
      50::NUMERIC as amount,
      'fixed'::TEXT as type,
      (p_age >= 6 AND p_age <= 17 AND v_activity.period_type = 'scolaire') as eligible,
      CASE
        WHEN p_age < 6 OR p_age > 17 THEN 'Âge non éligible (6-17 ans)'
        WHEN v_activity.period_type != 'scolaire' THEN 'Activité scolaire uniquement'
        ELSE NULL
      END as ineligibility_reason

    UNION ALL

    -- Pass Culture (20-30€, culture, 15-17 ans)
    SELECT
      'Pass Culture'::TEXT,
      CASE WHEN p_age = 15 THEN 20 ELSE 30 END::NUMERIC,
      'fixed'::TEXT,
      (p_age >= 15 AND p_age <= 17),
      CASE
        WHEN p_age < 15 THEN 'Disponible à partir de 15 ans'
        WHEN p_age > 17 THEN 'Âge non éligible (15-17 ans)'
        ELSE NULL
      END

    UNION ALL

    -- Carte BÔGE (10€, 13-29 ans)
    SELECT
      'Carte BÔGE'::TEXT,
      10::NUMERIC,
      'fixed'::TEXT,
      (p_age >= 13 AND p_age <= 29),
      CASE
        WHEN p_age < 13 OR p_age > 29 THEN 'Âge non éligible (13-29 ans)'
        ELSE NULL
      END

    UNION ALL

    -- Chèques Loisirs Loire (30€, QF ≤ 900)
    SELECT
      'Chèques Loisirs Loire'::TEXT,
      30::NUMERIC,
      'fixed'::TEXT,
      (p_territory_code = '42' AND p_qf <= 900 AND p_qf > 0),
      CASE
        WHEN p_territory_code != '42' THEN 'Département Loire uniquement'
        WHEN p_qf > 900 THEN 'QF maximum 900€'
        WHEN p_qf = 0 THEN 'QF requis'
        ELSE NULL
      END

    UNION ALL

    -- Bonus QPV (20€)
    SELECT
      'Bonus QPV'::TEXT,
      20::NUMERIC,
      'fixed'::TEXT,
      p_is_qpv,
      CASE
        WHEN NOT p_is_qpv THEN 'Résidence en QPV requise'
        ELSE NULL
      END
  )
  SELECT
    pa.name,
    CASE
      -- Appliquer le plafond progressif
      WHEN pa.eligible AND (v_total_aids + pa.amount) <= v_max_aids THEN pa.amount
      WHEN pa.eligible AND v_total_aids < v_max_aids THEN v_max_aids - v_total_aids
      ELSE 0
    END,
    pa.type,
    pa.eligible,
    pa.ineligibility_reason,
    (pa.eligible AND (v_total_aids + pa.amount) > v_max_aids) as is_capped
  FROM potential_aids pa;

END;
$$;

-- ============================================
-- FONCTION: calculate_reste_a_charge avec tranches QF harmonisées
-- ============================================

CREATE OR REPLACE FUNCTION public.calculate_reste_a_charge(
  p_activity_id UUID,
  p_quotient_familial INTEGER
)
RETURNS TABLE(
  prix_initial NUMERIC,
  prix_applicable NUMERIC,
  reduction_pct NUMERIC,
  tranche_appliquee TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_activity RECORD;
  v_price NUMERIC;
  v_reduction NUMERIC := 0;
  v_tranche TEXT := 'Plein tarif';
BEGIN
  -- Récupérer l'activité
  SELECT a.id, a.price_base, a.period_type
  INTO v_activity
  FROM activities a
  WHERE a.id = p_activity_id;

  IF v_activity IS NULL THEN
    RETURN QUERY SELECT 0::NUMERIC, 0::NUMERIC, 0::NUMERIC, 'Activité non trouvée'::TEXT;
    RETURN;
  END IF;

  v_price := COALESCE(v_activity.price_base, 0);

  -- Les réductions QF s'appliquent UNIQUEMENT aux activités vacances
  IF v_activity.period_type = 'vacances' AND p_quotient_familial > 0 THEN
    -- TRANCHES QF HARMONISÉES
    IF p_quotient_familial <= 450 THEN
      v_reduction := 50;
      v_tranche := 'Tranche 1 (QF 0-450)';
    ELSIF p_quotient_familial <= 700 THEN
      v_reduction := 30;
      v_tranche := 'Tranche 2 (QF 451-700)';
    ELSIF p_quotient_familial <= 1000 THEN
      v_reduction := 15;
      v_tranche := 'Tranche 3 (QF 701-1000)';
    ELSE
      v_reduction := 0;
      v_tranche := 'Plein tarif (QF > 1000)';
    END IF;
  ELSIF v_activity.period_type = 'scolaire' THEN
    v_tranche := 'N/A (activité scolaire)';
  ELSE
    v_tranche := 'QF non renseigné';
  END IF;

  RETURN QUERY SELECT
    v_price,
    v_price * (1 - v_reduction / 100),
    v_reduction,
    v_tranche;
END;
$$;

-- ============================================
-- FONCTION UTILITAIRE: Calcul du reste à charge final avec plafond 70%
-- ============================================

CREATE OR REPLACE FUNCTION public.calculate_final_reste_a_charge(
  p_prix_applicable NUMERIC,
  p_total_aids NUMERIC
)
RETURNS TABLE(
  reste_a_charge NUMERIC,
  aids_applied NUMERIC,
  was_capped BOOLEAN,
  max_aids_allowed NUMERIC
)
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  v_max_aids NUMERIC;
  v_applied NUMERIC;
  v_remaining NUMERIC;
  v_capped BOOLEAN := FALSE;
BEGIN
  IF p_prix_applicable <= 0 THEN
    RETURN QUERY SELECT 0::NUMERIC, 0::NUMERIC, FALSE, 0::NUMERIC;
    RETURN;
  END IF;

  -- Maximum 70% du prix couvert par les aides
  -- Minimum reste à charge = max(30% du prix, 1€)
  v_max_aids := GREATEST(p_prix_applicable * 0.70, 0);
  v_max_aids := LEAST(v_max_aids, p_prix_applicable - 1); -- Au moins 1€ de reste

  -- Appliquer le plafond
  IF p_total_aids > v_max_aids THEN
    v_applied := v_max_aids;
    v_capped := TRUE;
  ELSE
    v_applied := p_total_aids;
  END IF;

  v_remaining := p_prix_applicable - v_applied;

  RETURN QUERY SELECT v_remaining, v_applied, v_capped, v_max_aids;
END;
$$;

-- ============================================
-- COMMENTAIRES
-- ============================================

COMMENT ON FUNCTION public.get_eligible_aids IS
'Retourne les aides financières éligibles pour une activité donnée.
RÈGLE: Maximum 70%% du prix couvert (30%% reste à charge minimum).
Paramètres: activity_id, age, qf, is_qpv, territory_code, nb_children';

COMMENT ON FUNCTION public.calculate_reste_a_charge IS
'Calcule le prix applicable après réduction QF (vacances uniquement).
TRANCHES HARMONISÉES: 0-450 (50%%), 451-700 (30%%), 701-1000 (15%%), 1001+ (0%%).';

COMMENT ON FUNCTION public.calculate_final_reste_a_charge IS
'Calcule le reste à charge final après application des aides avec plafond 70%%.
Garantit un minimum de 1€ de reste à charge si le prix > 0.';

-- ============================================
-- GRANTS
-- ============================================

GRANT EXECUTE ON FUNCTION public.get_eligible_aids TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_reste_a_charge TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_final_reste_a_charge TO authenticated;
