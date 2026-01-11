-- ================================================================
-- AUDIT: Anomalies de prix pour les activités
-- Date: 2026-01-11
-- Objectif: Identifier toutes les activités avec des problèmes d'affichage tarif
-- ================================================================

-- ----------------------------------------------------------------
-- 1. ACTIVITÉS AVEC price_base = 0 OU NULL (POTENTIEL "GRATUIT")
-- Ce sont les cas où "Gratuit" s'affiche alors que le prix réel existe
-- ----------------------------------------------------------------
SELECT
  id,
  title,
  price_base,
  period_type,
  categories,
  is_published,
  CASE
    WHEN price_base IS NULL THEN '❌ NULL - Affiche "—"'
    WHEN price_base = 0 THEN '⚠️ 0€ - Affiche "Gratuit"'
    ELSE '✅ OK'
  END as status
FROM activities
WHERE is_published = true
  AND (price_base IS NULL OR price_base = 0)
ORDER BY title;


-- ----------------------------------------------------------------
-- 2. TOUTES LES ACTIVITÉS AVEC LEUR PRIX ET TRANCHES QF
-- Compare price_base avec les tranches qf_tranches si disponibles
-- ----------------------------------------------------------------
SELECT
  a.id,
  a.title,
  a.price_base,
  a.period_type,
  a.accepts_aid_types,
  qt.qf_min,
  qt.qf_max,
  qt.reduction_percent,
  ROUND(a.price_base * (1 - COALESCE(qt.reduction_percent, 0) / 100.0), 2) as prix_apres_qf
FROM activities a
LEFT JOIN qf_tranches qt ON qt.activity_id = a.id
WHERE a.is_published = true
ORDER BY a.title, qt.qf_min;


-- ----------------------------------------------------------------
-- 3. AUDIT ACTIVITÉS "VACANCES" AVEC TRANCHES QF
-- Ce sont les cas problématiques EX2 (Arts plastiques affichait Gratuit)
-- ----------------------------------------------------------------
SELECT
  a.id,
  a.title,
  a.price_base,
  COUNT(qt.id) as nb_tranches_qf,
  CASE
    WHEN a.price_base IS NULL THEN '❌ Prix manquant'
    WHEN a.price_base = 0 THEN '⚠️ Gratuit'
    WHEN COUNT(qt.id) = 0 THEN '⚠️ Pas de tranches QF'
    ELSE '✅ OK'
  END as status
FROM activities a
LEFT JOIN qf_tranches qt ON qt.activity_id = a.id
WHERE a.is_published = true
  AND a.period_type = 'vacances'
GROUP BY a.id, a.title, a.price_base
ORDER BY a.title;


-- ----------------------------------------------------------------
-- 4. VÉRIFICATION DES AIDES ACCEPTÉES PAR ACTIVITÉ
-- S'assurer que accepts_aid_types est cohérent
-- ----------------------------------------------------------------
SELECT
  id,
  title,
  price_base,
  period_type,
  accepts_aid_types,
  CASE
    WHEN accepts_aid_types IS NULL THEN '⚠️ Aucune aide acceptée'
    WHEN array_length(accepts_aid_types, 1) = 0 THEN '⚠️ Array vide'
    ELSE '✅ ' || array_length(accepts_aid_types, 1) || ' type(s) d''aide'
  END as status
FROM activities
WHERE is_published = true
ORDER BY
  CASE WHEN accepts_aid_types IS NULL OR array_length(accepts_aid_types, 1) = 0 THEN 0 ELSE 1 END,
  title;


-- ----------------------------------------------------------------
-- 5. DÉTAIL: Activités similaires à EX2 (Arts plastiques)
-- Vacances + price_base > 0 + tranches QF définies
-- ----------------------------------------------------------------
SELECT
  a.id,
  a.title,
  a.price_base as "Prix Base",
  a.period_type,
  COUNT(DISTINCT qt.id) as "Nb Tranches QF",
  MIN(qt.reduction_percent) as "Min Réduction %",
  MAX(qt.reduction_percent) as "Max Réduction %",
  ROUND(a.price_base * (1 - MAX(qt.reduction_percent) / 100.0), 2) as "Prix Min Possible"
FROM activities a
LEFT JOIN qf_tranches qt ON qt.activity_id = a.id
WHERE a.is_published = true
  AND a.period_type = 'vacances'
  AND a.price_base > 0
GROUP BY a.id, a.title, a.price_base, a.period_type
HAVING COUNT(qt.id) > 0
ORDER BY a.title;


-- ----------------------------------------------------------------
-- 6. RÉSUMÉ GLOBAL DES ANOMALIES
-- ----------------------------------------------------------------
SELECT
  'Activités publiées' as metric,
  COUNT(*) as count
FROM activities WHERE is_published = true
UNION ALL
SELECT
  'Prix = 0 (Gratuit)' as metric,
  COUNT(*) as count
FROM activities WHERE is_published = true AND price_base = 0
UNION ALL
SELECT
  'Prix = NULL' as metric,
  COUNT(*) as count
FROM activities WHERE is_published = true AND price_base IS NULL
UNION ALL
SELECT
  'Sans aides acceptées' as metric,
  COUNT(*) as count
FROM activities WHERE is_published = true AND (accepts_aid_types IS NULL OR array_length(accepts_aid_types, 1) = 0)
UNION ALL
SELECT
  'Vacances avec tranches QF' as metric,
  COUNT(DISTINCT a.id) as count
FROM activities a
INNER JOIN qf_tranches qt ON qt.activity_id = a.id
WHERE a.is_published = true AND a.period_type = 'vacances';
