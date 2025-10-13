-- Recréer les slots avec conversion correcte des types

-- SPORT - Mercredis 14h-16h
INSERT INTO public.availability_slots (activity_id, start, "end", recurrence, seats_total, seats_remaining)
SELECT 
  a.id,
  '2025-11-06 14:00:00+01'::timestamptz,
  '2025-11-06 16:00:00+01'::timestamptz,
  jsonb_build_object(
    'freq', 'WEEKLY',
    'byday', 'WE',
    'until', '2026-06-24',
    'tzid', 'Europe/Paris'
  ),
  CAST(a.capacity_policy->>'seats_total' AS integer),
  CAST(a.capacity_policy->>'seats_remaining' AS integer)
FROM activities a
WHERE a.category = 'Sport' AND a.published = true;

-- SPORT - Samedis 10h-12h
INSERT INTO public.availability_slots (activity_id, start, "end", recurrence, seats_total, seats_remaining)
SELECT 
  a.id,
  '2025-11-08 10:00:00+01'::timestamptz,
  '2025-11-08 12:00:00+01'::timestamptz,
  jsonb_build_object(
    'freq', 'WEEKLY',
    'byday', 'SA',
    'until', '2026-06-27',
    'tzid', 'Europe/Paris'
  ),
  CAST(a.capacity_policy->>'seats_total' AS integer),
  CAST(a.capacity_policy->>'seats_remaining' AS integer)
FROM activities a
WHERE a.category = 'Sport' AND a.published = true;

-- CULTURE - Mercredis 16h-18h
INSERT INTO public.availability_slots (activity_id, start, "end", recurrence, seats_total, seats_remaining)
SELECT 
  a.id,
  '2025-11-06 16:00:00+01'::timestamptz,
  '2025-11-06 18:00:00+01'::timestamptz,
  jsonb_build_object('freq', 'WEEKLY', 'byday', 'WE', 'until', '2026-06-24', 'tzid', 'Europe/Paris'),
  CAST(a.capacity_policy->>'seats_total' AS integer),
  CAST(a.capacity_policy->>'seats_remaining' AS integer)
FROM activities a WHERE a.category = 'Culture' AND a.published = true;

-- CULTURE - Samedis 14h-16h
INSERT INTO public.availability_slots (activity_id, start, "end", recurrence, seats_total, seats_remaining)
SELECT a.id, '2025-11-08 14:00:00+01'::timestamptz, '2025-11-08 16:00:00+01'::timestamptz,
  jsonb_build_object('freq', 'WEEKLY', 'byday', 'SA', 'until', '2026-06-27', 'tzid', 'Europe/Paris'),
  CAST(a.capacity_policy->>'seats_total' AS integer), CAST(a.capacity_policy->>'seats_remaining' AS integer)
FROM activities a WHERE a.category = 'Culture' AND a.published = true;

-- LOISIRS - Mercredis 14h30-16h30
INSERT INTO public.availability_slots (activity_id, start, "end", recurrence, seats_total, seats_remaining)
SELECT a.id, '2025-11-06 14:30:00+01'::timestamptz, '2025-11-06 16:30:00+01'::timestamptz,
  jsonb_build_object('freq', 'WEEKLY', 'byday', 'WE', 'until', '2026-06-24', 'tzid', 'Europe/Paris'),
  CAST(a.capacity_policy->>'seats_total' AS integer), CAST(a.capacity_policy->>'seats_remaining' AS integer)
FROM activities a WHERE a.category = 'Loisirs' AND a.published = true;

-- SCOLARITÉ - Mardis 17h-18h30
INSERT INTO public.availability_slots (activity_id, start, "end", recurrence, seats_total, seats_remaining)
SELECT a.id, '2025-11-04 17:00:00+01'::timestamptz, '2025-11-04 18:30:00+01'::timestamptz,
  jsonb_build_object('freq', 'WEEKLY', 'byday', 'TU', 'until', '2026-06-23', 'tzid', 'Europe/Paris'),
  CAST(a.capacity_policy->>'seats_total' AS integer), CAST(a.capacity_policy->>'seats_remaining' AS integer)
FROM activities a WHERE a.category = 'Scolarité' AND a.published = true;

-- SCOLARITÉ - Jeudis 17h-18h30
INSERT INTO public.availability_slots (activity_id, start, "end", recurrence, seats_total, seats_remaining)
SELECT a.id, '2025-11-06 17:00:00+01'::timestamptz, '2025-11-06 18:30:00+01'::timestamptz,
  jsonb_build_object('freq', 'WEEKLY', 'byday', 'TH', 'until', '2026-06-25', 'tzid', 'Europe/Paris'),
  CAST(a.capacity_policy->>'seats_total' AS integer), CAST(a.capacity_policy->>'seats_remaining' AS integer)
FROM activities a WHERE a.category = 'Scolarité' AND a.published = true;

-- VACANCES - Slots spécifiques
INSERT INTO public.availability_slots (activity_id, start, "end", seats_total, seats_remaining)
VALUES
  ((SELECT id FROM activities WHERE title = 'Colonie Montagne Hiver'), '2025-12-22 08:00:00+01'::timestamptz, '2025-12-26 18:00:00+01'::timestamptz, 24, 10),
  ((SELECT id FROM activities WHERE title = 'Stage Voile Été'), '2026-07-07 09:00:00+02'::timestamptz, '2026-07-11 17:00:00+02'::timestamptz, 16, 7),
  ((SELECT id FROM activities WHERE title = 'Stage Équitation Vacances'), '2026-04-13 09:00:00+02'::timestamptz, '2026-04-17 17:00:00+02'::timestamptz, 12, 5),
  ((SELECT id FROM activities WHERE title = 'Camp Aventure Été'), '2026-07-14 08:00:00+02'::timestamptz, '2026-07-20 18:00:00+02'::timestamptz, 20, 8),
  ((SELECT id FROM activities WHERE title = 'Centre Aéré Vacances Petites'), '2026-02-10 08:00:00+01'::timestamptz, '2026-02-14 18:00:00+01'::timestamptz, 50, 28),
  ((SELECT id FROM activities WHERE title = 'Canoë-Kayak Été'), '2026-07-21 09:00:00+02'::timestamptz, '2026-07-25 17:00:00+02'::timestamptz, 14, 6);

-- Rapport final
SELECT 
  a.category,
  COUNT(DISTINCT a.id) as activities,
  COUNT(s.id) as total_slots
FROM activities a
LEFT JOIN availability_slots s ON s.activity_id = a.id
WHERE a.published = true
GROUP BY a.category
ORDER BY a.category;