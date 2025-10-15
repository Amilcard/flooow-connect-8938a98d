-- Remplacer get_territories_from_postal() par version récursive
-- qui remonte la hiérarchie via parent_id

CREATE OR REPLACE FUNCTION public.get_territories_from_postal(postal_code TEXT)
RETURNS TABLE(
  territory_id UUID,
  territory_name TEXT,
  territory_type TEXT,
  territory_level INTEGER -- 1=commune, 2=metropole, 3=department, 4=region, 5=national
) 
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE territory_hierarchy AS (
    -- Niveau commune (point entrée)
    SELECT 
      t.id,
      t.name,
      t.type,
      1 as level,
      t.parent_id
    FROM public.territories t
    WHERE postal_code = ANY(t.postal_codes)
      AND t.type = 'commune'
      AND t.active = TRUE
    
    UNION ALL
    
    -- Remontée hiérarchique via parent_id
    SELECT 
      t.id,
      t.name,
      t.type,
      CASE t.type
        WHEN 'metropole' THEN 2
        WHEN 'department' THEN 3
        WHEN 'region' THEN 4
        WHEN 'national' THEN 5
      END,
      t.parent_id
    FROM public.territories t
    INNER JOIN territory_hierarchy th ON t.id = th.parent_id
    WHERE t.active = TRUE
  )
  SELECT 
    id,
    name,
    type,
    level
  FROM territory_hierarchy
  ORDER BY level ASC;
END;
$$;

-- Test avec code postal Saint-Étienne
-- Devrait retourner : Saint-Étienne → Saint-Étienne Métropole → Loire → Auvergne-Rhône-Alpes → France
COMMENT ON FUNCTION public.get_territories_from_postal(TEXT) IS 'Remonte la hiérarchie complète des territoires (commune→métropole→dept→région→national) via parent_id';

-- Test avec La Ricamarie
-- SELECT * FROM get_territories_from_postal('42150');