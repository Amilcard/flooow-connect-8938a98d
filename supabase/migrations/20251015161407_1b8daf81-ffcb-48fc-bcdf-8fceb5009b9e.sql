-- Corriger la fonction get_child_age en ajoutant SET search_path pour la sécurité
CREATE OR REPLACE FUNCTION public.get_child_age(birth_date DATE)
RETURNS INTEGER 
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM AGE(birth_date))::INTEGER;
END;
$$;