-- Marquer les territoires pilotes comme couverts
UPDATE public.territories
SET covered = true
WHERE name IN ('Saint-Étienne', 'La Ricamarie', 'Métropole de Saint-Étienne', 'Loire', 'Auvergne-Rhône-Alpes', 'France');

-- Ajouter une activité Football pour les tests
INSERT INTO public.activities (
  id,
  structure_id,
  title,
  category,
  description,
  price_base,
  age_min,
  age_max,
  published,
  accepts_aid_types,
  accessibility_checklist,
  capacity_policy,
  covoiturage_enabled
) VALUES (
  'aaaaaaaa-1111-2222-3333-444444444444',
  '00000000-0000-0000-0001-000000000001',
  'Stage Football Été',
  'Sport',
  'Stage intensif de football pendant les vacances d''été. Entraînements techniques, matchs et tournois.',
  120.00,
  6,
  17,
  true,
  '["PassSport", "CAF", "AideLocale"]',
  '{"wheelchair": false, "sensory_support": false}',
  '{"seats_total": 24, "seats_remaining": 24, "waitlist_enabled": true}',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Ajouter des créneaux pour l'activité Football
INSERT INTO public.availability_slots (
  activity_id,
  start,
  "end",
  seats_total,
  seats_remaining
) VALUES (
  'aaaaaaaa-1111-2222-3333-444444444444',
  (NOW() + INTERVAL '7 days')::timestamp,
  (NOW() + INTERVAL '12 days')::timestamp,
  24,
  24
)
ON CONFLICT DO NOTHING;