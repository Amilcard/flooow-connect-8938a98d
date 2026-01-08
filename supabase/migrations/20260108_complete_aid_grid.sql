-- ============================================================================
-- Migration: Complete aid_grid with stage and sejour data
-- Date: 2026-01-08
-- Description: Add missing stage and sejour reductions to existing grid
--
-- CURRENT STATE: Only 'scolaire' data exists (48 rows)
-- ADDING: 'stage' (8 rows) + 'sejour' (12 rows) = 20 new rows
-- FINAL: 68 total rows
-- ============================================================================

-- ============================================================================
-- ACTIVITÉS VACANCES - STAGES (5 jours)
-- PLAFOND: 120€
-- ============================================================================

-- Fourchette: 360-409€ (Stage dessin, photo, sciences)
-- Plafond 120€ appliqué pour QF<500
INSERT INTO aid_grid (price_type, price_min, price_max, qf_threshold, reduction_euros)
VALUES
('stage', 360.00, 409.99, 500, 120),   -- QF < 500 (plafond)
('stage', 360.00, 409.99, 800, 110),   -- QF 500-799
('stage', 360.00, 409.99, 1200, 55),   -- QF 800-1199
('stage', 360.00, 409.99, 9999, 0);    -- QF ≥ 1200

-- Fourchette: 410-499€ (Stage multi-sports)
-- Plafond 120€ appliqué pour QF<500 ET QF 500-799
INSERT INTO aid_grid (price_type, price_min, price_max, qf_threshold, reduction_euros)
VALUES
('stage', 410.00, 499.99, 500, 120),   -- QF < 500 (plafond)
('stage', 410.00, 499.99, 800, 120),   -- QF 500-799 (plafond)
('stage', 410.00, 499.99, 1200, 60),   -- QF 800-1199
('stage', 410.00, 499.99, 9999, 0);    -- QF ≥ 1200

-- ============================================================================
-- ACTIVITÉS VACANCES - SÉJOURS (avec hébergement)
-- PLAFOND: 200€
-- ============================================================================

-- Fourchette: 360-409€ (Camp nature, Mini-séjour mer)
INSERT INTO aid_grid (price_type, price_min, price_max, qf_threshold, reduction_euros)
VALUES
('sejour', 360.00, 409.99, 500, 180),  -- QF < 500 (50%)
('sejour', 360.00, 409.99, 800, 110),  -- QF 500-799 (30%)
('sejour', 360.00, 409.99, 1200, 55),  -- QF 800-1199 (15%)
('sejour', 360.00, 409.99, 9999, 0);   -- QF ≥ 1200

-- Fourchette: 500-599€ (Colonie été montagne, Camp ski)
-- Plafond 200€ appliqué pour QF<500
INSERT INTO aid_grid (price_type, price_min, price_max, qf_threshold, reduction_euros)
VALUES
('sejour', 500.00, 599.99, 500, 200),  -- QF < 500 (plafond 200€)
('sejour', 500.00, 599.99, 800, 165),  -- QF 500-799 (30% de 550€ ≈ 165)
('sejour', 500.00, 599.99, 1200, 85),  -- QF 800-1199 (15% de 550€ ≈ 85)
('sejour', 500.00, 599.99, 9999, 0);   -- QF ≥ 1200

-- ============================================================================
-- Vérification
-- ============================================================================
DO $$
DECLARE
  total_rows INTEGER;
  scolaire_rows INTEGER;
  stage_rows INTEGER;
  sejour_rows INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_rows FROM aid_grid;
  SELECT COUNT(*) INTO scolaire_rows FROM aid_grid WHERE price_type = 'scolaire';
  SELECT COUNT(*) INTO stage_rows FROM aid_grid WHERE price_type = 'stage';
  SELECT COUNT(*) INTO sejour_rows FROM aid_grid WHERE price_type = 'sejour';

  RAISE NOTICE '=== AID_GRID STATUS ===';
  RAISE NOTICE 'Scolaire: % rows', scolaire_rows;
  RAISE NOTICE 'Stage: % rows', stage_rows;
  RAISE NOTICE 'Séjour: % rows', sejour_rows;
  RAISE NOTICE 'TOTAL: % rows', total_rows;

  IF stage_rows = 8 AND sejour_rows = 8 THEN
    RAISE NOTICE '✅ Migration successful!';
  ELSE
    RAISE WARNING '⚠️ Expected 8 stage + 8 sejour rows';
  END IF;
END $$;

-- ============================================================================
-- Vue pour debug : Voir toutes les fourchettes par type
-- ============================================================================
CREATE OR REPLACE VIEW v_aid_grid_summary AS
SELECT
  price_type,
  qf_threshold,
  price_min,
  price_max,
  reduction_euros,
  CASE
    WHEN qf_threshold = 500 THEN 'QF < 500'
    WHEN qf_threshold = 800 THEN 'QF 500-799'
    WHEN qf_threshold = 1200 THEN 'QF 800-1199'
    ELSE 'QF ≥ 1200'
  END as qf_label,
  CONCAT(price_min, '-', price_max, '€') as price_range
FROM aid_grid
ORDER BY price_type, price_min, qf_threshold;

COMMENT ON VIEW v_aid_grid_summary IS 'Vue debug pour visualiser la grille d''aides';
