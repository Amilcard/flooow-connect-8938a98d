-- Audit de cohérence des périodes d'activités
-- Vérifie si des activités ont des sessions conflictuelles (scolaire ET vacances)

WITH session_periods AS (
  SELECT 
    a.id as activity_id,
    a.title,
    s.start_date::date as session_date,
    CASE 
      WHEN (
        -- Automne 2025 (ex-Toussaint)
        (s.start_date::date >= '2025-10-18' AND s.start_date::date <= '2025-11-03') OR
        -- Fin d'année 2025 (ex-Noël)
        (s.start_date::date >= '2025-12-20' AND s.start_date::date <= '2026-01-05') OR
        -- Hiver 2026
        (s.start_date::date >= '2026-02-21' AND s.start_date::date <= '2026-03-09') OR
        -- Printemps 2026 (ex-Pâques)
        (s.start_date::date >= '2026-04-18' AND s.start_date::date <= '2026-05-04') OR
        -- Été 2026
        (s.start_date::date >= '2026-07-04' AND s.start_date::date <= '2026-09-01') OR
        -- Automne 2026 (ex-Toussaint)
        (s.start_date::date >= '2026-10-17' AND s.start_date::date <= '2026-11-02') OR
        -- Fin d'année 2026 (ex-Noël)
        (s.start_date::date >= '2026-12-19' AND s.start_date::date <= '2027-01-05')
      ) THEN 'vacances'
      ELSE 'scolaire'
    END as calculated_period
  FROM activities a
  JOIN activity_sessions s ON s.activity_id = a.id
),
activity_period_stats AS (
  SELECT 
    activity_id,
    title,
    COUNT(DISTINCT calculated_period) as period_count,
    STRING_AGG(DISTINCT calculated_period, ', ') as periods_found
  FROM session_periods
  GROUP BY activity_id, title
)
SELECT * 
FROM activity_period_stats 
WHERE period_count > 1;
