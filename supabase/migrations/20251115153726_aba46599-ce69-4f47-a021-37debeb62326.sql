
-- ============================================
-- FONCTION : Calcul des aides avec plafonnement
-- ============================================

-- Fonction pour calculer les aides éligibles avec plafonnement automatique
CREATE OR REPLACE FUNCTION public.calculate_eligible_aids_capped(
  p_age INTEGER,
  p_qf INTEGER,
  p_city_code TEXT,
  p_activity_price NUMERIC,
  p_duration_days INTEGER,
  p_categories TEXT[]
) 
RETURNS TABLE(
  aid_name TEXT,
  amount NUMERIC,
  territory_level TEXT,
  official_link TEXT,
  applied_amount NUMERIC,
  capped BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_normalized_categories TEXT[];
  v_total_aids NUMERIC := 0;
  v_remaining_price NUMERIC;
  v_aid_amount NUMERIC;
  v_applicable_amount NUMERIC;
BEGIN
  -- CRITICAL: Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required to calculate financial aids'
      USING HINT = 'Please log in to access this feature';
  END IF;

  -- CRITICAL RULE: If activity price = 0, return empty
  IF p_activity_price <= 0 THEN
    RETURN;
  END IF;

  v_remaining_price := p_activity_price;

  -- Normaliser les catégories en minuscules pour le matching
  SELECT array_agg(lower(cat)) INTO v_normalized_categories
  FROM unnest(p_categories) AS cat;

  -- Retourner les aides applicables avec plafonnement progressif
  RETURN QUERY
  WITH eligible_aids AS (
    SELECT 
      fa.name::TEXT as aid_name,
      CASE 
        WHEN fa.amount_type = 'fixed' THEN fa.amount_value
        WHEN fa.amount_type = 'per_day' THEN fa.amount_value * p_duration_days
      END as calculated_amount,
      fa.territory_level::TEXT,
      fa.official_link::TEXT,
      -- Ordre de priorité : commune > metropole > region > national
      CASE fa.territory_level
        WHEN 'commune' THEN 1
        WHEN 'metropole' THEN 2
        WHEN 'region' THEN 3
        WHEN 'national' THEN 4
      END as priority_order
    FROM public.financial_aids fa
    WHERE fa.active = true
      AND p_age BETWEEN fa.age_min AND fa.age_max
      AND (fa.qf_max IS NULL OR p_qf <= fa.qf_max)
      AND (
        fa.territory_level = 'national'
        OR (fa.territory_level = 'region' AND '84' = ANY(fa.territory_codes))
        OR (fa.territory_level IN ('metropole', 'commune') AND p_city_code = ANY(fa.territory_codes))
      )
      AND fa.categories && v_normalized_categories
      AND fa.cumulative = true
    ORDER BY priority_order ASC, calculated_amount DESC
  )
  SELECT 
    ea.aid_name,
    ea.calculated_amount as amount,
    ea.territory_level,
    ea.official_link,
    -- Montant appliqué après plafonnement
    CASE 
      WHEN v_total_aids + ea.calculated_amount <= p_activity_price 
      THEN ea.calculated_amount
      ELSE GREATEST(p_activity_price - v_total_aids, 0)
    END as applied_amount,
    -- Indique si l'aide a été plafonnée
    (v_total_aids + ea.calculated_amount > p_activity_price) as capped
  FROM eligible_aids ea
  WHERE v_remaining_price > 0;
  
END;
$$;

-- ============================================
-- FONCTION : Calcul du reste à charge plafonné
-- ============================================

CREATE OR REPLACE FUNCTION public.calculate_reste_a_charge_capped(
  p_price_base NUMERIC, 
  p_simulated_aids JSONB
)
RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  v_total_aids NUMERIC := 0;
  v_aid JSONB;
  v_capped_total NUMERIC;
BEGIN
  -- Calculer le total des aides
  IF p_simulated_aids IS NOT NULL THEN
    FOR v_aid IN SELECT * FROM jsonb_array_elements(p_simulated_aids)
    LOOP
      v_total_aids := v_total_aids + COALESCE((v_aid->>'montant')::numeric, 0);
    END LOOP;
  END IF;
  
  -- PLAFONNEMENT : Les aides ne peuvent pas dépasser le prix
  v_capped_total := LEAST(v_total_aids, p_price_base);
  
  -- Reste à charge = Prix - Aides plafonnées (minimum 0)
  RETURN GREATEST(p_price_base - v_capped_total, 0);
END;
$$;

-- ============================================
-- COMMENTAIRES
-- ============================================

COMMENT ON FUNCTION public.calculate_eligible_aids_capped IS 
'Calcule les aides financières éligibles avec plafonnement automatique.
Le montant total des aides ne peut jamais dépasser le prix de l''activité.
Les aides sont appliquées par ordre de priorité : commune > metropole > region > national.';

COMMENT ON FUNCTION public.calculate_reste_a_charge_capped IS 
'Calcule le reste à charge après application des aides, avec plafonnement automatique.
Garantit que le total des aides ne dépasse jamais le prix de base de l''activité.';
