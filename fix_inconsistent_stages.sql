-- Script de nettoyage des 10 activités "Stage/Vacances" incohérentes
-- Ces activités sont typées "Vacances" mais ont des sessions en période scolaire (intrus).
-- On supprime les sessions HORS vacances pour ces activités spécifiques.
-- TABLE CIBLE : activity_sessions (availability_slots n'existe pas en SQL direct)

BEGIN;

-- Approche robuste : Supprimer les sessions des activités "Vacances" qui sont hors des ranges définis
-- Range Automne: 2025-10-18 au 2025-11-03
-- Range Fin d'année: 2025-12-20 au 2026-01-05
-- Range Hiver: 2026-02-21 au 2026-03-09
-- Range Printemps: 2026-04-18 au 2026-05-04
-- Range Été: 2026-07-04 au 2026-09-01

DELETE FROM activity_sessions
WHERE activity_id IN (
    SELECT id FROM activities 
    WHERE title LIKE '%Stage%' OR title LIKE '%Colonie%' OR title LIKE '%Vacances%'
)
AND NOT (
    (start_date >= '2025-10-18' AND start_date <= '2025-11-03') OR -- Automne
    (start_date >= '2025-12-20' AND start_date <= '2026-01-05') OR -- Fin d'année
    (start_date >= '2026-02-21' AND start_date <= '2026-03-09') OR -- Hiver
    (start_date >= '2026-04-18' AND start_date <= '2026-05-04') OR -- Printemps
    (start_date >= '2026-07-04' AND start_date <= '2026-09-01')    -- Été
);

COMMIT;
