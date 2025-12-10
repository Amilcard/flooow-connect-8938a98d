-- ============================================================
-- Migration: Enrichir la structure des activités
-- Date: 2025-12-10
-- Objectif: Aligner les 29 activités réelles sur la richesse des mock-activities
-- ============================================================

-- =====================================================
-- ÉTAPE 1: Ajout des colonnes manquantes
-- =====================================================

-- Lieu et transport
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS lieu_nom TEXT;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS transport_info TEXT;

-- Mobilité détaillée
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS mobility_tc TEXT;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS mobility_velo BOOLEAN DEFAULT FALSE;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS mobility_covoit BOOLEAN DEFAULT FALSE;

-- Santé et prérequis
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS sante_tags TEXT[];
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS prerequis TEXT[];
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS pieces_a_fournir TEXT[];

-- Métadonnées séjours/vacances
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS vacation_type TEXT;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS duration_days INTEGER;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS has_accommodation BOOLEAN DEFAULT FALSE;

-- Créneaux structurés (JSON)
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS creneaux JSONB;

-- Dates structurées
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS date_debut DATE;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS date_fin DATE;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS jours_horaires TEXT;

-- Publication et prix
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS price_base NUMERIC(10,2);
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS price_unit TEXT DEFAULT 'séance';

-- Adresse détaillée
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Image
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Organisme (dénormalisé pour performance)
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS organism_id UUID;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS organism_name TEXT;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS organism_type TEXT;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS organism_phone TEXT;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS organism_email TEXT;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS organism_website TEXT;

-- =====================================================
-- ÉTAPE 2: Indexes pour performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_activities_vacation_type ON public.activities(vacation_type);
CREATE INDEX IF NOT EXISTS idx_activities_duration_days ON public.activities(duration_days);
CREATE INDEX IF NOT EXISTS idx_activities_is_published ON public.activities(is_published);
CREATE INDEX IF NOT EXISTS idx_activities_price_base ON public.activities(price_base);
CREATE INDEX IF NOT EXISTS idx_activities_city ON public.activities(city);
CREATE INDEX IF NOT EXISTS idx_activities_postal_code ON public.activities(postal_code);
CREATE INDEX IF NOT EXISTS idx_activities_sante_tags ON public.activities USING GIN(sante_tags);
CREATE INDEX IF NOT EXISTS idx_activities_prerequis ON public.activities USING GIN(prerequis);

-- =====================================================
-- ÉTAPE 3: Créer ou remplacer la vue activities_with_sessions
-- (Utilise uniquement les colonnes existantes dans la table)
-- =====================================================

DROP VIEW IF EXISTS public.activities_with_sessions;

CREATE OR REPLACE VIEW public.activities_with_sessions
WITH (security_invoker = on)
AS
SELECT
  a.id,
  a.title,
  a.description,
  a.categories,
  -- Catégorie principale (premier élément du tableau)
  a.categories[1] AS category,
  a.age_min,
  a.age_max,
  a.price_base,
  a.price_unit,
  a.accepts_aid_types,
  a.tags,
  a.period_type,
  a.vacation_periods,
  a.vacation_type,
  a.duration_days,
  a.has_accommodation,
  a.address,
  a.city,
  a.postal_code,
  a.latitude,
  a.longitude,
  a.date_debut,
  a.date_fin,
  a.jours_horaires,
  a.creneaux,
  a.image_url,
  a.is_published,
  a.lieu_nom,
  a.transport_info,
  a.mobility_tc,
  a.mobility_velo,
  a.mobility_covoit,
  a.sante_tags,
  a.prerequis,
  a.pieces_a_fournir,
  a.organism_id,
  a.organism_name,
  a.organism_type,
  a.organism_phone,
  a.organism_email,
  a.organism_website,
  -- Alias pour compatibilité avec le code existant
  a.mobility_covoit AS covoiturage_enabled,
  -- Accessibilité (boolean existant)
  a.has_accessibility,
  a.created_at,
  a.updated_at,
  -- Agrégation des sessions depuis availability_slots
  COALESCE(
    jsonb_agg(
      DISTINCT jsonb_build_object(
        'id', s.id,
        'start', s.start,
        'end', s.end,
        'seats_total', s.seats_total,
        'seats_remaining', s.seats_remaining
      )
    ) FILTER (WHERE s.id IS NOT NULL),
    '[]'::jsonb
  ) AS sessions_json,
  -- Age min/max depuis les sessions si disponible
  COALESCE(MIN(s.seats_total), a.age_min) AS session_age_min,
  COALESCE(MAX(s.seats_total), a.age_max) AS session_age_max,
  -- Accessibility JSONB pour compatibilité
  '{}'::jsonb AS accessibility,
  -- Types de mobilité (pour filtres)
  ARRAY_REMOVE(ARRAY[
    CASE WHEN a.mobility_tc IS NOT NULL THEN 'TC' END,
    CASE WHEN a.mobility_velo = TRUE THEN 'velo' END,
    CASE WHEN a.mobility_covoit = TRUE THEN 'covoit' END
  ], NULL) AS mobility_types
FROM public.activities a
LEFT JOIN public.availability_slots s ON s.activity_id = a.id
GROUP BY
  a.id, a.title, a.description, a.categories,
  a.age_min, a.age_max, a.price_base, a.price_unit, a.accepts_aid_types,
  a.tags, a.period_type, a.vacation_periods, a.vacation_type,
  a.duration_days, a.has_accommodation, a.address, a.city, a.postal_code,
  a.latitude, a.longitude, a.date_debut, a.date_fin, a.jours_horaires,
  a.creneaux, a.image_url, a.is_published, a.lieu_nom, a.transport_info,
  a.mobility_tc, a.mobility_velo, a.mobility_covoit, a.sante_tags,
  a.prerequis, a.pieces_a_fournir, a.organism_id, a.organism_name,
  a.organism_type, a.organism_phone, a.organism_email, a.organism_website,
  a.has_accessibility, a.created_at, a.updated_at;

-- Commentaire pour documentation
COMMENT ON VIEW public.activities_with_sessions IS
'Vue enrichie des activités avec sessions agrégées et champs dénormalisés pour le front familles';

-- =====================================================
-- ÉTAPE 5: Permissions sur la vue
-- =====================================================

GRANT SELECT ON public.activities_with_sessions TO authenticated;
GRANT SELECT ON public.activities_with_sessions TO anon;
