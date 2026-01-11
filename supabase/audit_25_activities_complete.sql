-- ============================================================================
-- AUDIT COMPLET: 25 Activités - Comparaison UI vs Supabase
-- Date: 2026-01-11
-- Contexte: Validation cohérence données UI (captures) vs source de vérité (Supabase)
--
-- RÈGLE MÉTIER CRITIQUE:
-- caf_loire_temps_libre est DÉSACTIVÉ pour les activités SAISON (scolaire)
-- Elle ne doit apparaître que sur les activités VACANCES
-- ============================================================================

-- ============================================================================
-- PARTIE 1: DONNÉES UI OBSERVÉES (25 activités)
-- ============================================================================

DROP TABLE IF EXISTS temp_ui_activities;
CREATE TEMP TABLE temp_ui_activities (
  ui_title TEXT PRIMARY KEY,
  ui_category TEXT,
  ui_period_type TEXT,  -- 'SAISON' ou 'VACANCES'
  ui_price_initial NUMERIC,
  ui_price_unit TEXT,
  ui_aids JSONB,
  ui_aids_total NUMERIC,
  ui_reste_a_charge NUMERIC,
  ui_weekly_day TEXT,
  ui_available_dates TEXT[]
);

INSERT INTO temp_ui_activities VALUES
  -- ACTIVITÉS SAISON (17 activités)
  ('Arts plastiques – Atelier créatif', 'CULTURE', 'SAISON', 210, 'la saison', '["caf_loire_temps_libre"]', 80, 130, 'Mercredi', NULL),
  ('Atelier théâtre ados', 'CULTURE', 'SAISON', 230, 'la saison', '["caf_loire_temps_libre"]', 80, 150, 'Mercredi', NULL),
  ('Basket – Mini-basket et cadets', 'SPORT', 'SAISON', 260, 'la saison', '["caf_loire_temps_libre", "pass_sport"]', 130, 130, 'Mercredi', NULL),
  ('Chant – Chorale et technique vocale', 'CULTURE', 'SAISON', 190, 'la saison', '["caf_loire_temps_libre"]', 80, 110, 'Vendredi', NULL),
  ('Cirque – Arts du cirque', 'CULTURE', 'SAISON', 220, 'la saison', '["caf_loire_temps_libre"]', 80, 140, 'Mercredi', NULL),
  ('Conservatoire de musique – Violon', 'CULTURE', 'SAISON', 380, 'la saison', '["caf_loire_temps_libre"]', 80, 300, 'Jeudi', NULL),
  ('Danse classique – Cours hebdomadaire', 'CULTURE', 'SAISON', 320, 'la saison', '["caf_loire_temps_libre"]', 80, 240, 'Mercredi', NULL),
  ('Équitation – Poney et cheval', 'SPORT', 'SAISON', 420, 'la saison', '["caf_loire_temps_libre"]', 80, 340, 'Samedi', NULL),
  ('Escalade – Mur d''escalade', 'SPORT', 'SAISON', 260, 'la saison', '["caf_loire_temps_libre", "pass_sport"]', 130, 130, 'Samedi', NULL),
  ('Football – École de foot U10', 'SPORT', 'SAISON', 240, 'la saison', '["caf_loire_temps_libre", "pass_sport"]', 130, 110, 'Mercredi', NULL),
  ('Gymnastique – Baby gym et éveil', 'SPORT', 'SAISON', 190, 'la saison', '["caf_loire_temps_libre"]', 80, 110, 'Samedi', NULL),
  ('Judo – Cours débutants', 'SPORT', 'SAISON', 230, 'la saison', '["caf_loire_temps_libre", "pass_sport"]', 130, 100, 'Mercredi', NULL),
  ('Multisports – Initiation découverte', 'SPORT', 'SAISON', 220, 'la saison', '["pass_sport"]', 50, 170, 'Mercredi', NULL),
  ('Natation – École de natation', 'SPORT', 'SAISON', 260, 'la saison', '["caf_loire_temps_libre"]', 80, 180, 'Samedi', NULL),
  ('Piano – Cours individuels', 'CULTURE', 'SAISON', 420, 'la saison', '["caf_loire_temps_libre"]', 80, 340, 'Mardi', NULL),
  ('Robotique – Programmation et construction', 'SCOLARITÉ', 'SAISON', 260, 'la saison', '["caf_loire_temps_libre"]', 80, 180, 'Mercredi', NULL),
  ('Tennis – École de tennis', 'SPORT', 'SAISON', 260, 'la saison', '["caf_loire_temps_libre", "pass_sport"]', 130, 130, 'Mercredi', NULL),

  -- ACTIVITÉS VACANCES (8 activités)
  ('Camp nature – Découverte environnement', 'LOISIRS', 'VACANCES', 360, 'le séjour', '["ancv", "vacaf_ave"]', 230, 130, NULL, ARRAY['2026-07-07']),
  ('Camp ski – Séjour montagne hiver', 'LOISIRS', 'VACANCES', 560, 'le séjour', '["ancv"]', 50, 510, NULL, ARRAY['2026-02-09']),
  ('Colonie de vacances été – Montagne', 'LOISIRS', 'VACANCES', 550, 'le séjour', '["ancv", "pass_colo", "vacaf_ave"]', 385, 165, NULL, ARRAY['2026-07-14']),
  ('Mini-séjour mer – Découverte océan', 'LOISIRS', 'VACANCES', 360, 'le séjour', '["ancv", "vacaf_ave"]', 230, 130, NULL, ARRAY['2026-07-21']),
  ('Stage dessin – Techniques artistiques', 'CULTURE', 'VACANCES', 360, 'le séjour', '["ancv"]', 50, 310, NULL, ARRAY['2026-07-14', '2026-07-15']),
  ('Stage multi-sports – Été', 'SPORT', 'VACANCES', 410, 'le séjour', '["ancv", "vacaf_ave"]', 255, 155, NULL, ARRAY['2026-07-07', '2026-07-08']),
  ('Stage photo – Initiation photographie', 'CULTURE', 'VACANCES', 360, 'le séjour', '["ancv"]', 50, 310, NULL, ARRAY['2026-07-14', '2026-07-15']),
  ('Stage sciences – Expériences et découvertes', 'SCOLARITÉ', 'VACANCES', 360, 'le séjour', '["ancv"]', 50, 310, NULL, ARRAY['2026-07-21', '2026-07-22']);

-- ============================================================================
-- PARTIE 2: COMPARAISON PRIX UI vs DB
-- ============================================================================

SELECT
  '=== COMPARAISON PRIX ===' as section;

SELECT
  u.ui_title,
  u.ui_price_initial AS "UI_prix",
  a.price_base AS "DB_prix",
  CASE
    WHEN a.id IS NULL THEN '❌ NOT FOUND'
    WHEN u.ui_price_initial = a.price_base THEN '✅ OK'
    ELSE '⚠️ MISMATCH: UI=' || u.ui_price_initial || ' DB=' || a.price_base
  END AS "status_prix"
FROM temp_ui_activities u
LEFT JOIN activities a ON (
  a.title = u.ui_title
  OR a.title = REPLACE(u.ui_title, ' –', ' -')
  OR a.title LIKE '%' || SPLIT_PART(u.ui_title, ' –', 1) || '%'
)
ORDER BY u.ui_title;

-- ============================================================================
-- PARTIE 3: COMPARAISON PÉRIODE UI vs DB
-- ============================================================================

SELECT
  '=== COMPARAISON PÉRIODE ===' as section;

SELECT
  u.ui_title,
  u.ui_period_type AS "UI_periode",
  a.period_type AS "DB_periode",
  CASE
    WHEN a.id IS NULL THEN '❌ NOT FOUND'
    WHEN u.ui_period_type = 'SAISON' AND a.period_type = 'scolaire' THEN '✅ OK'
    WHEN u.ui_period_type = 'VACANCES' AND a.period_type = 'vacances' THEN '✅ OK'
    ELSE '⚠️ MISMATCH'
  END AS "status_periode"
FROM temp_ui_activities u
LEFT JOIN activities a ON (
  a.title = u.ui_title
  OR a.title = REPLACE(u.ui_title, ' –', ' -')
  OR a.title LIKE '%' || SPLIT_PART(u.ui_title, ' –', 1) || '%'
)
ORDER BY u.ui_title;

-- ============================================================================
-- PARTIE 4: AUDIT CRITIQUE - caf_loire_temps_libre sur activités SAISON
-- ============================================================================

SELECT
  '=== AUDIT caf_loire_temps_libre sur SAISON (DOIT ÊTRE ABSENT) ===' as section;

-- Activités SAISON qui ont caf_loire_temps_libre dans accepts_aid_types (À CORRIGER)
SELECT
  a.title,
  a.period_type,
  a.accepts_aid_types,
  CASE
    WHEN a.accepts_aid_types::text ILIKE '%caf_loire%'
      OR a.accepts_aid_types::text ILIKE '%CAF%' THEN '❌ À CORRIGER: caf_loire_temps_libre présent'
    ELSE '✅ OK'
  END AS "status_caf_loire"
FROM activities a
WHERE a.period_type = 'scolaire'
  AND a.title IN (
    SELECT DISTINCT COALESCE(
      (SELECT title FROM activities WHERE title = u.ui_title),
      (SELECT title FROM activities WHERE title = REPLACE(u.ui_title, ' –', ' -')),
      (SELECT title FROM activities WHERE title LIKE '%' || SPLIT_PART(u.ui_title, ' –', 1) || '%' LIMIT 1)
    )
    FROM temp_ui_activities u
    WHERE u.ui_period_type = 'SAISON'
  )
ORDER BY a.title;

-- ============================================================================
-- PARTIE 5: SCRIPT DE CORRECTION - Retirer caf_loire_temps_libre des SAISON
-- ============================================================================

SELECT
  '=== SCRIPT DE CORRECTION ===' as section;

-- Afficher ce qui sera modifié
SELECT
  a.id,
  a.title,
  a.period_type,
  a.accepts_aid_types AS "AVANT",
  -- Retirer caf_loire_temps_libre / CAF de la liste
  CASE
    WHEN a.accepts_aid_types IS NULL THEN '[]'::jsonb
    ELSE (
      SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
      FROM jsonb_array_elements(a.accepts_aid_types) AS elem
      WHERE elem::text NOT ILIKE '%caf%'
        AND elem::text NOT ILIKE '%CAF_LOIRE%'
    )
  END AS "APRÈS_CORRECTION"
FROM activities a
WHERE a.period_type = 'scolaire'
  AND (
    a.accepts_aid_types::text ILIKE '%caf%'
    OR a.accepts_aid_types::text ILIKE '%CAF_LOIRE%'
  )
ORDER BY a.title;

-- ============================================================================
-- PARTIE 6: EXÉCUTER LA CORRECTION (décommenter pour appliquer)
-- ============================================================================

/*
-- CORRECTION: Retirer caf_loire_temps_libre des activités SAISON (scolaire)
UPDATE activities a
SET accepts_aid_types = (
  SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
  FROM jsonb_array_elements(a.accepts_aid_types) AS elem
  WHERE elem::text NOT ILIKE '%caf%'
    AND elem::text NOT ILIKE '%CAF_LOIRE%'
)
WHERE a.period_type = 'scolaire'
  AND (
    a.accepts_aid_types::text ILIKE '%caf%'
    OR a.accepts_aid_types::text ILIKE '%CAF_LOIRE%'
  );

-- Vérifier le résultat
SELECT title, period_type, accepts_aid_types
FROM activities
WHERE period_type = 'scolaire'
ORDER BY title;
*/

-- ============================================================================
-- PARTIE 7: VÉRIFICATION DES AIDES ATTENDUES PAR ACTIVITÉ
-- ============================================================================

SELECT
  '=== AIDES ATTENDUES vs OBSERVÉES ===' as section;

WITH expected_aids AS (
  SELECT
    u.ui_title,
    u.ui_period_type,
    u.ui_aids,
    CASE
      -- SAISON: caf_loire_temps_libre INTERDIT, seul pass_sport possible (si SPORT)
      WHEN u.ui_period_type = 'SAISON' AND u.ui_category = 'SPORT' THEN '["PASS_SPORT"]'::jsonb
      WHEN u.ui_period_type = 'SAISON' THEN '[]'::jsonb
      -- VACANCES: toutes aides autorisées
      WHEN u.ui_period_type = 'VACANCES' THEN u.ui_aids
      ELSE u.ui_aids
    END AS expected_aids_after_rule
  FROM temp_ui_activities u
)
SELECT
  e.ui_title,
  e.ui_period_type,
  e.ui_aids AS "UI_aides_observees",
  e.expected_aids_after_rule AS "aides_attendues_apres_regle",
  CASE
    WHEN e.ui_aids = e.expected_aids_after_rule THEN '✅ CONFORME'
    WHEN e.ui_period_type = 'SAISON' AND e.ui_aids::text ILIKE '%caf_loire%' THEN '❌ UI AFFICHE caf_loire SUR SAISON (À CORRIGER UI)'
    ELSE '⚠️ DIFFÉRENCE'
  END AS "status"
FROM expected_aids e
ORDER BY e.ui_period_type, e.ui_title;

-- ============================================================================
-- PARTIE 8: RÉSUMÉ DES INCOHÉRENCES
-- ============================================================================

SELECT
  '=== RÉSUMÉ DES INCOHÉRENCES ===' as section;

SELECT
  ui_period_type,
  COUNT(*) FILTER (WHERE ui_aids::text ILIKE '%caf_loire%') AS "activites_avec_caf_loire_ui",
  COUNT(*) AS "total_activites"
FROM temp_ui_activities
GROUP BY ui_period_type;

-- Nombre d'activités SAISON avec caf_loire dans l'UI (toutes doivent être corrigées)
SELECT
  COUNT(*) AS "nb_saison_avec_caf_loire_ui_a_corriger"
FROM temp_ui_activities
WHERE ui_period_type = 'SAISON'
  AND ui_aids::text ILIKE '%caf_loire%';

-- ============================================================================
-- PARTIE 9: VÉRIFICATION COMPLÈTE DES ACTIVITÉS TROUVÉES
-- ============================================================================

SELECT
  '=== ACTIVITÉS TROUVÉES EN BASE ===' as section;

SELECT
  a.id,
  a.title,
  a.price_base,
  a.price_unit,
  a.period_type,
  a.vacation_type,
  a.accepts_aid_types,
  a.jours_horaires,
  a.creneaux
FROM activities a
WHERE a.title IN (
  'Arts plastiques – Atelier créatif',
  'Atelier théâtre ados',
  'Basket – Mini-basket et cadets',
  'Chant – Chorale et technique vocale',
  'Cirque – Arts du cirque',
  'Conservatoire de musique – Violon',
  'Danse classique – Cours hebdomadaire',
  'Équitation – Poney et cheval',
  'Escalade – Mur d''escalade',
  'Football – École de foot U10',
  'Gymnastique – Baby gym et éveil',
  'Judo – Cours débutants',
  'Multisports – Initiation découverte',
  'Natation – École de natation',
  'Piano – Cours individuels',
  'Robotique – Programmation et construction',
  'Tennis – École de tennis',
  'Camp nature – Découverte environnement',
  'Camp ski – Séjour montagne hiver',
  'Colonie de vacances été – Montagne',
  'Mini-séjour mer – Découverte océan',
  'Stage dessin – Techniques artistiques',
  'Stage multi-sports – Été',
  'Stage photo – Initiation photographie',
  'Stage sciences – Expériences et découvertes'
)
ORDER BY a.period_type, a.title;

-- ============================================================================
-- RÉSUMÉ FINAL
-- ============================================================================
/*
RÈGLES MÉTIER À APPLIQUER:

1. ACTIVITÉS SAISON (period_type = 'scolaire'):
   - caf_loire_temps_libre: ❌ INTERDIT (déjà restreint dans FinancialAidEngine.ts)
   - pass_sport: ✅ Autorisé (si SPORT + critères sociaux)
   - pass_culture: ✅ Autorisé (si CULTURE + 15-17 ans)
   - Autres aides: ❌ Non applicables

2. ACTIVITÉS VACANCES (period_type = 'vacances'):
   - caf_loire_temps_libre: ✅ Autorisé
   - vacaf_ave: ✅ Autorisé (séjours labellisés)
   - ancv: ✅ Autorisé
   - pass_colo: ✅ Autorisé (11 ans exact)

ACTIONS REQUISES:
1. [SUPABASE] Retirer caf_loire_temps_libre de accepts_aid_types des activités SAISON
2. [UI] S'assurer que l'affichage des aides filtre caf_loire_temps_libre pour SAISON
3. [BACKEND] Déjà fait (FinancialAidEngine.ts ligne 430-432)
*/
