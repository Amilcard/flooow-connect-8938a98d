
-- Supprimer l'ancienne contrainte
ALTER TABLE public.territory_events 
DROP CONSTRAINT IF EXISTS territory_events_event_type_check;

-- Ajouter la nouvelle contrainte avec les types corrects
ALTER TABLE public.territory_events 
ADD CONSTRAINT territory_events_event_type_check 
CHECK (event_type = ANY (ARRAY[
  'workshop'::text,
  'vacation_camp'::text, 
  'parent_meeting'::text,
  'community_info'::text,
  'cultural_event'::text
]));
