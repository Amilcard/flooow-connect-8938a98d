-- ============================================================================
-- AUDIT: Comparaison données UI vs DB pour 10 activités manquantes
-- Date: 2026-01-11
-- Contexte: Vérification de la cohérence entre les captures UI et la base
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1: Extraction des 10 activités mentionnées dans le JSON UI
-- ============================================================================

-- Note sur le mapping des noms d'activités:
-- UI Title                                → DB Title (exact match expected)
-- "Atelier arts plastiques"               → "Arts plastiques – Atelier créatif"
-- "Atelier théâtre ados"                  → "Atelier théâtre ados"
-- "Basket – Mini-basket et cadets"        → "Basket – Mini-basket et cadets"
-- "Gymnastique – Baby gym et éveil"       → "Gymnastique – Baby gym et éveil"
-- "Camp nature – Découverte environnement"→ "Camp nature – Découverte environnement"
-- "Camp ski – Séjour montagne hiver"      → "Camp ski – Séjour montagne hiver"
-- "Chant – Chorale et technique vocale"   → "Chant – Chorale et technique vocale"
-- "Cirque – Arts du cirque"               → "Cirque – Arts du cirque"
-- "Colonie de vacances été – Montagne"    → "Colonie de vacances été – Montagne"
-- "Conservatoire de musique – Violon"     → "Conservatoire de musique – Violon"

SELECT
  a.id,
  a.title,
  a.period_type,
  a.vacation_type,
  a.price_base,
  a.price_unit,
  a.accepts_aid_types,
  a.age_min,
  a.age_max,
  a.creneaux,
  a.jours_horaires,
  a.date_debut,
  a.date_fin,
  a.vacation_periods,
  a.categories
FROM activities a
WHERE a.title IN (
  'Arts plastiques – Atelier créatif',
  'Atelier théâtre ados',
  'Basket – Mini-basket et cadets',
  'Gymnastique – Baby gym et éveil',
  'Camp nature – Découverte environnement',
  'Camp ski – Séjour montagne hiver',
  'Chant – Chorale et technique vocale',
  'Cirque – Arts du cirque',
  'Colonie de vacances été – Montagne',
  'Conservatoire de musique – Violon'
)
ORDER BY a.title;

-- ============================================================================
-- ÉTAPE 2: Comparaison prix UI vs prix DB attendus
-- ============================================================================
-- Selon aid_grid et les migrations, les prix DB attendus sont:

WITH ui_data AS (
  SELECT * FROM (VALUES
    ('Atelier arts plastiques',             'CULTURE', 'SAISON',   210, '["caf_loire_temps_libre"]'::jsonb, 80, 130),
    ('Atelier théâtre ados',                'CULTURE', 'SAISON',   230, '["caf_loire_temps_libre"]'::jsonb, 80, 150),
    ('Basket – Mini-basket et cadets',      'SPORT',   'SAISON',   260, '["caf_loire_temps_libre", "pass_sport"]'::jsonb, 130, 130),
    ('Gymnastique – Baby gym et éveil',     'SPORT',   'SAISON',   190, '["caf_loire_temps_libre"]'::jsonb, 80, 110),
    ('Camp nature – Découverte environnement', 'LOISIRS', 'VACANCES', 360, '["ancv", "vacaf_ave"]'::jsonb, 230, 130),
    ('Camp ski – Séjour montagne hiver',    'LOISIRS', 'VACANCES', 560, '["ancv"]'::jsonb, 50, 510),
    ('Chant – Chorale et technique vocale', 'CULTURE', 'SAISON',   190, '["caf_loire_temps_libre"]'::jsonb, 80, 110),
    ('Cirque – Arts du cirque',             'CULTURE', 'SAISON',   220, '["caf_loire_temps_libre"]'::jsonb, 80, 140),
    ('Colonie de vacances été – Montagne',  'LOISIRS', 'VACANCES', 550, '["ancv", "pass_colo", "vacaf_ave"]'::jsonb, 385, 165),
    ('Conservatoire de musique – Violon',   'CULTURE', 'SAISON',   380, '["caf_loire_temps_libre"]'::jsonb, 80, 300)
  ) AS t(ui_title, ui_category, ui_period, ui_price, ui_aids, ui_aids_total, ui_reste_a_charge)
),
db_data AS (
  SELECT
    CASE
      WHEN title = 'Arts plastiques – Atelier créatif' THEN 'Atelier arts plastiques'
      ELSE title
    END as ui_title,
    title as db_title,
    price_base as db_price,
    accepts_aid_types as db_aids,
    period_type as db_period,
    categories as db_categories
  FROM activities
  WHERE title IN (
    'Arts plastiques – Atelier créatif',
    'Atelier théâtre ados',
    'Basket – Mini-basket et cadets',
    'Gymnastique – Baby gym et éveil',
    'Camp nature – Découverte environnement',
    'Camp ski – Séjour montagne hiver',
    'Chant – Chorale et technique vocale',
    'Cirque – Arts du cirque',
    'Colonie de vacances été – Montagne',
    'Conservatoire de musique – Violon'
  )
)
SELECT
  u.ui_title,
  d.db_title,
  u.ui_price AS "UI_price_initial",
  d.db_price AS "DB_price_base",
  CASE WHEN u.ui_price = d.db_price THEN '✓' ELSE '✗ MISMATCH' END AS "price_match",
  u.ui_period AS "UI_period",
  d.db_period AS "DB_period",
  u.ui_aids AS "UI_aids",
  d.db_aids AS "DB_accepts_aid_types",
  u.ui_aids_total AS "UI_aids_total_eur",
  u.ui_reste_a_charge AS "UI_reste_a_charge"
FROM ui_data u
LEFT JOIN db_data d ON u.ui_title = d.ui_title
ORDER BY u.ui_title;

-- ============================================================================
-- ÉTAPE 3: Vérification des tranches d'aide CAF Loire (QF ≤ 350 = 80€)
-- ============================================================================
-- UI montre caf_loire_temps_libre = 80€ pour TOUTES les activités scolaires
-- Ce montant correspond à QF ≤ 350 selon FinancialAidEngine.ts:
-- - QF ≤ 350: 80€
-- - QF 351-550: 60€
-- - QF 551-700: 40€
-- - QF 701-850: 20€

-- Pour valider:
SELECT
  title,
  price_base,
  period_type,
  -- Calcul théorique reste à charge pour QF ≤ 350
  CASE
    WHEN period_type = 'scolaire' THEN
      GREATEST(price_base - 80, price_base * 0.30) -- 80€ CAF Loire, minimum 30%
    WHEN period_type = 'vacances' THEN
      price_base -- Calcul plus complexe avec VACAF/ANCV
  END AS "reste_a_charge_qf_350"
FROM activities
WHERE title IN (
  'Arts plastiques – Atelier créatif',
  'Atelier théâtre ados',
  'Basket – Mini-basket et cadets',
  'Gymnastique – Baby gym et éveil',
  'Chant – Chorale et technique vocale',
  'Cirque – Arts du cirque',
  'Conservatoire de musique – Violon'
)
ORDER BY title;

-- ============================================================================
-- ÉTAPE 4: Vérification des créneaux et prochaines dates
-- ============================================================================
-- Les UI montrent les prochaines séances (ex: 2026-01-14, 2026-01-21, 2026-01-28)
-- Ces dates correspondent aux mercredis de janvier 2026

SELECT
  title,
  creneaux,
  jours_horaires,
  date_debut,
  date_fin,
  vacation_periods
FROM activities
WHERE title IN (
  'Arts plastiques – Atelier créatif',
  'Atelier théâtre ados',
  'Basket – Mini-basket et cadets',
  'Gymnastique – Baby gym et éveil',
  'Chant – Chorale et technique vocale',
  'Cirque – Arts du cirque',
  'Conservatoire de musique – Violon'
)
ORDER BY title;

-- ============================================================================
-- ÉTAPE 5: Vérification des activités vacances
-- ============================================================================
SELECT
  title,
  price_base,
  vacation_type,
  duration_days,
  has_accommodation,
  vacation_periods,
  date_debut,
  date_fin,
  accepts_aid_types
FROM activities
WHERE title IN (
  'Camp nature – Découverte environnement',
  'Camp ski – Séjour montagne hiver',
  'Colonie de vacances été – Montagne'
)
ORDER BY title;

-- ============================================================================
-- ÉTAPE 6: Vérification des aides acceptées par activité (accepts_aid_types)
-- ============================================================================
-- Le champ accepts_aid_types doit contenir les aides applicables

-- Mapping aides UI → aides DB (codes standardisés):
-- UI: caf_loire_temps_libre → DB: CAF_LOIRE_TEMPS_LIBRE ou "CAF"
-- UI: pass_sport → DB: PASS_SPORT ou "PassSport"
-- UI: pass_colo → DB: PASS_COLO
-- UI: vacaf_ave → DB: VACAF_AVE
-- UI: ancv → DB: ANCV

SELECT
  title,
  period_type,
  vacation_type,
  accepts_aid_types,
  CASE
    WHEN period_type = 'scolaire' THEN
      CASE
        WHEN categories @> ARRAY['sport'] THEN 'Should include: PASS_SPORT, CAF_LOIRE_TEMPS_LIBRE'
        ELSE 'Should include: CAF_LOIRE_TEMPS_LIBRE'
      END
    WHEN period_type = 'vacances' AND vacation_type = 'sejour_hebergement' THEN
      'Should include: VACAF_AVE, ANCV, potentially PASS_COLO'
    ELSE 'Verify based on activity type'
  END AS "expected_aids"
FROM activities
WHERE title IN (
  'Arts plastiques – Atelier créatif',
  'Atelier théâtre ados',
  'Basket – Mini-basket et cadets',
  'Gymnastique – Baby gym et éveil',
  'Camp nature – Découverte environnement',
  'Camp ski – Séjour montagne hiver',
  'Chant – Chorale et technique vocale',
  'Cirque – Arts du cirque',
  'Colonie de vacances été – Montagne',
  'Conservatoire de musique – Violon'
)
ORDER BY period_type, title;

-- ============================================================================
-- RÉSUMÉ DES RÈGLES DE CALCUL RESTE À CHARGE
-- ============================================================================
--
-- ACTIVITÉS SCOLAIRES (period_type = 'scolaire'):
-- 1. Prix initial = price_base
-- 2. Aides applicables selon QF et critères:
--    - CAF Loire Temps Libre: 20-80€ (QF ≤ 850, vacances uniquement maintenant!)
--    - Note: Le code FinancialAidEngine.ts LIMITE CAF Loire aux vacances
-- 3. Pass'Sport: 50€ (sport, 6-17 ans, condition sociale)
-- 4. Plafond: 70% max coverage
--
-- ACTIVITÉS VACANCES (period_type = 'vacances'):
-- 1. Prix initial = price_base (harmonisé: 360€/560€ selon type)
-- 2. Réduction QF possible (50%/30%/15% selon tranches)
-- 3. Aides cumulables:
--    - VACAF AVE: 100-200€ (séjours labellisés, QF ≤ 900)
--    - ANCV: 50-80€ (chèques vacances)
--    - Pass Colo: 200-350€ (11 ans exact, QF-based)
--    - CAF Loire Temps Libre: 20-80€ (QF ≤ 850)
-- 4. Plafond: 70% max coverage
--
-- ⚠️ ATTENTION: Selon FinancialAidEngine.ts (lignes 427-432):
-- CAF_LOIRE_TEMPS_LIBRE est maintenant LIMITÉ aux activités vacances!
-- Cela contredit les UI qui montrent cette aide sur des activités scolaires.
-- ============================================================================

-- ============================================================================
-- ÉTAPE 7: Générer un rapport de discordances
-- ============================================================================

WITH expected_prices AS (
  SELECT * FROM (VALUES
    ('Arts plastiques – Atelier créatif', 210),
    ('Atelier théâtre ados', 230),
    ('Basket – Mini-basket et cadets', 260),
    ('Gymnastique – Baby gym et éveil', 190),
    ('Camp nature – Découverte environnement', 360),
    ('Camp ski – Séjour montagne hiver', 560),
    ('Chant – Chorale et technique vocale', 190),
    ('Cirque – Arts du cirque', 220),
    ('Colonie de vacances été – Montagne', 550),
    ('Conservatoire de musique – Violon', 380)
  ) AS t(title, expected_price)
)
SELECT
  e.title,
  e.expected_price AS "UI_price",
  a.price_base AS "DB_price",
  CASE
    WHEN a.price_base IS NULL THEN 'NOT FOUND in DB'
    WHEN a.price_base = e.expected_price THEN 'OK'
    ELSE 'PRICE MISMATCH: UI=' || e.expected_price || ' vs DB=' || a.price_base
  END AS status
FROM expected_prices e
LEFT JOIN activities a ON a.title = e.title
ORDER BY e.title;
