-- Créer fonction RPC pour récupérer le territoire par code postal
CREATE OR REPLACE FUNCTION get_territory_by_postal_code(p_postal_code TEXT)
RETURNS TABLE(
  territory_id UUID,
  territory_name TEXT,
  city_name TEXT,
  postal_code TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pc.territory_id,
    t.name AS territory_name,
    pc.city AS city_name,
    pc.code AS postal_code
  FROM postal_codes pc
  JOIN territories t ON pc.territory_id = t.id
  WHERE pc.code = p_postal_code
  LIMIT 1;
END;
$$;

-- Donner les permissions
GRANT EXECUTE ON FUNCTION get_territory_by_postal_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_territory_by_postal_code(TEXT) TO anon;