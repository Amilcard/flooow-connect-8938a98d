-- ================================================================
-- AUDIT PRÉ-BETA : CRÉNEAUX, DATES VACANCES ET TARIFS
-- ================================================================
-- Date: 2025-11-16
-- Objectif: Vérifier la cohérence des données avant les tests beta
--
-- VÉRIFICATIONS:
-- 1. Nombre de créneaux par activité (min 3, max 4 recommandés)
-- 2. Activités "Vacances" avec dates hors périodes de vacances
-- 3. Tarifs incohérents (trop bas)
-- 4. Aides financières dépassant le prix de base
-- ================================================================

-- ----------------------------------------------------------------
-- 1. AUDIT DES CRÉNEAUX PAR ACTIVITÉ
-- ----------------------------------------------------------------
-- Objectif: S'assurer que chaque activité a 3-4 créneaux entre
-- 01/12/2025 et 30/08/2026 pour les tests beta

DO $$
DECLARE
  slot_count_report TEXT := '';
  activity_rec RECORD;
  slot_count INTEGER;
BEGIN
  RAISE NOTICE '=== AUDIT CRÉNEAUX PAR ACTIVITÉ (01/12/2025 - 30/08/2026) ===';
  RAISE NOTICE '';

  FOR activity_rec IN
    SELECT
      a.id,
      a.name,
      a.category,
      a.age_range,
      s.name as structure_name,
      COUNT(av.id) as slot_count
    FROM activities a
    LEFT JOIN structures s ON a.structure_id = s.id
    LEFT JOIN availability_slots av ON av.activity_id = a.id
      AND av.start_date >= '2025-12-01'::date
      AND av.start_date <= '2026-08-30'::date
    WHERE a.published = true
    GROUP BY a.id, a.name, a.category, a.age_range, s.name
    ORDER BY slot_count ASC, a.name
  LOOP
    slot_count := activity_rec.slot_count;

    -- Signaler les activités avec moins de 3 ou plus de 4 créneaux
    IF slot_count < 3 THEN
      RAISE NOTICE '⚠️  INSUFFISANT [% créneaux] - % (%) - %',
        slot_count,
        activity_rec.name,
        activity_rec.category,
        activity_rec.structure_name;
    ELSIF slot_count > 4 THEN
      RAISE NOTICE '⚠️  TROP DE CRÉNEAUX [% créneaux] - % (%) - %',
        slot_count,
        activity_rec.name,
        activity_rec.category,
        activity_rec.structure_name;
    ELSE
      RAISE NOTICE '✅ OK [% créneaux] - % (%) - %',
        slot_count,
        activity_rec.name,
        activity_rec.category,
        activity_rec.structure_name;
    END IF;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '=== FIN AUDIT CRÉNEAUX ===';
  RAISE NOTICE '';
END $$;


-- ----------------------------------------------------------------
-- 2. AUDIT COHÉRENCE DATES VACANCES
-- ----------------------------------------------------------------
-- Objectif: Vérifier que les activités "Vacances" tombent bien
-- pendant les périodes de vacances scolaires (Zone A)

DO $$
DECLARE
  vacation_rec RECORD;
  vacation_periods TEXT[] := ARRAY[
    '2025-12-20::2026-01-05',  -- Vacances de Noël 2025
    '2026-02-14::2026-03-02',  -- Vacances d'hiver 2026 (Zone A)
    '2026-04-11::2026-04-27',  -- Vacances de printemps 2026 (Zone A)
    '2026-07-04::2026-08-31'   -- Grandes vacances 2026
  ];
  period TEXT;
  start_date DATE;
  end_date DATE;
  is_in_vacation BOOLEAN;
BEGIN
  RAISE NOTICE '=== AUDIT DATES VACANCES (Activités catégorie Vacances) ===';
  RAISE NOTICE '';

  FOR vacation_rec IN
    SELECT
      a.id,
      a.name,
      av.start_date,
      av.end_date,
      s.name as structure_name
    FROM activities a
    INNER JOIN availability_slots av ON av.activity_id = a.id
    LEFT JOIN structures s ON a.structure_id = s.id
    WHERE a.category = 'Vacances'
      AND av.start_date >= '2025-12-01'::date
      AND av.start_date <= '2026-08-30'::date
    ORDER BY av.start_date
  LOOP
    is_in_vacation := FALSE;

    -- Vérifier si le créneau tombe pendant une période de vacances
    FOREACH period IN ARRAY vacation_periods
    LOOP
      start_date := split_part(period, '::', 1)::date;
      end_date := split_part(period, '::', 2)::date;

      IF vacation_rec.start_date >= start_date
         AND vacation_rec.start_date <= end_date THEN
        is_in_vacation := TRUE;
        EXIT;
      END IF;
    END LOOP;

    IF NOT is_in_vacation THEN
      RAISE NOTICE '⚠️  HORS VACANCES - % - Dates: % → % - Structure: %',
        vacation_rec.name,
        vacation_rec.start_date,
        vacation_rec.end_date,
        vacation_rec.structure_name;
    ELSE
      RAISE NOTICE '✅ OK - % - Dates: % → %',
        vacation_rec.name,
        vacation_rec.start_date,
        vacation_rec.end_date;
    END IF;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '=== FIN AUDIT DATES VACANCES ===';
  RAISE NOTICE '';
END $$;


-- ----------------------------------------------------------------
-- 3. AUDIT TARIFS (Prix aberrants)
-- ----------------------------------------------------------------
-- Objectif: Détecter les prix trop bas selon le type d'activité

DO $$
DECLARE
  pricing_rec RECORD;
  min_price NUMERIC;
  is_valid BOOLEAN;
BEGIN
  RAISE NOTICE '=== AUDIT TARIFS (Prix aberrants) ===';
  RAISE NOTICE '';

  FOR pricing_rec IN
    SELECT
      a.id,
      a.name,
      a.category,
      a.base_price,
      a.age_range,
      s.name as structure_name
    FROM activities a
    LEFT JOIN structures s ON a.structure_id = s.id
    WHERE a.published = true
    ORDER BY a.base_price ASC, a.name
  LOOP
    -- Définir le prix minimum selon la catégorie
    min_price := CASE
      WHEN pricing_rec.category = 'Vacances' AND pricing_rec.name ILIKE '%séjour%' THEN 350
      WHEN pricing_rec.category = 'Vacances' THEN 80
      ELSE 40
    END;

    is_valid := pricing_rec.base_price >= min_price;

    IF NOT is_valid THEN
      RAISE NOTICE '⚠️  PRIX SUSPECT [%€ < %€ min] - % (%) - %',
        pricing_rec.base_price,
        min_price,
        pricing_rec.name,
        pricing_rec.category,
        pricing_rec.structure_name;
    ELSE
      RAISE NOTICE '✅ OK [%€] - % (%)',
        pricing_rec.base_price,
        pricing_rec.name,
        pricing_rec.category;
    END IF;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '=== FIN AUDIT TARIFS ===';
  RAISE NOTICE '';
END $$;


-- ----------------------------------------------------------------
-- 4. AUDIT AIDES FINANCIÈRES (Ne pas dépasser le prix de base)
-- ----------------------------------------------------------------
-- Objectif: S'assurer qu'aucune combinaison d'aides ne dépasse
-- le prix de base de l'activité

DO $$
DECLARE
  aid_rec RECORD;
  max_total_aids NUMERIC;
  is_valid BOOLEAN;
BEGIN
  RAISE NOTICE '=== AUDIT AIDES FINANCIÈRES (Montants maximums) ===';
  RAISE NOTICE '';

  FOR aid_rec IN
    SELECT
      a.id,
      a.name,
      a.category,
      a.base_price,
      a.max_total_aids,
      s.name as structure_name,
      CASE
        WHEN a.category = 'Vacances' THEN a.base_price * 0.8
        ELSE a.base_price
      END as recommended_max_aids
    FROM activities a
    LEFT JOIN structures s ON a.structure_id = s.id
    WHERE a.published = true
      AND a.max_total_aids IS NOT NULL
    ORDER BY a.max_total_aids DESC, a.name
  LOOP
    -- Vérifier que max_total_aids ne dépasse pas le prix de base
    is_valid := aid_rec.max_total_aids <= aid_rec.base_price;

    -- Pour les vacances, recommander max 80% du prix
    IF aid_rec.category = 'Vacances' THEN
      is_valid := aid_rec.max_total_aids <= aid_rec.recommended_max_aids;
    END IF;

    IF NOT is_valid THEN
      RAISE NOTICE '⚠️  AIDES EXCESSIVES [%€ aides > %€ base] - % (%) - %',
        aid_rec.max_total_aids,
        aid_rec.base_price,
        aid_rec.name,
        aid_rec.category,
        aid_rec.structure_name;
      RAISE NOTICE '   → Recommandé: max %€ pour %',
        aid_rec.recommended_max_aids,
        aid_rec.category;
    ELSIF aid_rec.max_total_aids = aid_rec.base_price THEN
      RAISE NOTICE '⚠️  AIDES = PRIX [%€] - % (%)',
        aid_rec.max_total_aids,
        aid_rec.name,
        aid_rec.category;
      RAISE NOTICE '   → Reste à charge pourrait être 0€';
    ELSE
      RAISE NOTICE '✅ OK [%€ aides / %€ base] - % (%)',
        aid_rec.max_total_aids,
        aid_rec.base_price,
        aid_rec.name,
        aid_rec.category;
    END IF;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '=== FIN AUDIT AIDES FINANCIÈRES ===';
  RAISE NOTICE '';
END $$;


-- ----------------------------------------------------------------
-- RÉSUMÉ GLOBAL
-- ----------------------------------------------------------------

DO $$
DECLARE
  total_activities INTEGER;
  activities_with_insufficient_slots INTEGER;
  activities_with_too_many_slots INTEGER;
  activities_ok_slots INTEGER;
  vacation_activities_out_of_period INTEGER;
  activities_with_low_price INTEGER;
  activities_with_excessive_aids INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '            RÉSUMÉ AUDIT PRÉ-BETA                       ';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';

  -- Compter les activités publiées
  SELECT COUNT(*) INTO total_activities
  FROM activities WHERE published = true;

  -- Créneaux insuffisants (< 3)
  SELECT COUNT(DISTINCT a.id) INTO activities_with_insufficient_slots
  FROM activities a
  LEFT JOIN availability_slots av ON av.activity_id = a.id
    AND av.start_date >= '2025-12-01'::date
    AND av.start_date <= '2026-08-30'::date
  WHERE a.published = true
  GROUP BY a.id
  HAVING COUNT(av.id) < 3;

  -- Trop de créneaux (> 4)
  SELECT COUNT(DISTINCT a.id) INTO activities_with_too_many_slots
  FROM activities a
  LEFT JOIN availability_slots av ON av.activity_id = a.id
    AND av.start_date >= '2025-12-01'::date
    AND av.start_date <= '2026-08-30'::date
  WHERE a.published = true
  GROUP BY a.id
  HAVING COUNT(av.id) > 4;

  -- Créneaux OK (3-4)
  activities_ok_slots := total_activities - activities_with_insufficient_slots - activities_with_too_many_slots;

  -- Prix suspects
  SELECT COUNT(*) INTO activities_with_low_price
  FROM activities a
  WHERE a.published = true
    AND (
      (a.category = 'Vacances' AND a.name ILIKE '%séjour%' AND a.base_price < 350)
      OR (a.category = 'Vacances' AND a.name NOT ILIKE '%séjour%' AND a.base_price < 80)
      OR (a.category != 'Vacances' AND a.base_price < 40)
    );

  -- Aides excessives
  SELECT COUNT(*) INTO activities_with_excessive_aids
  FROM activities a
  WHERE a.published = true
    AND a.max_total_aids IS NOT NULL
    AND (
      a.max_total_aids > a.base_price
      OR (a.category = 'Vacances' AND a.max_total_aids > a.base_price * 0.8)
    );

  RAISE NOTICE '📊 STATISTIQUES GLOBALES:';
  RAISE NOTICE '';
  RAISE NOTICE '   Total activités publiées: %', total_activities;
  RAISE NOTICE '';
  RAISE NOTICE '🕐 CRÉNEAUX (01/12/2025 - 30/08/2026):';
  RAISE NOTICE '   ✅ Activités avec 3-4 créneaux: %', activities_ok_slots;
  RAISE NOTICE '   ⚠️  Activités avec < 3 créneaux: %', activities_with_insufficient_slots;
  RAISE NOTICE '   ⚠️  Activités avec > 4 créneaux: %', activities_with_too_many_slots;
  RAISE NOTICE '';
  RAISE NOTICE '💶 TARIFS ET AIDES:';
  RAISE NOTICE '   ⚠️  Activités avec prix suspects: %', activities_with_low_price;
  RAISE NOTICE '   ⚠️  Activités avec aides excessives: %', activities_with_excessive_aids;
  RAISE NOTICE '';

  IF activities_with_insufficient_slots = 0
     AND activities_with_too_many_slots = 0
     AND activities_with_low_price = 0
     AND activities_with_excessive_aids = 0 THEN
    RAISE NOTICE '✅ TOUS LES CRITÈRES SONT VALIDÉS !';
    RAISE NOTICE '   L''application est prête pour les tests beta.';
  ELSE
    RAISE NOTICE '⚠️  ACTIONS REQUISES:';
    IF activities_with_insufficient_slots > 0 THEN
      RAISE NOTICE '   - Ajouter des créneaux aux activités insuffisantes';
    END IF;
    IF activities_with_too_many_slots > 0 THEN
      RAISE NOTICE '   - Supprimer des créneaux aux activités avec trop de créneaux';
    END IF;
    IF activities_with_low_price > 0 THEN
      RAISE NOTICE '   - Vérifier les prix suspects et les ajuster si nécessaire';
    END IF;
    IF activities_with_excessive_aids > 0 THEN
      RAISE NOTICE '   - Plafonner les aides à max 100%% (80%% pour vacances)';
    END IF;
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
END $$;
