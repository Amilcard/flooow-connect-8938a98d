-- Script de nettoyage COMPLET des activités mixtes
-- Nettoie BOTH tables: activity_sessions ET availability_slots

BEGIN;

-- ============================================================================
-- PARTIE 1: Nettoyage de activity_sessions (déjà fait mais on le refait)
-- ============================================================================

DELETE FROM activity_sessions 
WHERE activity_id = '698a96e5-4f7d-411a-829d-648b77626992' 
AND start_date = '2026-04-06';

DELETE FROM activity_sessions 
WHERE activity_id = '6c59a8f0-65a3-440a-8135-dad8aecab25a' 
AND start_date = '2026-04-06';

DELETE FROM activity_sessions 
WHERE activity_id = 'd09c9d7e-fd42-4dda-9886-6c20bab34060' 
AND start_date IN ('2026-04-05', '2026-04-12');

DELETE FROM activity_sessions 
WHERE activity_id = '8d914139-fba2-447b-9bb7-61d27fd44501' 
AND start_date IN ('2026-02-25', '2026-03-04', '2026-04-22', '2026-04-29');

DELETE FROM activity_sessions 
WHERE activity_id = 'c754255c-c17e-422b-8159-f2ed716109d8' 
AND start_date IN ('2026-02-28', '2026-03-07', '2026-04-25', '2026-05-02');

-- ============================================================================
-- PARTIE 2: Nettoyage de availability_slots (CRITIQUE!)
-- ============================================================================

-- Nettoyer TOUTES les instances de ces activités dans availability_slots
-- On supprime les sessions scolaires des activités "Vacances"

-- Stage Cirque - Vacances (toutes instances)
DELETE FROM availability_slots 
WHERE activity_id IN (
  SELECT id FROM activities WHERE title LIKE '%Stage Cirque%Vacances%'
)
AND start::date = '2026-04-06';

-- Camp Sport/Loisirs - Vacances (toutes instances)
DELETE FROM availability_slots 
WHERE activity_id IN (
  SELECT id FROM activities WHERE title LIKE '%Camp Sport%Vacances%'
)
AND start::date = '2026-04-06';

-- Séjour Nature & Survie - Vacances (toutes instances)
DELETE FROM availability_slots 
WHERE activity_id IN (
  SELECT id FROM activities WHERE title LIKE '%Séjour Nature%Survie%'
)
AND start::date IN ('2026-04-05', '2026-04-12');

-- Cours de Théâtre Jeune Public (toutes instances) - Supprimer sessions vacances
DELETE FROM availability_slots 
WHERE activity_id IN (
  SELECT id FROM activities WHERE title LIKE '%Cours de Théâtre Jeune Public%'
)
AND start::date IN ('2026-02-25', '2026-03-04', '2026-04-22', '2026-04-29');

-- Atelier Jardinage Urbain (toutes instances) - Supprimer sessions vacances
DELETE FROM availability_slots 
WHERE activity_id IN (
  SELECT id FROM activities WHERE title LIKE '%Atelier Jardinage Urbain%'
)
AND start::date IN ('2026-02-28', '2026-03-07', '2026-04-25', '2026-05-02');

-- Stage Théâtre Intensif - Vacances (toutes instances)
DELETE FROM availability_slots 
WHERE activity_id IN (
  SELECT id FROM activities WHERE title LIKE '%Stage Théâtre Intensif%Vacances%'
)
AND start::date IN ('2026-04-13', '2026-04-14');

-- Séjour Culturel - Musées & Théâtre (toutes instances)
DELETE FROM availability_slots 
WHERE activity_id IN (
  SELECT id FROM activities WHERE title LIKE '%Séjour Culturel%Musées%'
)
AND start::date IN ('2026-04-05', '2026-04-12');

-- Colonie Thématique Science & Découvertes (toutes instances)
DELETE FROM availability_slots 
WHERE activity_id IN (
  SELECT id FROM activities WHERE title LIKE '%Colonie%Science%Découvertes%'
)
AND start::date IN ('2026-04-05', '2026-04-12');

COMMIT;
