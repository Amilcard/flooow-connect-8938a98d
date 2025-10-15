-- ÉTAPE 1: Ajouter colonnes hiérarchiques à territories
ALTER TABLE public.territories
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('commune', 'department', 'region', 'national')),
ADD COLUMN IF NOT EXISTS postal_codes TEXT[],
ADD COLUMN IF NOT EXISTS department_code TEXT,
ADD COLUMN IF NOT EXISTS region_code TEXT,
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.territories(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS geojson JSONB,
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

-- ÉTAPE 2: Contrainte unique sur (name, type)
ALTER TABLE public.territories 
ADD CONSTRAINT unique_territory_name_type UNIQUE (name, type);

-- ÉTAPE 3: Index performance
CREATE INDEX IF NOT EXISTS idx_territories_postal ON public.territories USING GIN(postal_codes);
CREATE INDEX IF NOT EXISTS idx_territories_type ON public.territories(type) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_territories_parent ON public.territories(parent_id);

-- ÉTAPE 4: Seeds données Lyon (si pas déjà présentes)
INSERT INTO public.territories (name, type, postal_codes, department_code, region_code, active)
VALUES
  ('France', 'national', NULL, NULL, NULL, TRUE),
  ('Auvergne-Rhône-Alpes', 'region', NULL, NULL, '84', TRUE),
  ('Rhône', 'department', NULL, '69', '84', TRUE),
  ('Lyon 1er', 'commune', ARRAY['69001'], '69', '84', TRUE),
  ('Lyon 2e', 'commune', ARRAY['69002'], '69', '84', TRUE),
  ('Lyon 3e', 'commune', ARRAY['69003'], '69', '84', TRUE),
  ('Lyon 4e', 'commune', ARRAY['69004'], '69', '84', TRUE),
  ('Lyon 5e', 'commune', ARRAY['69005'], '69', '84', TRUE),
  ('Lyon 6e', 'commune', ARRAY['69006'], '69', '84', TRUE),
  ('Lyon 7e', 'commune', ARRAY['69007'], '69', '84', TRUE),
  ('Lyon 8e', 'commune', ARRAY['69008'], '69', '84', TRUE),
  ('Lyon 9e', 'commune', ARRAY['69009'], '69', '84', TRUE),
  ('Villeurbanne', 'commune', ARRAY['69100'], '69', '84', TRUE)
ON CONFLICT (name, type) DO NOTHING;

-- ÉTAPE 5: Mettre à jour les relations parent/enfant
UPDATE public.territories 
SET parent_id = (SELECT id FROM public.territories WHERE name = 'Rhône' AND type = 'department')
WHERE type = 'commune' AND department_code = '69' AND parent_id IS NULL;

UPDATE public.territories 
SET parent_id = (SELECT id FROM public.territories WHERE name = 'Auvergne-Rhône-Alpes' AND type = 'region')
WHERE type = 'department' AND region_code = '84' AND parent_id IS NULL;

UPDATE public.territories 
SET parent_id = (SELECT id FROM public.territories WHERE name = 'France' AND type = 'national')
WHERE type = 'region' AND parent_id IS NULL;

-- ÉTAPE 6: Fonction helper pour récupérer territoire depuis code postal
CREATE OR REPLACE FUNCTION public.get_territory_from_postal(postal_code TEXT)
RETURNS TABLE(territory_id UUID, territory_name TEXT, territory_type TEXT) 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT id, name, type 
  FROM public.territories 
  WHERE active = TRUE
    AND (
      postal_code = ANY(postal_codes)
      OR (type = 'department' AND LEFT(postal_code, 2) = department_code)
      OR (type = 'region' AND region_code IS NOT NULL)
      OR type = 'national'
    )
  ORDER BY 
    CASE type
      WHEN 'commune' THEN 1
      WHEN 'department' THEN 2
      WHEN 'region' THEN 3
      WHEN 'national' THEN 4
    END;
END;
$$;

COMMENT ON FUNCTION public.get_territory_from_postal(TEXT) IS 
'Retourne les territoires correspondants à un code postal (du plus spécifique au plus général)';

-- ÉTAPE 7: RLS - Les territoires sont lisibles par tous les utilisateurs authentifiés
DROP POLICY IF EXISTS "Territories visible to authenticated users" ON public.territories;
CREATE POLICY "Territories visible to authenticated users"
ON public.territories FOR SELECT
TO authenticated
USING (active = TRUE);