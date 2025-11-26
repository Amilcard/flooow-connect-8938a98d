-- Liste complète des activités par période avec leurs montants
-- Classées selon le calendrier des vacances Zone A 2025-2026

WITH vacation_periods AS (
  SELECT 
    'Toussaint 2025' as period_name,
    '2025-10-18'::date as start_date,
    '2025-11-03'::date as end_date,
    'vacances' as period_type
  UNION ALL
  SELECT 'Noël 2025', '2025-12-20'::date, '2026-01-05'::date, 'vacances'
  UNION ALL
  SELECT 'Hiver 2026', '2026-02-21'::date, '2026-03-09'::date, 'vacances'
  UNION ALL
  SELECT 'Printemps 2026', '2026-04-18'::date, '2026-05-04'::date, 'vacances'
  UNION ALL
  SELECT 'Été 2026', '2026-07-04'::date, '2026-09-01'::date, 'vacances'
  UNION ALL
  SELECT 'Toussaint 2026', '2026-10-17'::date, '2026-11-02'::date, 'vacances'
  UNION ALL
  SELECT 'Noël 2026', '2026-12-19'::date, '2027-01-05'::date, 'vacances'
),
classified_sessions AS (
  SELECT 
    a.title as activite,
    s.start_date::date as date_session,
    a.price_base as prix_euros,
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM vacation_periods vp 
        WHERE s.start_date::date BETWEEN vp.start_date AND vp.end_date
      ) THEN 'vacances'
      ELSE 'scolaire'
    END as periode,
    (
      SELECT vp.period_name 
      FROM vacation_periods vp 
      WHERE s.start_date::date BETWEEN vp.start_date AND vp.end_date
      LIMIT 1
    ) as nom_vacances
  FROM activities a
  JOIN activity_sessions s ON s.activity_id = a.id
  WHERE s.start_date >= '2025-11-01'
    AND s.start_date < '2027-01-01'
  ORDER BY s.start_date, a.title
)
SELECT 
  activite,
  TO_CHAR(date_session, 'DD/MM/YYYY') as date,
  periode,
  COALESCE(nom_vacances, 'Période scolaire') as periode_detaillee,
  prix_euros,
  CASE 
    WHEN periode = 'vacances' THEN 'CAF, Ville, ANCV, Pass''Vacances'
    ELSE 'CAF, Ville, Pass''Sport, Pass Culture'
  END as aides_eligibles
FROM classified_sessions
ORDER BY date_session, activite;
