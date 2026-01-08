-- ============================================================================
-- Migration: Normalize period_type values to 'scolaire' and 'vacances'
-- Date: 2026-01-08
-- Author: Claude Code
-- ============================================================================
--
-- PROBLÈME P1-2:
-- Incohérence dans les valeurs de period_type:
-- - BDD historique: CHECK IN ('annee_scolaire', 'vacances')
-- - BDD actuelle: 'scolaire' (migration déc 2025)
-- - Front legacy: 'saison_scolaire'
-- - RPC aid_grid: retourne 'scolaire'
--
-- IMPACT:
-- Comparaisons échouent (periodType === "saison_scolaire" → faux)
-- Affichage incorrect des textes conditionnels
--
-- SOLUTION:
-- Standardiser sur 2 valeurs UNIQUEMENT:
-- - 'scolaire' (activités année scolaire)
-- - 'vacances' (activités vacances/séjours)
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1: Normaliser les données existantes
-- ============================================================================

-- Convertir toutes les variantes vers 'scolaire'
UPDATE activities
SET period_type = 'scolaire'
WHERE period_type IN ('annee_scolaire', 'saison_scolaire')
  OR period_type IS NULL;

-- ============================================================================
-- ÉTAPE 2: Mettre à jour le constraint (si existant)
-- ============================================================================

-- Drop ancien constraint s'il existe
DO $$
BEGIN
  -- Try to drop constraint (may not exist)
  ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_period_type_check;
EXCEPTION
  WHEN undefined_object THEN
    RAISE NOTICE 'Constraint activities_period_type_check does not exist, skipping';
END $$;

-- Ajouter nouveau constraint avec valeurs normalisées
ALTER TABLE activities
  ADD CONSTRAINT activities_period_type_check
  CHECK (period_type IN ('scolaire', 'vacances'));

-- ============================================================================
-- ÉTAPE 3: Commentaire de documentation
-- ============================================================================

COMMENT ON COLUMN activities.period_type IS
'Type de période de l''activité. Valeurs normalisées:
- ''scolaire'': Activité sur l''année scolaire (ex: cours hebdo)
- ''vacances'': Activité pendant les vacances (ex: stages, colonies)

NOTE: Anciennes valeurs ''annee_scolaire'' et ''saison_scolaire'' ont été normalisées vers ''scolaire''';

-- ============================================================================
-- ÉTAPE 4: Log de migration
-- ============================================================================

DO $$
DECLARE
  scolaire_count INTEGER;
  vacances_count INTEGER;
  total_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO scolaire_count FROM activities WHERE period_type = 'scolaire';
  SELECT COUNT(*) INTO vacances_count FROM activities WHERE period_type = 'vacances';
  SELECT COUNT(*) INTO total_count FROM activities;

  RAISE NOTICE '════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ Migration period_type normalization appliquée';
  RAISE NOTICE '════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Valeurs normalisées:';
  RAISE NOTICE '  - scolaire: % activités', scolaire_count;
  RAISE NOTICE '  - vacances: % activités', vacances_count;
  RAISE NOTICE '  - Total: % activités', total_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Constraint: CHECK (period_type IN (''scolaire'', ''vacances''))';
  RAISE NOTICE '';
  RAISE NOTICE 'Migration from:';
  RAISE NOTICE '  ❌ annee_scolaire → ✅ scolaire';
  RAISE NOTICE '  ❌ saison_scolaire → ✅ scolaire';
  RAISE NOTICE '';
  RAISE NOTICE 'Front-end: Mettre à jour comparaisons';
  RAISE NOTICE '  periodType === "scolaire" (pas "saison_scolaire")';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════';
END $$;
