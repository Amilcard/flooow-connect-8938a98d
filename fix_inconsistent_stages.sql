-- Script de nettoyage des 10 activités "Stage/Vacances" incohérentes
-- Ces activités sont typées "Vacances" mais ont des sessions en période scolaire (intrus).
-- On supprime les sessions HORS vacances pour ces activités spécifiques.

BEGIN;

-- Liste des IDs identifiés dans l'audit (Stage Danse, Stage Foot, etc.)
-- On cible les availability_slots qui NE SONT PAS pendant les vacances

DELETE FROM availability_slots 
WHERE activity_id IN (
  SELECT id FROM activities 
  WHERE title LIKE '%Stage%' 
     OR title LIKE '%Colonie%' 
     OR title LIKE '%Vacances%'
)
AND start::date NOT IN (
  -- Vacances Automne 2025
  '2025-10-18', '2025-10-19', '2025-10-20', '2025-10-21', '2025-10-22', '2025-10-23', '2025-10-24', '2025-10-25', '2025-10-26', '2025-10-27', '2025-10-28', '2025-10-29', '2025-10-30', '2025-10-31', '2025-11-01', '2025-11-02', '2025-11-03',
  -- Vacances Fin d'année 2025
  '2025-12-20', '2025-12-21', '2025-12-22', '2025-12-23', '2025-12-24', '2025-12-25', '2025-12-26', '2025-12-27', '2025-12-28', '2025-12-29', '2025-12-30', '2025-12-31', '2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04', '2026-01-05',
  -- Vacances Hiver 2026
  '2026-02-21', '2026-02-22', '2026-02-23', '2026-02-24', '2026-02-25', '2026-02-26', '2026-02-27', '2026-02-28', '2026-03-01', '2026-03-02', '2026-03-03', '2026-03-04', '2026-03-05', '2026-03-06', '2026-03-07', '2026-03-08', '2026-03-09',
  -- Vacances Printemps 2026
  '2026-04-18', '2026-04-19', '2026-04-20', '2026-04-21', '2026-04-22', '2026-04-23', '2026-04-24', '2026-04-25', '2026-04-26', '2026-04-27', '2026-04-28', '2026-04-29', '2026-04-30', '2026-05-01', '2026-05-02', '2026-05-03', '2026-05-04',
  -- Vacances Été 2026 (Large range check handled by logic usually, but here explicit dates for safety or use range logic)
  -- Pour simplifier, on supprime tout ce qui est "Stage" et qui est en période "Scolaire" (Jan, Fev, Mars, Mai, Juin, Sept, Oct, Nov, Dec hors vacances)
  -- Mieux : On supprime les sessions qui ne matchent pas les ranges de vacances connus.
);

-- Approche plus robuste : Supprimer les sessions des activités "Vacances" qui sont hors des ranges définis
-- Range Hiver: 2026-02-21 au 2026-03-09
-- Range Printemps: 2026-04-18 au 2026-05-04
-- Range Été: 2026-07-04 au 2026-09-01

DELETE FROM availability_slots
WHERE activity_id IN (
    SELECT id FROM activities 
    WHERE title LIKE '%Stage%' OR title LIKE '%Colonie%' OR title LIKE '%Vacances%'
)
AND NOT (
    (start::date >= '2025-10-18' AND start::date <= '2025-11-03') OR -- Automne
    (start::date >= '2025-12-20' AND start::date <= '2026-01-05') OR -- Fin d'année
    (start::date >= '2026-02-21' AND start::date <= '2026-03-09') OR -- Hiver
    (start::date >= '2026-04-18' AND start::date <= '2026-05-04') OR -- Printemps
    (start::date >= '2026-07-04' AND start::date <= '2026-09-01')    -- Été
);

-- Idem pour activity_sessions (pour être sûr)
DELETE FROM activity_sessions
WHERE activity_id IN (
    SELECT id FROM activities 
    WHERE title LIKE '%Stage%' OR title LIKE '%Colonie%' OR title LIKE '%Vacances%'
)
AND NOT (
    (start_date >= '2025-10-18' AND start_date <= '2025-11-03') OR
    (start_date >= '2025-12-20' AND start_date <= '2026-01-05') OR
    (start_date >= '2026-02-21' AND start_date <= '2026-03-09') OR
    (start_date >= '2026-04-18' AND start_date <= '2026-05-04') OR
    (start_date >= '2026-07-04' AND start_date <= '2026-09-01')
);

COMMIT;
