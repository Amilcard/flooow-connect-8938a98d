-- ==========================================
-- LOT 1.1 : Ajout rôle collectivite_viewer
-- ==========================================

ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'collectivite_viewer';