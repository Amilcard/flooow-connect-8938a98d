-- ============================================================================
-- COHERENCE_AUDIT_QUERIES.sql
-- Audit de cohérence des 29 activités Flooow Connect
-- Date: 2025-12-12
-- ATTENTION: Ces requêtes sont en LECTURE SEULE (SELECT uniquement)
-- ============================================================================

-- ============================================================================
-- 1. INVENTAIRE DES 29 ACTIVITÉS
-- ============================================================================

-- 1.1 Liste complète des activités publiées
SELECT
    id,
    title,
    categories,
    period_type,
    age_min,
    age_max,
    price_base,
    city,
    is_published,
    accepts_aid_types
FROM activities
WHERE is_published = true
ORDER BY title;

-- 1.2 Comptage total des activités
SELECT
    COUNT(*) as total_activities,
    COUNT(*) FILTER (WHERE is_published = true) as published,
    COUNT(*) FILTER (WHERE is_published = false OR is_published IS NULL) as not_published
FROM activities;

-- 1.3 Répartition par catégorie
SELECT
    unnest(categories) as category,
    COUNT(*) as count
FROM activities
WHERE is_published = true
GROUP BY category
ORDER BY count DESC;

-- 1.4 Répartition par période (saison scolaire vs vacances)
SELECT
    period_type,
    COUNT(*) as count
FROM activities
WHERE is_published = true
GROUP BY period_type
ORDER BY count DESC;

-- ============================================================================
-- 2. COHÉRENCE DES TRANCHES D'ÂGE
-- ============================================================================

-- 2.1 Activités avec tranches d'âge invalides
SELECT
    id,
    title,
    age_min,
    age_max,
    CASE
        WHEN age_min IS NULL THEN 'age_min manquant'
        WHEN age_max IS NULL THEN 'age_max manquant'
        WHEN age_min > age_max THEN 'age_min > age_max (ERREUR)'
        WHEN age_min < 0 THEN 'age_min négatif'
        WHEN age_max > 25 THEN 'age_max > 25 (suspect)'
        ELSE 'OK'
    END as status
FROM activities
WHERE is_published = true
  AND (age_min IS NULL
       OR age_max IS NULL
       OR age_min > age_max
       OR age_min < 0
       OR age_max > 25);

-- 2.2 Répartition par tranche d'âge
SELECT
    CASE
        WHEN age_min <= 5 THEN '0-5 ans (petite enfance)'
        WHEN age_min <= 10 THEN '6-10 ans (enfance)'
        WHEN age_min <= 14 THEN '11-14 ans (pré-ado)'
        WHEN age_min <= 17 THEN '15-17 ans (ado)'
        ELSE '18+ ans (jeunes adultes)'
    END as tranche,
    COUNT(*) as count
FROM activities
WHERE is_published = true AND age_min IS NOT NULL
GROUP BY tranche
ORDER BY tranche;

-- ============================================================================
-- 3. COHÉRENCE DES PRIX
-- ============================================================================

-- 3.1 Activités sans prix défini
SELECT
    id,
    title,
    price_base,
    price_unit
FROM activities
WHERE is_published = true
  AND (price_base IS NULL OR price_base = 0);

-- 3.2 Répartition des prix
SELECT
    CASE
        WHEN price_base IS NULL OR price_base = 0 THEN 'Gratuit / Non défini'
        WHEN price_base < 50 THEN '0-50€'
        WHEN price_base < 100 THEN '50-100€'
        WHEN price_base < 200 THEN '100-200€'
        WHEN price_base < 500 THEN '200-500€'
        ELSE '500€+'
    END as tranche_prix,
    COUNT(*) as count
FROM activities
WHERE is_published = true
GROUP BY tranche_prix
ORDER BY tranche_prix;

-- 3.3 Prix moyen par catégorie
SELECT
    unnest(categories) as category,
    ROUND(AVG(price_base)::numeric, 2) as prix_moyen,
    MIN(price_base) as prix_min,
    MAX(price_base) as prix_max
FROM activities
WHERE is_published = true AND price_base IS NOT NULL
GROUP BY category
ORDER BY prix_moyen DESC;

-- ============================================================================
-- 4. COHÉRENCE GÉOGRAPHIQUE
-- ============================================================================

-- 4.1 Répartition par ville
SELECT
    city,
    COUNT(*) as count,
    ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM activities WHERE is_published = true) * 100, 1) as pourcentage
FROM activities
WHERE is_published = true
GROUP BY city
ORDER BY count DESC;

-- 4.2 Activités sans localisation
SELECT
    id,
    title,
    address,
    city,
    postal_code,
    latitude,
    longitude
FROM activities
WHERE is_published = true
  AND (city IS NULL
       OR address IS NULL
       OR postal_code IS NULL);

-- 4.3 Vérification codes postaux Loire (42xxx)
SELECT
    id,
    title,
    postal_code,
    city,
    CASE
        WHEN postal_code LIKE '42%' THEN 'Loire (42)'
        WHEN postal_code IS NULL THEN 'Non défini'
        ELSE 'Hors Loire (' || LEFT(postal_code, 2) || ')'
    END as departement
FROM activities
WHERE is_published = true
  AND (postal_code IS NULL OR postal_code NOT LIKE '42%');

-- ============================================================================
-- 5. COHÉRENCE AVEC LES AIDES FINANCIÈRES
-- ============================================================================

-- 5.1 Activités avec types d'aides déclarés
SELECT
    id,
    title,
    categories,
    accepts_aid_types,
    period_type
FROM activities
WHERE is_published = true
  AND accepts_aid_types IS NOT NULL
  AND accepts_aid_types::text != 'null'
ORDER BY title;

-- 5.2 Comptage activités avec/sans aides déclarées
SELECT
    CASE
        WHEN accepts_aid_types IS NULL OR accepts_aid_types::text = 'null' THEN 'Sans aides déclarées'
        ELSE 'Avec aides déclarées'
    END as status,
    COUNT(*) as count
FROM activities
WHERE is_published = true
GROUP BY status;

-- 5.3 Liste des aides financières en base
SELECT
    id,
    name,
    amount,
    amount_type,
    percentage,
    description,
    eligibility_criteria,
    valid_from,
    valid_until
FROM financial_aids
ORDER BY name;

-- 5.4 Comptage des aides par partenaire
SELECT
    fp.name as partner_name,
    fp.type as partner_type,
    COUNT(fa.id) as nb_aides
FROM financial_partners fp
LEFT JOIN financial_aids fa ON fa.partner_id = fp.id
GROUP BY fp.id, fp.name, fp.type
ORDER BY nb_aides DESC;

-- ============================================================================
-- 6. COHÉRENCE CATÉGORIE / TYPE ACTIVITÉ / AIDES
-- ============================================================================

-- 6.1 Activités sport éligibles Pass'Sport (âge 6-17, sport)
SELECT
    id,
    title,
    categories,
    age_min,
    age_max,
    price_base,
    'Potentiellement éligible Pass Sport' as eligibilite
FROM activities
WHERE is_published = true
  AND 'sport' = ANY(categories)
  AND age_min <= 17
  AND age_max >= 6;

-- 6.2 Activités culture éligibles Pass Culture (âge 15-17, culture)
SELECT
    id,
    title,
    categories,
    age_min,
    age_max,
    price_base,
    'Potentiellement éligible Pass Culture' as eligibilite
FROM activities
WHERE is_published = true
  AND ('culture' = ANY(categories) OR 'artistique' = ANY(categories))
  AND age_min <= 17
  AND age_max >= 15;

-- 6.3 Activités vacances éligibles Pass Colo (âge 11, vacances)
SELECT
    id,
    title,
    categories,
    period_type,
    vacation_type,
    age_min,
    age_max,
    price_base,
    'Potentiellement éligible Pass Colo' as eligibilite
FROM activities
WHERE is_published = true
  AND period_type = 'vacances'
  AND age_min <= 11
  AND age_max >= 11;

-- 6.4 Activités CAF Loire (âge 3-17, vacances)
SELECT
    id,
    title,
    categories,
    period_type,
    age_min,
    age_max,
    price_base,
    city,
    'Potentiellement éligible CAF Loire' as eligibilite
FROM activities
WHERE is_published = true
  AND period_type = 'vacances'
  AND age_min <= 17
  AND age_max >= 3;

-- ============================================================================
-- 7. COHÉRENCE DES ORGANISMES
-- ============================================================================

-- 7.1 Activités par organisme
SELECT
    COALESCE(organism_name, 'Non défini') as organisme,
    COUNT(*) as nb_activites
FROM activities
WHERE is_published = true
GROUP BY organism_name
ORDER BY nb_activites DESC;

-- 7.2 Activités sans organisme
SELECT
    id,
    title,
    organism_id,
    organism_name,
    organism_email,
    organism_phone
FROM activities
WHERE is_published = true
  AND (organism_id IS NULL AND organism_name IS NULL);

-- 7.3 Liste des organismes avec leurs activités
SELECT
    o.id as organism_id,
    o.name as organism_name,
    o.type as organism_type,
    o.email,
    COUNT(a.id) as nb_activites
FROM organisms o
LEFT JOIN activities a ON a.organism_id = o.id AND a.is_published = true
GROUP BY o.id, o.name, o.type, o.email
ORDER BY nb_activites DESC;

-- ============================================================================
-- 8. COHÉRENCE DES SESSIONS / CRÉNEAUX
-- ============================================================================

-- 8.1 Activités avec sessions
SELECT
    a.id,
    a.title,
    COUNT(s.id) as nb_sessions
FROM activities a
LEFT JOIN activity_sessions s ON s.activity_id = a.id
WHERE a.is_published = true
GROUP BY a.id, a.title
ORDER BY nb_sessions DESC;

-- 8.2 Activités sans aucune session
SELECT
    a.id,
    a.title,
    a.jours_horaires,
    a.creneaux
FROM activities a
LEFT JOIN activity_sessions s ON s.activity_id = a.id
WHERE a.is_published = true
  AND s.id IS NULL
ORDER BY a.title;

-- 8.3 Sessions avec incohérences horaires
SELECT
    s.id,
    a.title as activity_title,
    s.start_time,
    s.end_time,
    s.day_of_week,
    CASE
        WHEN s.start_time > s.end_time THEN 'Heure fin < Heure début'
        ELSE 'OK'
    END as status
FROM activity_sessions s
JOIN activities a ON a.id = s.activity_id
WHERE s.start_time > s.end_time;

-- ============================================================================
-- 9. INTÉGRITÉ DES DONNÉES
-- ============================================================================

-- 9.1 Activités avec données manquantes critiques
SELECT
    id,
    title,
    CASE WHEN description IS NULL OR description = '' THEN 'description, ' ELSE '' END ||
    CASE WHEN city IS NULL THEN 'city, ' ELSE '' END ||
    CASE WHEN categories IS NULL OR array_length(categories, 1) IS NULL THEN 'categories, ' ELSE '' END ||
    CASE WHEN age_min IS NULL THEN 'age_min, ' ELSE '' END ||
    CASE WHEN age_max IS NULL THEN 'age_max, ' ELSE '' END as champs_manquants
FROM activities
WHERE is_published = true
  AND (description IS NULL OR description = ''
       OR city IS NULL
       OR categories IS NULL OR array_length(categories, 1) IS NULL
       OR age_min IS NULL
       OR age_max IS NULL);

-- 9.2 Activités orphelines (sans catégorie valide)
SELECT
    id,
    title,
    categories,
    category_id
FROM activities
WHERE is_published = true
  AND (categories IS NULL OR array_length(categories, 1) = 0)
  AND category_id IS NULL;

-- 9.3 Vérification des images
SELECT
    id,
    title,
    image_url,
    CASE
        WHEN image_url IS NULL THEN 'Aucune image'
        WHEN image_url LIKE 'http%' THEN 'URL externe'
        WHEN image_url LIKE '%supabase%' THEN 'Supabase Storage'
        ELSE 'Autre format'
    END as image_status
FROM activities
WHERE is_published = true
ORDER BY image_status, title;

-- ============================================================================
-- 10. RÉSUMÉ GLOBAL DE COHÉRENCE
-- ============================================================================

-- 10.1 Score de complétude par activité
SELECT
    id,
    title,
    (
        CASE WHEN title IS NOT NULL AND title != '' THEN 1 ELSE 0 END +
        CASE WHEN description IS NOT NULL AND description != '' THEN 1 ELSE 0 END +
        CASE WHEN categories IS NOT NULL AND array_length(categories, 1) > 0 THEN 1 ELSE 0 END +
        CASE WHEN age_min IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN age_max IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN price_base IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN city IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN address IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN postal_code IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN image_url IS NOT NULL THEN 1 ELSE 0 END
    ) as score_completude,
    10 as score_max,
    ROUND(
        (
            CASE WHEN title IS NOT NULL AND title != '' THEN 1 ELSE 0 END +
            CASE WHEN description IS NOT NULL AND description != '' THEN 1 ELSE 0 END +
            CASE WHEN categories IS NOT NULL AND array_length(categories, 1) > 0 THEN 1 ELSE 0 END +
            CASE WHEN age_min IS NOT NULL THEN 1 ELSE 0 END +
            CASE WHEN age_max IS NOT NULL THEN 1 ELSE 0 END +
            CASE WHEN price_base IS NOT NULL THEN 1 ELSE 0 END +
            CASE WHEN city IS NOT NULL THEN 1 ELSE 0 END +
            CASE WHEN address IS NOT NULL THEN 1 ELSE 0 END +
            CASE WHEN postal_code IS NOT NULL THEN 1 ELSE 0 END +
            CASE WHEN image_url IS NOT NULL THEN 1 ELSE 0 END
        )::numeric / 10 * 100, 0
    ) as pourcentage_completude
FROM activities
WHERE is_published = true
ORDER BY score_completude ASC, title;

-- 10.2 Résumé global
SELECT
    'Total activités publiées' as metric, COUNT(*)::text as value
FROM activities WHERE is_published = true
UNION ALL
SELECT
    'Avec catégorie définie', COUNT(*)::text
FROM activities WHERE is_published = true AND categories IS NOT NULL AND array_length(categories, 1) > 0
UNION ALL
SELECT
    'Avec âge min/max défini', COUNT(*)::text
FROM activities WHERE is_published = true AND age_min IS NOT NULL AND age_max IS NOT NULL
UNION ALL
SELECT
    'Avec prix défini', COUNT(*)::text
FROM activities WHERE is_published = true AND price_base IS NOT NULL AND price_base > 0
UNION ALL
SELECT
    'Avec localisation complète', COUNT(*)::text
FROM activities WHERE is_published = true AND city IS NOT NULL AND postal_code IS NOT NULL
UNION ALL
SELECT
    'Avec image', COUNT(*)::text
FROM activities WHERE is_published = true AND image_url IS NOT NULL
UNION ALL
SELECT
    'Avec sessions', COUNT(DISTINCT a.id)::text
FROM activities a
INNER JOIN activity_sessions s ON s.activity_id = a.id
WHERE a.is_published = true;

-- ============================================================================
-- FIN DES REQUÊTES D'AUDIT
-- ============================================================================
