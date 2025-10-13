-- Fix security issue: Set search_path for calculate_age function
CREATE OR REPLACE FUNCTION public.calculate_age(birth_date DATE)
RETURNS INTEGER
LANGUAGE SQL
IMMUTABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXTRACT(YEAR FROM AGE(birth_date))::INTEGER
$$;