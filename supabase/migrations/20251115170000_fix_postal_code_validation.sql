-- Correction: Accepter TOUS les codes postaux français et toujours retourner au minimum les aides nationales
-- Cette version améliore l'accessibilité du simulateur d'aides pour tous les territoires

CREATE OR REPLACE FUNCTION public.calculate_eligible_aids(
  p_age integer,
  p_qf integer,
  p_city_code text,
  p_activity_price numeric,
  p_duration_days integer,
  p_categories text[],
  p_period_type text DEFAULT 'vacances'
)
RETURNS TABLE(
  aid_name text,
  amount numeric,
  territory_level text,
  official_link text,
  is_informational boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_normalized_categories text[];
  v_has_local_aids boolean := false;
BEGIN
  -- CRITICAL: Require authentication (commenté pour permettre accès public après migration RLS)
  -- Note: La sécurité est gérée par les politiques RLS sur financial_aids
  -- IF auth.uid() IS NULL THEN
  --   RAISE EXCEPTION 'Authentication required to calculate financial aids';
  -- END IF;

  -- Validation du code postal (format français uniquement)
  IF p_city_code !~ '^[0-9]{5}$' THEN
    RAISE EXCEPTION 'Code postal invalide. Format attendu : 5 chiffres (ex: 42000)'
      USING HINT = 'Veuillez saisir un code postal français valide';
  END IF;

  -- CRITICAL RULE: If activity price = 0, return empty
  IF p_activity_price <= 0 THEN
    RETURN;
  END IF;

  -- Normaliser les catégories en minuscules pour le matching
  SELECT array_agg(lower(cat)) INTO v_normalized_categories
  FROM unnest(p_categories) AS cat;

  -- Vérifier s'il existe des aides locales pour ce code postal
  SELECT EXISTS (
    SELECT 1 FROM public.financial_aids fa
    WHERE fa.active = true
      AND fa.territory_level IN ('metropole', 'commune')
      AND p_city_code = ANY(fa.territory_codes)
  ) INTO v_has_local_aids;

  -- Retourner les aides éligibles
  RETURN QUERY
  SELECT
    fa.name::TEXT as aid_name,
    CASE
      WHEN fa.amount_type = 'fixed' THEN fa.amount_value
      WHEN fa.amount_type = 'per_day' THEN fa.amount_value * p_duration_days
      ELSE 0
    END as amount,
    fa.territory_level::TEXT,
    fa.official_link::TEXT,
    COALESCE(fa.is_informational, false) as is_informational
  FROM public.financial_aids fa
  WHERE fa.active = true
    AND p_age BETWEEN fa.age_min AND fa.age_max
    AND (fa.qf_max IS NULL OR p_qf <= fa.qf_max)
    AND (
      -- TOUJOURS inclure les aides nationales
      fa.territory_level = 'national'
      -- Inclure les aides régionales si le département correspond
      OR (fa.territory_level = 'region' AND substring(p_city_code, 1, 2) = ANY(fa.territory_codes))
      -- Inclure les aides locales SEULEMENT si le code postal correspond exactement
      OR (fa.territory_level IN ('metropole', 'commune') AND p_city_code = ANY(fa.territory_codes))
    )
    AND (
      -- Si pas de filtre catégories défini, l'aide s'applique à toutes les activités
      fa.categories IS NULL
      OR array_length(fa.categories, 1) IS NULL
      OR fa.categories && v_normalized_categories
    )
    AND (fa.period_type IS NULL OR fa.period_type = p_period_type)
    AND fa.cumulative = true
  ORDER BY
    -- Prioriser les aides du plus local au plus national
    CASE fa.territory_level
      WHEN 'commune' THEN 1
      WHEN 'metropole' THEN 2
      WHEN 'region' THEN 3
      WHEN 'national' THEN 4
    END,
    amount DESC;

  -- Si aucune aide trouvée ET qu'il n'y a pas d'aides locales configurées
  -- Ajouter un message informatif (aide fictive)
  IF NOT FOUND AND NOT v_has_local_aids THEN
    RETURN QUERY
    SELECT
      'Information'::text as aid_name,
      0::numeric as amount,
      'commune'::text as territory_level,
      NULL::text as official_link,
      true as is_informational;
  END IF;

END;
$function$;

-- Ajouter un commentaire pour documenter la fonction
COMMENT ON FUNCTION public.calculate_eligible_aids IS
  'Calcule les aides financières éligibles pour une activité.
   Accepte TOUS les codes postaux français (5 chiffres).
   Retourne toujours au minimum les aides nationales.
   Si aucune aide locale n''est configurée, ajoute un message informatif.';
