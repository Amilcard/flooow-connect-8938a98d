-- Étape 1: Supprimer l'ancienne contrainte et en créer une nouvelle qui inclut 'metropole'
ALTER TABLE public.territories
DROP CONSTRAINT IF EXISTS territories_type_check;

ALTER TABLE public.territories
ADD CONSTRAINT territories_type_check 
CHECK (type = ANY (ARRAY['commune'::text, 'metropole'::text, 'department'::text, 'region'::text, 'national'::text]));

-- Étape 2: Fixer le type et parent_id de la Métropole de Saint-Étienne
UPDATE public.territories
SET 
  type = 'metropole',
  parent_id = (SELECT id FROM public.territories WHERE name = 'Loire' AND type = 'department'),
  department_code = '42'
WHERE name = 'Métropole de Saint-Étienne';

-- Étape 3: Corriger les communes pour qu'elles pointent vers la métropole
UPDATE public.territories
SET parent_id = (SELECT id FROM public.territories WHERE name = 'Métropole de Saint-Étienne')
WHERE name IN ('Saint-Étienne', 'La Ricamarie')
AND type = 'commune';