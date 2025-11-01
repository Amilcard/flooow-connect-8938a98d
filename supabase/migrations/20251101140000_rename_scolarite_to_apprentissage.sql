-- ============================================================
-- Migration: Renommer catégorie "Scolarité" en "Apprentissage"
-- Date: 2025-11-01
-- Purpose: Aligner la DB avec les 5 univers définis
-- Univers: SPORT, CULTURE, APPRENTISSAGE, LOISIRS, VACANCES
-- ============================================================

-- 1. Mettre à jour toutes les activités de catégorie "Scolarité" → "Apprentissage"
UPDATE public.activities
SET category = 'Apprentissage'
WHERE category = 'Scolarité';

-- 2. Mettre à jour period_type pour cohérence (trimester pour Apprentissage)
UPDATE public.activities
SET period_type = 'trimester'
WHERE category = 'Apprentissage' AND period_type IS NULL;

-- 3. Log du nombre d'activités mises à jour
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM public.activities
  WHERE category = 'Apprentissage';

  RAISE NOTICE '✅ Migration completed: % activités renommées de "Scolarité" à "Apprentissage"', updated_count;
  RAISE NOTICE '   Période par défaut: trimester';
  RAISE NOTICE '   Les 5 univers sont maintenant: SPORT, CULTURE, APPRENTISSAGE, LOISIRS, VACANCES';
END $$;

-- 4. Vérification finale
COMMENT ON COLUMN public.activities.category IS
'Catégorie/Univers de l''activité. Valeurs: Sport, Culture, Apprentissage, Loisirs, Vacances';
