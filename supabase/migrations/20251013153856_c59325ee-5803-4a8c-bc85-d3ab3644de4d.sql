-- Add profile fields documentation comment
COMMENT ON COLUMN public.profiles.profile_json IS 'User profile data including: quotient_familial (integer), city_code (text), postal_code (text), city_name (text)';

-- Create helper function to calculate age from date of birth
CREATE OR REPLACE FUNCTION public.calculate_age(birth_date DATE)
RETURNS INTEGER
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT EXTRACT(YEAR FROM AGE(birth_date))::INTEGER
$$;