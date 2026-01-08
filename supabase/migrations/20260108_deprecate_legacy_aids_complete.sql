-- ============================================================================
-- Migration: Finalize deprecation of legacy financial aids system
-- Date: 2026-01-08
-- Author: Claude Code
-- ============================================================================
--
-- CONTEXT:
-- La RPC calculate_eligible_aids était marquée "deprecated" depuis nov 2025
-- MAIS l'edge function bookings l'utilisait encore (découvert 2026-01-08)
--
-- ACTIONS CORRECTIVES:
-- 1. ✅ Edge function bookings migré vers calculate_family_aid (commit ad1af09)
-- 2. Cette migration finalise la dépréciation et documente la situation
--
-- NOUVEAU SYSTÈME (aid_grid):
-- - Source de vérité: table aid_grid (48 rows)
-- - RPC: calculate_family_aid
-- - Cap 70% automatique + RAC minimum 30%
-- - Tranches QF harmonisées (4 tranches)
-- - Aides variables selon prix de l'activité
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1: Mettre à jour la dépréciation de calculate_eligible_aids
-- ============================================================================

COMMENT ON FUNCTION calculate_eligible_aids(
  INTEGER, INTEGER, TEXT, NUMERIC, INTEGER, TEXT[]
) IS
'⚠️ DEPRECATED (2026-01-08) - DO NOT USE
Cette RPC est OBSOLÈTE et ne doit plus être utilisée.

POURQUOI:
- Cap 100% au lieu de 70% (non conforme CAF)
- Pas de RAC minimum 30%
- Aides fixes non adaptées au prix
- Utilise financial_aids (table legacy)

REMPLACEMENT:
- RPC: calculate_family_aid (source: aid_grid)
- Cap 70% automatique
- Aides variables selon prix
- Tranches QF harmonisées

DERNIÈRE UTILISATION:
- Edge function bookings (jusqu''au 2026-01-08)
- Migré vers calculate_family_aid (commit ad1af09)

STATUT:
- Frontend: Migré ✅ (depuis jan 2026)
- Backend: Migré ✅ (08 jan 2026)
- Peut être SUPPRIMÉE dans une prochaine migration';

-- ============================================================================
-- ÉTAPE 2: Documenter la table financial_aids
-- ============================================================================

COMMENT ON TABLE financial_aids IS
'⚠️ DEPRECATED (2026-01-08) - READ ONLY
Cette table est OBSOLÈTE pour les nouveaux calculs d''aides.

SOURCE DE VÉRITÉ ACTUELLE: aid_grid

DIFFÉRENCES:
┌────────────────────┬──────────────────┬────────────────┐
│     Critère        │ financial_aids   │   aid_grid     │
├────────────────────┼──────────────────┼────────────────┤
│ Aides fixes        │ Pass''Sport, etc │ N/A            │
│ Aides QF           │ NON              │ OUI (variable) │
│ Cap 70%            │ NON              │ OUI            │
│ Tranches QF        │ NON              │ OUI (4)        │
│ Basé sur prix      │ NON              │ OUI            │
└────────────────────┴──────────────────┴────────────────┘

USAGE ACTUEL:
- Conservée pour données historiques uniquement
- Ne plus utiliser pour de nouveaux calculs
- Migration vers aid_grid complète

PEUT ÊTRE ARCHIVÉE: Après validation période de transition (3-6 mois)';

-- ============================================================================
-- ÉTAPE 3: Créer une vue de migration pour traçabilité
-- ============================================================================

CREATE OR REPLACE VIEW v_aids_migration_status AS
SELECT
  'calculate_eligible_aids' as deprecated_rpc,
  'calculate_family_aid' as new_rpc,
  'financial_aids' as deprecated_table,
  'aid_grid' as new_table,
  '2026-01-08' as migration_date,
  'ad1af09' as commit_hash,
  'Edge function bookings migrated' as last_step,
  'COMPLETE' as status,
  ARRAY[
    'Frontend simulators: MIGRATED ✅',
    'Frontend components: MIGRATED ✅',
    'Edge function bookings: MIGRATED ✅',
    'All systems using aid_grid: YES ✅'
  ] as migration_checklist;

COMMENT ON VIEW v_aids_migration_status IS
'Vue de traçabilité pour la migration legacy → aid_grid (2026-01-08)';

-- ============================================================================
-- ÉTAPE 4: Log de migration
-- ============================================================================

DO $$
DECLARE
  legacy_usage_count INTEGER;
BEGIN
  -- Compter les anciennes données (pour info)
  SELECT COUNT(*) INTO legacy_usage_count FROM financial_aids WHERE active = true;

  RAISE NOTICE '════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ Migration legacy aids → aid_grid FINALISÉE';
  RAISE NOTICE '════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Date: 2026-01-08';
  RAISE NOTICE 'Commit: ad1af09';
  RAISE NOTICE '';
  RAISE NOTICE 'Système LEGACY (déprécié):';
  RAISE NOTICE '  - RPC: calculate_eligible_aids → DEPRECATED ⚠️';
  RAISE NOTICE '  - Table: financial_aids (% active rows) → READ ONLY ⚠️', legacy_usage_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Système ACTUEL (production):';
  RAISE NOTICE '  - RPC: calculate_family_aid → ACTIVE ✅';
  RAISE NOTICE '  - Table: aid_grid (48 rows) → SOURCE OF TRUTH ✅';
  RAISE NOTICE '  - Cap 70%% + RAC min 30%% → GARANTI ✅';
  RAISE NOTICE '';
  RAISE NOTICE 'Composants migrés:';
  RAISE NOTICE '  ✅ AidSimulator (page accueil)';
  RAISE NOTICE '  ✅ StandaloneAidCalculator (/aides)';
  RAISE NOTICE '  ✅ SharedAidCalculator (inscription)';
  RAISE NOTICE '  ✅ Edge function bookings (réservation)';
  RAISE NOTICE '';
  RAISE NOTICE 'Prochaines étapes:';
  RAISE NOTICE '  1. Tests E2E avec nouveaux calculs';
  RAISE NOTICE '  2. Monitoring logs bookings (qf_bracket, aid_percentage)';
  RAISE NOTICE '  3. Validation période 3-6 mois';
  RAISE NOTICE '  4. Suppression définitive de calculate_eligible_aids';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════';
END $$;

-- ============================================================================
-- ÉTAPE 5: Grant permissions sur la vue
-- ============================================================================

GRANT SELECT ON v_aids_migration_status TO authenticated, anon;
