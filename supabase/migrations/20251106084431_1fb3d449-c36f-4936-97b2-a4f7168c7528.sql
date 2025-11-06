
-- Migration pour harmoniser les activités vacances avec le calendrier scolaire Zone A (Lyon) 2026

-- 1. Mettre à jour les vacation_periods des activités vacances
UPDATE activities 
SET vacation_periods = ARRAY['printemps_2026', 'été_2026']::text[]
WHERE 'Vacances' = ANY(categories)
  AND (vacation_periods @> ARRAY['février_2025']::text[] 
       OR vacation_periods @> ARRAY['printemps_2025']::text[] 
       OR vacation_periods @> ARRAY['été_2025']::text[]);

-- 2. Supprimer tous les anciens slots des activités vacances (dates 2025)
DELETE FROM availability_slots 
WHERE activity_id IN (
  SELECT id FROM activities WHERE 'Vacances' = ANY(categories)
)
AND start < '2026-04-01'::date;

-- 3. Créer les nouveaux slots pour Vacances Printemps 2026 (4-20 avril)
-- Camp Sport/Loisirs - Semaine complète
INSERT INTO availability_slots (activity_id, start, "end", seats_total, seats_remaining)
SELECT 
  id,
  '2026-04-06 09:00:00+02'::timestamptz,
  '2026-04-10 17:00:00+02'::timestamptz,
  20,
  20
FROM activities 
WHERE title = 'Camp Sport/Loisirs - Vacances';

-- Colonie Multi-activités - 12 jours (lundi à vendredi x2 semaines + samedi)
INSERT INTO availability_slots (activity_id, start, "end", seats_total, seats_remaining)
SELECT 
  id,
  '2026-04-06 08:00:00+02'::timestamptz,
  '2026-04-18 18:00:00+02'::timestamptz,
  25,
  25
FROM activities 
WHERE title = 'Colonie Multi-activités - Vacances';

-- Colonie Science & Découvertes - Semaine 1
INSERT INTO availability_slots (activity_id, start, "end", seats_total, seats_remaining)
SELECT 
  id,
  '2026-04-06 09:00:00+02'::timestamptz,
  '2026-04-10 17:00:00+02'::timestamptz,
  18,
  18
FROM activities 
WHERE title = 'Colonie Thématique Science & Découvertes';

-- Séjour Culturel - Musées & Théâtre - Long weekend
INSERT INTO availability_slots (activity_id, start, "end", seats_total, seats_remaining)
SELECT 
  id,
  '2026-04-13 10:00:00+02'::timestamptz,
  '2026-04-16 16:00:00+02'::timestamptz,
  15,
  15
FROM activities 
WHERE title = 'Séjour Culturel - Musées & Théâtre';

-- Séjour Linguistique Court - 5 jours
INSERT INTO availability_slots (activity_id, start, "end", seats_total, seats_remaining)
SELECT 
  id,
  '2026-04-13 09:00:00+02'::timestamptz,
  '2026-04-17 17:00:00+02'::timestamptz,
  12,
  12
FROM activities 
WHERE title = 'Séjour Linguistique Court - Vacances';

-- Séjour Nature & Survie - Semaine 2 (lundi-vendredi)
INSERT INTO availability_slots (activity_id, start, "end", seats_total, seats_remaining)
SELECT 
  id,
  '2026-04-13 08:30:00+02'::timestamptz,
  '2026-04-17 18:00:00+02'::timestamptz,
  16,
  16
FROM activities 
WHERE title = 'Séjour Nature & Survie - Vacances';

-- Stage Cirque - Semaine 1 (lundi-vendredi)
INSERT INTO availability_slots (activity_id, start, "end", seats_total, seats_remaining)
SELECT 
  id,
  '2026-04-06 10:00:00+02'::timestamptz,
  '2026-04-10 16:00:00+02'::timestamptz,
  20,
  20
FROM activities 
WHERE title = 'Stage Cirque - Vacances';

-- Stage Danse Urban Sports - Semaine 2
INSERT INTO availability_slots (activity_id, start, "end", seats_total, seats_remaining)
SELECT 
  id,
  '2026-04-13 14:00:00+02'::timestamptz,
  '2026-04-17 17:00:00+02'::timestamptz,
  18,
  18
FROM activities 
WHERE title = 'Stage Danse Urban Sports';

-- Stage Foot - Académie Juniors - Semaine 1
INSERT INTO availability_slots (activity_id, start, "end", seats_total, seats_remaining)
SELECT 
  id,
  '2026-04-07 09:00:00+02'::timestamptz,
  '2026-04-11 12:00:00+02'::timestamptz,
  24,
  24
FROM activities 
WHERE title = 'Stage Foot - Académie Juniors';

-- Stage Théâtre Intensif - Semaine 2
INSERT INTO availability_slots (activity_id, start, "end", seats_total, seats_remaining)
SELECT 
  id,
  '2026-04-14 10:00:00+02'::timestamptz,
  '2026-04-18 17:00:00+02'::timestamptz,
  15,
  15
FROM activities 
WHERE title = 'Stage Théâtre Intensif - Vacances';

-- 4. Créer les slots pour Été 2026 (4 juillet - 31 août)
-- Camp Sport/Loisirs - 4 semaines disponibles
INSERT INTO availability_slots (activity_id, start, "end", seats_total, seats_remaining)
SELECT 
  id,
  dates.slot_start,
  dates.slot_end,
  20,
  20
FROM activities 
CROSS JOIN (
  VALUES 
    ('2026-07-06 09:00:00+02'::timestamptz, '2026-07-10 17:00:00+02'::timestamptz),
    ('2026-07-13 09:00:00+02'::timestamptz, '2026-07-17 17:00:00+02'::timestamptz),
    ('2026-08-03 09:00:00+02'::timestamptz, '2026-08-07 17:00:00+02'::timestamptz),
    ('2026-08-24 09:00:00+02'::timestamptz, '2026-08-28 17:00:00+02'::timestamptz)
) AS dates(slot_start, slot_end)
WHERE title = 'Camp Sport/Loisirs - Vacances';

-- Colonie Multi-activités - 2 séjours longs (14 jours)
INSERT INTO availability_slots (activity_id, start, "end", seats_total, seats_remaining)
SELECT 
  id,
  dates.slot_start,
  dates.slot_end,
  25,
  25
FROM activities 
CROSS JOIN (
  VALUES 
    ('2026-07-11 10:00:00+02'::timestamptz, '2026-07-25 16:00:00+02'::timestamptz),
    ('2026-08-08 10:00:00+02'::timestamptz, '2026-08-22 16:00:00+02'::timestamptz)
) AS dates(slot_start, slot_end)
WHERE title = 'Colonie Multi-activités - Vacances';

-- Séjour Nature & Survie - 3 sessions de 7 jours
INSERT INTO availability_slots (activity_id, start, "end", seats_total, seats_remaining)
SELECT 
  id,
  dates.slot_start,
  dates.slot_end,
  16,
  16
FROM activities 
CROSS JOIN (
  VALUES 
    ('2026-07-06 08:30:00+02'::timestamptz, '2026-07-12 18:00:00+02'::timestamptz),
    ('2026-07-20 08:30:00+02'::timestamptz, '2026-07-26 18:00:00+02'::timestamptz),
    ('2026-08-10 08:30:00+02'::timestamptz, '2026-08-16 18:00:00+02'::timestamptz)
) AS dates(slot_start, slot_end)
WHERE title = 'Séjour Nature & Survie - Vacances';

-- Stage Football Été - 4 semaines
INSERT INTO availability_slots (activity_id, start, "end", seats_total, seats_remaining)
SELECT 
  id,
  dates.slot_start,
  dates.slot_end,
  30,
  30
FROM activities 
CROSS JOIN (
  VALUES 
    ('2026-07-06 14:00:00+02'::timestamptz, '2026-07-10 16:00:00+02'::timestamptz),
    ('2026-07-13 14:00:00+02'::timestamptz, '2026-07-17 16:00:00+02'::timestamptz),
    ('2026-08-03 14:00:00+02'::timestamptz, '2026-08-07 16:00:00+02'::timestamptz),
    ('2026-08-24 14:00:00+02'::timestamptz, '2026-08-28 16:00:00+02'::timestamptz)
) AS dates(slot_start, slot_end)
WHERE title = 'Stage Football Été';

-- Stage Cirque - 3 semaines été
INSERT INTO availability_slots (activity_id, start, "end", seats_total, seats_remaining)
SELECT 
  id,
  dates.slot_start,
  dates.slot_end,
  20,
  20
FROM activities 
CROSS JOIN (
  VALUES 
    ('2026-07-13 10:00:00+02'::timestamptz, '2026-07-17 16:00:00+02'::timestamptz),
    ('2026-07-27 10:00:00+02'::timestamptz, '2026-07-31 16:00:00+02'::timestamptz),
    ('2026-08-17 10:00:00+02'::timestamptz, '2026-08-21 16:00:00+02'::timestamptz)
) AS dates(slot_start, slot_end)
WHERE title = 'Stage Cirque - Vacances';

-- Stage Théâtre Intensif - 2 sessions été
INSERT INTO availability_slots (activity_id, start, "end", seats_total, seats_remaining)
SELECT 
  id,
  dates.slot_start,
  dates.slot_end,
  15,
  15
FROM activities 
CROSS JOIN (
  VALUES 
    ('2026-07-20 10:00:00+02'::timestamptz, '2026-07-24 17:00:00+02'::timestamptz),
    ('2026-08-17 10:00:00+02'::timestamptz, '2026-08-21 17:00:00+02'::timestamptz)
) AS dates(slot_start, slot_end)
WHERE title = 'Stage Théâtre Intensif - Vacances';

-- 5. Mettre à jour les images pour utiliser les assets locaux
UPDATE activities SET images = ARRAY['/src/assets/activity-camp-10-13.jpg']::text[]
WHERE title = 'Camp Sport/Loisirs - Vacances';

UPDATE activities SET images = ARRAY['/src/assets/activity-vacances.jpg']::text[]
WHERE title = 'Colonie Multi-activités - Vacances';

UPDATE activities SET images = ARRAY['/src/assets/activity-robotique-10-13.jpg']::text[]
WHERE title = 'Colonie Thématique Science & Découvertes';

UPDATE activities SET images = ARRAY['/src/assets/activity-culture.jpg']::text[]
WHERE title = 'Séjour Culturel - Musées & Théâtre';

UPDATE activities SET images = ARRAY['/src/assets/activity-sejour-14-17.jpg']::text[]
WHERE title = 'Séjour Linguistique Court - Vacances';

UPDATE activities SET images = ARRAY['/src/assets/activity-camp-10-13.jpg']::text[]
WHERE title = 'Séjour Nature & Survie - Vacances';

UPDATE activities SET images = ARRAY['/src/assets/activity-vacances.jpg']::text[]
WHERE title = 'Stage Cirque - Vacances';

UPDATE activities SET images = ARRAY['/src/assets/activity-hiphop-14-17.jpg']::text[]
WHERE title = 'Stage Danse Urban Sports';

UPDATE activities SET images = ARRAY['/src/assets/activity-stage-foot-6-9.jpg']::text[]
WHERE title = 'Stage Foot - Académie Juniors';

UPDATE activities SET images = ARRAY['/src/assets/activity-stage-foot-6-9.jpg']::text[]
WHERE title = 'Stage Football Été';

UPDATE activities SET images = ARRAY['/src/assets/activity-theatre-6-9.jpg']::text[]
WHERE title = 'Stage Théâtre Intensif - Vacances';
