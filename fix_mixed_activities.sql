-- Script de nettoyage des activités mixtes (Option A) - VERSION FINALE
-- Supprime les sessions "intrus" pour rendre les activités cohérentes (100% Scolaire OU 100% Vacances)
-- Table réelle confirmée: activity_sessions (colonne: start_date)

BEGIN;

-- 1. Cirque du Spectacle - Vacances (ID: 698a96e5-4f7d-411a-829d-648b77626992)
-- Supprimer la session scolaire isolée du 06/04/2026
DELETE FROM activity_sessions 
WHERE activity_id = '698a96e5-4f7d-411a-829d-648b77626992' 
AND start_date = '2026-04-06';

-- 2. Camp Sport/Loisirs - Vacances (ID: 6c59a8f0-65a3-440a-8135-dad8aecab25a)
-- Supprimer la session scolaire isolée du 06/04/2026
DELETE FROM activity_sessions 
WHERE activity_id = '6c59a8f0-65a3-440a-8135-dad8aecab25a' 
AND start_date = '2026-04-06';

-- 3. Séjour Nature & Survie - Vacances (ID: d09c9d7e-fd42-4dda-9886-6c20bab34060)
-- Supprimer les sessions scolaires d'avril (hors vacances)
DELETE FROM activity_sessions 
WHERE activity_id = 'd09c9d7e-fd42-4dda-9886-6c20bab34060' 
AND start_date IN ('2026-04-05', '2026-04-12');

-- 4. Cours de Théâtre Jeune Public (ID: 8d914139-fba2-447b-9bb7-61d27fd44501)
-- Supprimer les sessions tombant pendant les vacances (Février, Mars, Avril)
DELETE FROM activity_sessions 
WHERE activity_id = '8d914139-fba2-447b-9bb7-61d27fd44501' 
AND start_date IN (
  '2026-02-25', '2026-03-04', -- Vacances Hiver
  '2026-04-22', '2026-04-29'  -- Vacances Printemps
);

-- 5. Atelier Jardinage Urbain (ID: c754255c-c17e-422b-8159-f2ed716109d8)
-- Supprimer les sessions tombant pendant les vacances
DELETE FROM activity_sessions 
WHERE activity_id = 'c754255c-c17e-422b-8159-f2ed716109d8' 
AND start_date IN (
  '2026-02-28', '2026-03-07', -- Vacances Hiver
  '2026-04-25', '2026-05-02'  -- Vacances Printemps
);

COMMIT;
