-- Migration: Finaliser 3 axes partiels (soutien scolaire, santé/bien-être, non-recours financier)
-- Date: 2025-10-26

-- =============================================================================
-- AXE 1 : SOUTIEN SCOLAIRE / RACCROCHAGE (60% → 100%)
-- =============================================================================

-- Ajouter colonne pour distinguer le type d'accompagnement scolaire
ALTER TABLE public.activities
ADD COLUMN IF NOT EXISTS activity_purpose TEXT
CHECK (activity_purpose IN ('soutien_classique', 'raccrochage', 'orientation', 'autre', NULL));

COMMENT ON COLUMN public.activities.activity_purpose IS
'Type d''accompagnement scolaire: soutien_classique (aide devoirs), raccrochage (décrocheurs), orientation (choix parcours), autre';

-- Mettre à jour les activités existantes de type "Scolarité"
UPDATE public.activities
SET activity_purpose = 'soutien_classique'
WHERE category = 'Scolarité'
  AND activity_purpose IS NULL
  AND (
    title ILIKE '%aide%devoirs%'
    OR title ILIKE '%soutien%'
    OR description ILIKE '%soutien scolaire%'
  );

UPDATE public.activities
SET activity_purpose = 'orientation'
WHERE category = 'Scolarité'
  AND activity_purpose IS NULL
  AND (
    title ILIKE '%orientation%'
    OR title ILIKE '%brevet%'
    OR title ILIKE '%parcours%'
  );

-- Index pour filtrage rapide
CREATE INDEX IF NOT EXISTS idx_activities_purpose
ON public.activities(activity_purpose)
WHERE activity_purpose IS NOT NULL;


-- =============================================================================
-- AXE 2 : SANTÉ / BIEN-ÊTRE (40% → 100%)
-- =============================================================================

-- Ajouter flags santé et APA (Activité Physique Adaptée)
ALTER TABLE public.activities
ADD COLUMN IF NOT EXISTS is_health_focused BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_apa BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.activities.is_health_focused IS
'Activité axée sur la santé/bien-être (prévention, nutrition, gestion stress, etc.)';

COMMENT ON COLUMN public.activities.is_apa IS
'Activité Physique Adaptée - sport santé encadré par professionnels formés pour publics fragiles';

-- Détecter automatiquement les activités santé existantes
UPDATE public.activities
SET is_health_focused = true
WHERE is_health_focused = false
  AND (
    description ILIKE '%santé%'
    OR description ILIKE '%bien-être%'
    OR description ILIKE '%prévention%'
    OR tags && ARRAY['santé', 'bien-être', 'prévention']
  );

-- Détecter les APA (sport + accessibilité handicap + personnel spécialisé)
UPDATE public.activities
SET is_apa = true
WHERE is_apa = false
  AND category = 'Sport'
  AND (accessibility_checklist->>'specialized_staff')::boolean = true
  AND (accessibility_checklist->>'adapted_equipment')::boolean = true;

-- Index pour filtres santé
CREATE INDEX IF NOT EXISTS idx_activities_health
ON public.activities(is_health_focused)
WHERE is_health_focused = true;

CREATE INDEX IF NOT EXISTS idx_activities_apa
ON public.activities(is_apa)
WHERE is_apa = true;


-- =============================================================================
-- AXE 7 : NON-RECOURS FINANCIER (50% → 100%)
-- =============================================================================

-- 7A. Ajouter colonnes sur profiles pour tracking blocages financiers
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS price_blocked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS seuil_prix_max NUMERIC(10,2);

COMMENT ON COLUMN public.profiles.price_blocked IS
'Famille a déclaré un blocage financier (prix trop élevé, reste à charge inacceptable)';

COMMENT ON COLUMN public.profiles.seuil_prix_max IS
'Montant maximum acceptable par l''usager (après aides). NULL = non renseigné';

-- 7B. Ajouter colonnes sur bookings pour tracking abandons financiers
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS reste_a_charge NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS abandon_raison_financiere BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.bookings.reste_a_charge IS
'Reste à charge final pour l''usager après déduction des aides (calculé lors de la simulation)';

COMMENT ON COLUMN public.bookings.abandon_raison_financiere IS
'Réservation annulée ou non finalisée pour raison financière (coût trop élevé)';

-- Index pour statistiques non-recours
CREATE INDEX IF NOT EXISTS idx_profiles_price_blocked
ON public.profiles(price_blocked)
WHERE price_blocked = true;

CREATE INDEX IF NOT EXISTS idx_bookings_abandon_financier
ON public.bookings(abandon_raison_financiere)
WHERE abandon_raison_financiere = true;

-- Vue pour statistiques non-recours financier
CREATE OR REPLACE VIEW public.v_non_recours_financier AS
SELECT
  COUNT(DISTINCT p.id) FILTER (WHERE p.price_blocked = true) as familles_bloquees,
  COUNT(DISTINCT b.id) FILTER (WHERE b.abandon_raison_financiere = true) as reservations_abandonnees_prix,
  COUNT(DISTINCT b.id) FILTER (WHERE b.reste_a_charge > 100) as reservations_rac_eleve,
  AVG(b.reste_a_charge) FILTER (WHERE b.reste_a_charge IS NOT NULL) as rac_moyen,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY p.seuil_prix_max) as seuil_prix_median
FROM public.profiles p
LEFT JOIN public.bookings b ON b.user_id = p.id;

COMMENT ON VIEW public.v_non_recours_financier IS
'Statistiques sur le non-recours pour raisons financières';


-- =============================================================================
-- FONCTION : Calculer automatiquement le reste à charge lors des simulations
-- =============================================================================

CREATE OR REPLACE FUNCTION public.calculate_reste_a_charge(
  p_price_base NUMERIC,
  p_simulated_aids JSONB
) RETURNS NUMERIC AS $$
DECLARE
  v_total_aids NUMERIC := 0;
  v_aid JSONB;
BEGIN
  -- Sommer toutes les aides simulées
  IF p_simulated_aids IS NOT NULL THEN
    FOR v_aid IN SELECT * FROM jsonb_array_elements(p_simulated_aids)
    LOOP
      v_total_aids := v_total_aids + COALESCE((v_aid->>'montant')::numeric, 0);
    END LOOP;
  END IF;

  -- Reste à charge = prix de base - total des aides (minimum 0)
  RETURN GREATEST(p_price_base - v_total_aids, 0);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION public.calculate_reste_a_charge IS
'Calcule le reste à charge après déduction des aides simulées';


-- =============================================================================
-- Logs et validation
-- =============================================================================

DO $$
DECLARE
  v_activities_scolaire INTEGER;
  v_activities_sante INTEGER;
  v_activities_apa INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_activities_scolaire
  FROM public.activities
  WHERE activity_purpose IS NOT NULL;

  SELECT COUNT(*) INTO v_activities_sante
  FROM public.activities
  WHERE is_health_focused = true;

  SELECT COUNT(*) INTO v_activities_apa
  FROM public.activities
  WHERE is_apa = true;

  RAISE NOTICE '✅ Migration terminée:';
  RAISE NOTICE '  - % activités scolaires catégorisées', v_activities_scolaire;
  RAISE NOTICE '  - % activités santé identifiées', v_activities_sante;
  RAISE NOTICE '  - % activités APA détectées', v_activities_apa;
  RAISE NOTICE '  - Colonnes non-recours financier ajoutées sur profiles et bookings';
END $$;
