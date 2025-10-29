-- =====================================================
-- Migration: Contrainte UNIQUE sur children
-- Date: 2025-10-29
-- Objectif: Éviter les doublons d'enfants (même nom + date naissance)
-- =====================================================

-- Empêcher les doublons d'enfants pour un même parent
ALTER TABLE children
ADD CONSTRAINT unique_child_per_parent
UNIQUE (user_id, first_name, dob);

-- Documentation
COMMENT ON CONSTRAINT unique_child_per_parent ON children IS
'Prevent duplicate children with same name and date of birth for a parent. Protects against race conditions during concurrent child signup validations.';

-- Index pour améliorer les performances de vérification
CREATE INDEX IF NOT EXISTS idx_children_parent_name_dob
ON children(user_id, first_name, dob);

COMMENT ON INDEX idx_children_parent_name_dob IS
'Performance index for unique child validation checks';
