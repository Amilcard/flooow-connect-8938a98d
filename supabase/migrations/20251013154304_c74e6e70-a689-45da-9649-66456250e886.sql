-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Financial aids visible to all authenticated users" ON public.financial_aids;
DROP POLICY IF EXISTS "Only admins can manage financial aids" ON public.financial_aids;

-- Create new public read policy
CREATE POLICY "enable_read_access_for_all_users"
ON public.financial_aids
FOR SELECT
USING (active = true);

-- Admin-only write policies
CREATE POLICY "admins_can_insert_financial_aids"
ON public.financial_aids
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'superadmin') OR 
  has_role(auth.uid(), 'territory_admin')
);

CREATE POLICY "admins_can_update_financial_aids"
ON public.financial_aids
FOR UPDATE
USING (
  has_role(auth.uid(), 'superadmin') OR 
  has_role(auth.uid(), 'territory_admin')
)
WITH CHECK (
  has_role(auth.uid(), 'superadmin') OR 
  has_role(auth.uid(), 'territory_admin')
);

CREATE POLICY "admins_can_delete_financial_aids"
ON public.financial_aids
FOR DELETE
USING (
  has_role(auth.uid(), 'superadmin') OR 
  has_role(auth.uid(), 'territory_admin')
);

-- Update RPC function to require authentication
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
  -- CRITICAL: Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required to calculate financial aids'
      USING HINT = 'Please log in to access this feature';
  END IF;

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
      fa.territory_level = 'national'
      OR (fa.territory_level = 'region' AND '84' = ANY(fa.territory_codes))
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