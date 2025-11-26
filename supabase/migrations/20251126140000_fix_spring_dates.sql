-- Migration pour corriger les dates des activités "Vacances" de Printemps 2026
-- Déplace les créneaux mal positionnés (avant le 18 avril) vers la période de vacances (après le 18 avril)

UPDATE activity_sessions
SET start_date = start_date + interval '14 days'
WHERE 
  -- Cible les créneaux d'avril 2026 avant le début des vacances (18/04)
  start_date >= '2026-04-01' 
  AND start_date < '2026-04-18'
  -- Uniquement pour les activités contenant "Vacances" dans le titre
  AND activity_id IN (
    SELECT id 
    FROM activities 
    WHERE title ILIKE '%Vacances%'
  );
