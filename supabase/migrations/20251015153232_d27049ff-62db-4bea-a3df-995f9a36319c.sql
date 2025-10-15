-- ÉTAPE 1: Supprimer les territoires lyonnais et Villeurbanne
DELETE FROM public.territories 
WHERE name IN (
  'Lyon 1er', 'Lyon 2e', 'Lyon 3e', 'Lyon 4e', 'Lyon 5e', 
  'Lyon 6e', 'Lyon 7e', 'Lyon 8e', 'Lyon 9e', 'Villeurbanne'
);

-- ÉTAPE 2: Supprimer Rhône et ajouter Loire
DELETE FROM public.territories WHERE name = 'Rhône';

INSERT INTO public.territories (name, type, postal_codes, department_code, region_code, active)
VALUES
  ('Loire', 'department', NULL, '42', '84', TRUE)
ON CONFLICT (name, type) DO NOTHING;

-- ÉTAPE 3: Ajouter Saint-Étienne et La Ricamarie
INSERT INTO public.territories (name, type, postal_codes, department_code, region_code, active)
VALUES
  ('Saint-Étienne', 'commune', ARRAY['42000', '42100'], '42', '84', TRUE),
  ('La Ricamarie', 'commune', ARRAY['42150'], '42', '84', TRUE)
ON CONFLICT (name, type) DO NOTHING;

-- ÉTAPE 4: Mettre à jour les relations parent/enfant
UPDATE public.territories 
SET parent_id = (SELECT id FROM public.territories WHERE name = 'Loire' AND type = 'department')
WHERE type = 'commune' AND department_code = '42' AND parent_id IS NULL;

UPDATE public.territories 
SET parent_id = (SELECT id FROM public.territories WHERE name = 'Auvergne-Rhône-Alpes' AND type = 'region')
WHERE type = 'department' AND region_code = '84' AND parent_id IS NULL;