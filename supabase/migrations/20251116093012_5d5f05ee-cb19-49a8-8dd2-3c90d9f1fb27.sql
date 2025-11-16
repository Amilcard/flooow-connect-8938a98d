-- Migration: Fix postal code validation for aid calculator
-- This removes the authentication requirement and allows any valid French postal code

-- Update the calculate_eligible_aids function to remove auth check and handle all postal codes
CREATE OR REPLACE FUNCTION public.calculate_eligible_aids(
  p_age integer,
  p_qf integer,
  p_city_code text,
  p_activity_price numeric,
  p_duration_days integer,
  p_categories text[]
)
RETURNS TABLE(
  aid_name text,
  amount numeric,
  territory_level text,
  official_link text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_normalized_categories text[];
BEGIN
  -- REMOVED: Authentication check to allow anonymous simulation
  -- Users can now simulate aids without being logged in

  -- CRITICAL RULE: If activity price = 0, return empty
  IF p_activity_price <= 0 THEN
    RETURN;
  END IF;

  -- Normalize categories to lowercase for matching
  SELECT array_agg(lower(cat)) INTO v_normalized_categories
  FROM unnest(p_categories) AS cat;

  -- Return applicable aids
  -- If postal code doesn't match any territory, national aids will still be returned
  RETURN QUERY
  SELECT 
    fa.name::TEXT as aid_name,
    CASE 
      WHEN fa.amount_type = 'fixed' THEN fa.amount_value
      WHEN fa.amount_type = 'per_day' THEN fa.amount_value * p_duration_days
    END as amount,
    fa.territory_level::TEXT,
    fa.official_link::TEXT
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
  ORDER BY 
    CASE fa.territory_level
      WHEN 'commune' THEN 1
      WHEN 'metropole' THEN 2
      WHEN 'region' THEN 4
      WHEN 'national' THEN 5
    END,
    amount DESC;
END;
$function$;