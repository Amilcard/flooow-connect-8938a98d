-- Create RPC function to calculate eligible financial aids
CREATE OR REPLACE FUNCTION calculate_eligible_aids(
  p_age INTEGER,
  p_qf INTEGER,
  p_city_code TEXT,
  p_activity_price DECIMAL,
  p_duration_days INTEGER,
  p_categories TEXT[]
) RETURNS TABLE (
  aid_name TEXT,
  amount DECIMAL,
  territory_level TEXT,
  official_link TEXT
) AS $$
BEGIN
  -- CRITICAL RULE: If activity price = 0, return empty
  IF p_activity_price <= 0 THEN
    RETURN;
  END IF;

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
      -- National aids
      fa.territory_level = 'national'
      -- Regional aids (code region 84 = Auvergne-Rhône-Alpes)
      OR (fa.territory_level = 'region' AND '84' = ANY(fa.territory_codes))
      -- Metropole/Commune aids - match by city code
      OR (fa.territory_level IN ('metropole', 'commune') AND p_city_code = ANY(fa.territory_codes))
    )
    AND fa.categories && p_categories
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;