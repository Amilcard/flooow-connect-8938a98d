-- ============================================================================
-- Migration: Populate aid_grid with validated QF reduction grid
-- Date: 2026-01-08
-- Description: Insert fixed euro reductions based on price ranges and QF thresholds
--
-- SOURCE: Grille validée avec Opus 4.5
-- RÈGLE: Déductions en € FIXES (pas de %), arrondies à 5€ près
-- PLAFONDS: Scolaire 150€ | Stage 120€ | Séjour 200€
-- ============================================================================

-- Clean existing data (if any)
TRUNCATE TABLE aid_grid CASCADE;

-- ============================================================================
-- ACTIVITÉS SCOLAIRES (saison septembre-juin)
-- ============================================================================

-- Prix: 190€ (Gymnastique, Chant)
INSERT INTO aid_grid (price_type, price_min, price_max, qf_threshold, reduction_euros) VALUES
('scolaire', 190, 190, 500, 95),   -- QF < 500
('scolaire', 190, 190, 800, 55),   -- QF 500-799
('scolaire', 190, 190, 1200, 30),  -- QF 800-1199
('scolaire', 190, 190, 9999, 0);   -- QF ≥ 1200

-- Prix: 210€ (Arts plastiques)
INSERT INTO aid_grid (price_type, price_min, price_max, qf_threshold, reduction_euros) VALUES
('scolaire', 210, 210, 500, 105),
('scolaire', 210, 210, 800, 65),
('scolaire', 210, 210, 1200, 30),
('scolaire', 210, 210, 9999, 0);

-- Prix: 220€ (Cirque, Multisports)
INSERT INTO aid_grid (price_type, price_min, price_max, qf_threshold, reduction_euros) VALUES
('scolaire', 220, 220, 500, 110),
('scolaire', 220, 220, 800, 65),
('scolaire', 220, 220, 1200, 35),
('scolaire', 220, 220, 9999, 0);

-- Prix: 230€ (Théâtre ados, Judo)
INSERT INTO aid_grid (price_type, price_min, price_max, qf_threshold, reduction_euros) VALUES
('scolaire', 230, 230, 500, 115),
('scolaire', 230, 230, 800, 70),
('scolaire', 230, 230, 1200, 35),
('scolaire', 230, 230, 9999, 0);

-- Prix: 240€ (Football U10)
INSERT INTO aid_grid (price_type, price_min, price_max, qf_threshold, reduction_euros) VALUES
('scolaire', 240, 240, 500, 120),
('scolaire', 240, 240, 800, 70),
('scolaire', 240, 240, 1200, 35),
('scolaire', 240, 240, 9999, 0);

-- Prix: 260€ (Basket, Escalade, Natation, Robotique, Tennis)
INSERT INTO aid_grid (price_type, price_min, price_max, qf_threshold, reduction_euros) VALUES
('scolaire', 260, 260, 500, 130),
('scolaire', 260, 260, 800, 80),
('scolaire', 260, 260, 1200, 40),
('scolaire', 260, 260, 9999, 0);

-- Prix: 320€ (Danse classique) - PLAFOND 150€ appliqué
INSERT INTO aid_grid (price_type, price_min, price_max, qf_threshold, reduction_euros) VALUES
('scolaire', 320, 320, 500, 150),  -- Plafond scolaire
('scolaire', 320, 320, 800, 95),
('scolaire', 320, 320, 1200, 50),
('scolaire', 320, 320, 9999, 0);

-- Prix: 380€ (Conservatoire violon) - PLAFOND 150€ appliqué
INSERT INTO aid_grid (price_type, price_min, price_max, qf_threshold, reduction_euros) VALUES
('scolaire', 380, 380, 500, 150),  -- Plafond scolaire
('scolaire', 380, 380, 800, 115),
('scolaire', 380, 380, 1200, 55),
('scolaire', 380, 380, 9999, 0);

-- Prix: 420€ (Piano, Équitation) - PLAFOND 150€ appliqué
INSERT INTO aid_grid (price_type, price_min, price_max, qf_threshold, reduction_euros) VALUES
('scolaire', 420, 420, 500, 150),  -- Plafond scolaire
('scolaire', 420, 420, 800, 125),
('scolaire', 420, 420, 1200, 65),
('scolaire', 420, 420, 9999, 0);

-- ============================================================================
-- ACTIVITÉS VACANCES - STAGES (5 jours)
-- ============================================================================

-- Prix: 360€ (Stage dessin, photo, sciences) - PLAFOND 120€ appliqué
INSERT INTO aid_grid (price_type, price_min, price_max, qf_threshold, reduction_euros) VALUES
('stage', 360, 360, 500, 120),  -- Plafond stage
('stage', 360, 360, 800, 110),
('stage', 360, 360, 1200, 55),
('stage', 360, 360, 9999, 0);

-- Prix: 410€ (Stage multi-sports) - PLAFOND 120€ appliqué
INSERT INTO aid_grid (price_type, price_min, price_max, qf_threshold, reduction_euros) VALUES
('stage', 410, 410, 500, 120),  -- Plafond stage
('stage', 410, 410, 800, 120),  -- Plafond stage
('stage', 410, 410, 1200, 60),
('stage', 410, 410, 9999, 0);

-- ============================================================================
-- ACTIVITÉS VACANCES - SÉJOURS (avec hébergement)
-- ============================================================================

-- Prix: 360€ (Camp nature, Mini-séjour mer)
INSERT INTO aid_grid (price_type, price_min, price_max, qf_threshold, reduction_euros) VALUES
('sejour', 360, 360, 500, 180),
('sejour', 360, 360, 800, 110),
('sejour', 360, 360, 1200, 55),
('sejour', 360, 360, 9999, 0);

-- Prix: 550€ (Colonie été montagne) - PLAFOND 200€ appliqué
INSERT INTO aid_grid (price_type, price_min, price_max, qf_threshold, reduction_euros) VALUES
('sejour', 550, 550, 500, 200),  -- Plafond séjour
('sejour', 550, 550, 800, 165),
('sejour', 550, 550, 1200, 85),
('sejour', 550, 550, 9999, 0);

-- Prix: 560€ (Camp ski hiver) - PLAFOND 200€ appliqué
INSERT INTO aid_grid (price_type, price_min, price_max, qf_threshold, reduction_euros) VALUES
('sejour', 560, 560, 500, 200),  -- Plafond séjour
('sejour', 560, 560, 800, 170),
('sejour', 560, 560, 1200, 85),
('sejour', 560, 560, 9999, 0);

-- ============================================================================
-- Vérification: Compter les lignes insérées
-- ============================================================================
DO $$
DECLARE
  row_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO row_count FROM aid_grid;
  RAISE NOTICE 'aid_grid populated with % rows', row_count;

  -- Expected: 17 scolaire + 2 stage + 3 sejour = 22 activités × 4 tranches QF = 88 rows
  IF row_count != 88 THEN
    RAISE WARNING 'Expected 88 rows but got %', row_count;
  ELSE
    RAISE NOTICE '✅ Migration successful: all activities covered';
  END IF;
END $$;

-- ============================================================================
-- Index pour performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_aid_grid_lookup
ON aid_grid (price_type, price_min, price_max, qf_threshold);

COMMENT ON TABLE aid_grid IS 'Grille de déductions fixes en € selon QF et prix activité (validée 2026-01-08)';
