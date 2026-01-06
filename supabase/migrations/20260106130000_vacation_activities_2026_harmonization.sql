-- ============================================
-- MIGRATION: Harmonisation activités vacances 2026
-- Date: 2026-01-06
-- Auteur: Claude
-- ============================================
--
-- RÈGLES MÉTIER:
-- - Durée standard: 5 jours (séjours avec hébergement)
-- - Prix harmonisés:
--   * Ski: 560€ / 5 jours
--   * Multisport/Aventure: 410€ / 5 jours
--   * Autres (nature, découverte, etc.): 360€ / 5 jours
--
-- Zone A Lyon - Vacances 2026:
-- - Hiver: 07/02 - 23/02
-- - Printemps: 04/04 - 20/04
-- - Été: 04/07 - 31/08
-- - Toussaint: 17/10 - 02/11
-- - Noël: 19/12 - 04/01/2027
-- ============================================

-- ============================================
-- 1. Mise à jour des prix harmonisés par type d'activité
-- ============================================

-- Séjours SKI: 560€ / 5 jours
UPDATE activities
SET
  price_base = 560,
  duration_days = 5,
  price_unit = 'sejour'
WHERE period_type = 'vacances'
  AND vacation_type = 'sejour_hebergement'
  AND (
    LOWER(title) LIKE '%ski%'
    OR LOWER(title) LIKE '%neige%'
    OR LOWER(title) LIKE '%montagne hiver%'
    OR LOWER(description) LIKE '%ski%'
  );

-- Séjours MULTISPORT / AVENTURE: 410€ / 5 jours
UPDATE activities
SET
  price_base = 410,
  duration_days = 5,
  price_unit = 'sejour'
WHERE period_type = 'vacances'
  AND vacation_type = 'sejour_hebergement'
  AND (
    LOWER(title) LIKE '%multisport%'
    OR LOWER(title) LIKE '%multi-sport%'
    OR LOWER(title) LIKE '%aventure%'
    OR LOWER(title) LIKE '%multi-activit%'
    OR LOWER(description) LIKE '%multisport%'
  )
  AND price_base != 560; -- Ne pas écraser les séjours ski

-- Autres séjours (nature, découverte, etc.): 360€ / 5 jours
UPDATE activities
SET
  price_base = 360,
  duration_days = 5,
  price_unit = 'sejour'
WHERE period_type = 'vacances'
  AND vacation_type = 'sejour_hebergement'
  AND price_base NOT IN (560, 410) -- Ne pas écraser ski et multisport
  AND price_base IS NOT NULL;

-- ============================================
-- 2. Mise à jour des périodes vacances pour Zone A Lyon 2026
-- ============================================

-- Ajouter les nouvelles périodes 2026 aux activités vacances existantes
UPDATE activities
SET vacation_periods = ARRAY[
  'hiver_2026',
  'printemps_2026',
  'été_2026',
  'toussaint_2026',
  'noel_2026'
]::text[]
WHERE period_type = 'vacances'
  AND vacation_type = 'sejour_hebergement';

-- Pour les stages journée, garder toutes les périodes
UPDATE activities
SET vacation_periods = ARRAY[
  'hiver_2026',
  'printemps_2026',
  'été_2026',
  'toussaint_2026',
  'noel_2026'
]::text[]
WHERE period_type = 'vacances'
  AND vacation_type IN ('stage_journee', 'centre_loisirs');

-- ============================================
-- 3. Mise à jour des activités SCOLAIRES 2025-2026
-- ============================================

-- Les activités scolaires ont une période fixe: 15/09/2025 - 30/06/2026
-- (pas de mise à jour de dates ici, géré par les sessions)

-- ============================================
-- 4. Ajout de métadonnées pour la tarification QF
-- ============================================

-- Ajouter un flag pour indiquer si l'activité accepte les tarifs QF
-- (uniquement pour les activités vacances)
ALTER TABLE activities
ADD COLUMN IF NOT EXISTS qf_pricing_enabled BOOLEAN DEFAULT FALSE;

-- Activer la tarification QF pour toutes les activités vacances avec hébergement
UPDATE activities
SET qf_pricing_enabled = TRUE
WHERE period_type = 'vacances'
  AND vacation_type IN ('sejour_hebergement', 'centre_loisirs');

-- Désactiver pour les activités scolaires (tarif fixe)
UPDATE activities
SET qf_pricing_enabled = FALSE
WHERE period_type = 'scolaire'
  OR period_type IS NULL;

-- ============================================
-- 5. Index pour les nouvelles colonnes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_activities_qf_pricing
ON activities(qf_pricing_enabled)
WHERE qf_pricing_enabled = TRUE;

-- ============================================
-- 6. Commentaires
-- ============================================

COMMENT ON COLUMN activities.qf_pricing_enabled IS
'Indique si l''activité accepte la tarification selon le Quotient Familial.
Uniquement pour les activités vacances.';

-- ============================================
-- 7. Résumé des mises à jour
-- ============================================

DO $$
DECLARE
  v_ski_count INTEGER;
  v_multisport_count INTEGER;
  v_other_count INTEGER;
  v_total_vacation INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_ski_count
  FROM activities
  WHERE period_type = 'vacances' AND price_base = 560;

  SELECT COUNT(*) INTO v_multisport_count
  FROM activities
  WHERE period_type = 'vacances' AND price_base = 410;

  SELECT COUNT(*) INTO v_other_count
  FROM activities
  WHERE period_type = 'vacances' AND price_base = 360;

  SELECT COUNT(*) INTO v_total_vacation
  FROM activities
  WHERE period_type = 'vacances';

  RAISE NOTICE '=== RÉSUMÉ HARMONISATION VACANCES 2026 ===';
  RAISE NOTICE 'Séjours Ski (560€/5j): % activités', v_ski_count;
  RAISE NOTICE 'Séjours Multisport (410€/5j): % activités', v_multisport_count;
  RAISE NOTICE 'Autres séjours (360€/5j): % activités', v_other_count;
  RAISE NOTICE 'Total activités vacances: %', v_total_vacation;
  RAISE NOTICE '==========================================';
END $$;
