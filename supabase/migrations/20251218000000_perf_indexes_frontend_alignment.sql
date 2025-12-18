-- ============================================================
-- Migration: Optimisations Performance pour Alignement Frontend
-- Date: 2025-12-18
-- Objectif: Créer les indexes manquants pour les requêtes frontend fréquentes
-- ============================================================

-- =====================================================
-- ÉTAPE 1: Indexes pour requêtes Home Page
-- (filtres fréquents: price_base, period_type, categories)
-- =====================================================

-- Index composite pour les filtres les plus utilisés sur la home
CREATE INDEX IF NOT EXISTS idx_activities_home_filters
ON public.activities(is_published, period_type, price_base)
WHERE is_published = TRUE;

-- Index pour recherche texte (title + description)
CREATE INDEX IF NOT EXISTS idx_activities_title_trgm
ON public.activities USING GIN(title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_activities_description_trgm
ON public.activities USING GIN(description gin_trgm_ops);

-- Index pour filtre âge (range queries)
CREATE INDEX IF NOT EXISTS idx_activities_age_range
ON public.activities(age_min, age_max)
WHERE is_published = TRUE;

-- =====================================================
-- ÉTAPE 2: Indexes pour availability_slots (sessions)
-- =====================================================

-- Index pour jointure activité + dates
CREATE INDEX IF NOT EXISTS idx_slots_activity_dates
ON public.availability_slots(activity_id, start, "end");

-- Index pour places disponibles (filtre fréquent)
CREATE INDEX IF NOT EXISTS idx_slots_seats_remaining
ON public.availability_slots(activity_id, seats_remaining)
WHERE seats_remaining > 0;

-- =====================================================
-- ÉTAPE 3: Indexes pour bookings (réservations)
-- =====================================================

-- Index pour dashboard utilisateur
CREATE INDEX IF NOT EXISTS idx_bookings_user_status
ON public.bookings(user_id, status, created_at DESC);

-- Index pour dashboard structure
CREATE INDEX IF NOT EXISTS idx_bookings_activity_status
ON public.bookings(activity_id, status, created_at DESC);

-- =====================================================
-- ÉTAPE 4: Indexes pour financial_aids (aides)
-- =====================================================

-- Index composite pour calculate_eligible_aids RPC
CREATE INDEX IF NOT EXISTS idx_financial_aids_eligibility
ON public.financial_aids(active, age_min, age_max, qf_max)
WHERE active = TRUE;

-- Index GIN pour territory_codes (array)
CREATE INDEX IF NOT EXISTS idx_financial_aids_territories
ON public.financial_aids USING GIN(territory_codes);

-- Index GIN pour categories (array)
CREATE INDEX IF NOT EXISTS idx_financial_aids_categories
ON public.financial_aids USING GIN(categories);

-- =====================================================
-- ÉTAPE 5: Vue matérialisée pour Home Page (cache 5min)
-- =====================================================

-- Drop existing view if exists
DROP MATERIALIZED VIEW IF EXISTS public.mv_home_activities;

-- Vue matérialisée pour les activités publiées avec sessions
CREATE MATERIALIZED VIEW public.mv_home_activities AS
SELECT
  a.id,
  a.title,
  a.description,
  a.categories,
  a.categories[1] AS category,
  a.age_min,
  a.age_max,
  a.price_base,
  a.price_unit,
  a.period_type,
  a.vacation_periods,
  a.vacation_type,
  a.city,
  a.postal_code,
  a.latitude,
  a.longitude,
  a.image_url,
  a.has_accessibility,
  a.accepts_aid_types,
  a.mobility_tc,
  a.mobility_velo,
  a.mobility_covoit,
  a.organism_name,
  -- Prochaine session disponible
  (
    SELECT jsonb_build_object(
      'start', MIN(s.start),
      'seats_remaining', SUM(s.seats_remaining)
    )
    FROM public.availability_slots s
    WHERE s.activity_id = a.id
      AND s.start > NOW()
      AND s.seats_remaining > 0
  ) AS next_session,
  -- Nombre total de places
  (
    SELECT COALESCE(SUM(s.seats_remaining), 0)
    FROM public.availability_slots s
    WHERE s.activity_id = a.id
      AND s.start > NOW()
  ) AS total_seats_available
FROM public.activities a
WHERE a.is_published = TRUE
ORDER BY a.created_at DESC;

-- Index sur la vue matérialisée
CREATE UNIQUE INDEX idx_mv_home_activities_id ON public.mv_home_activities(id);
CREATE INDEX idx_mv_home_activities_category ON public.mv_home_activities(category);
CREATE INDEX idx_mv_home_activities_price ON public.mv_home_activities(price_base);
CREATE INDEX idx_mv_home_activities_city ON public.mv_home_activities(city);

-- Fonction pour rafraîchir la vue (à appeler via cron ou trigger)
CREATE OR REPLACE FUNCTION public.refresh_home_activities()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_home_activities;
END;
$$;

-- Permissions
GRANT SELECT ON public.mv_home_activities TO authenticated;
GRANT SELECT ON public.mv_home_activities TO anon;

-- =====================================================
-- ÉTAPE 6: Optimisation calculate_eligible_aids
-- =====================================================

-- Remplacer la fonction pour utiliser les nouveaux indexes
CREATE OR REPLACE FUNCTION public.calculate_eligible_aids(
  p_age integer,
  p_qf integer,
  p_city_code text,
  p_activity_price numeric,
  p_duration_days integer,
  p_categories text[]
)
RETURNS TABLE(
  aid_name text,
  amount numeric,
  territory_level text,
  official_link text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_normalized_categories text[];
BEGIN
  -- Retourner vide si prix = 0
  IF p_activity_price <= 0 THEN
    RETURN;
  END IF;

  -- Normaliser les catégories
  SELECT array_agg(lower(cat)) INTO v_normalized_categories
  FROM unnest(p_categories) AS cat;

  -- Requête optimisée avec hint d'index
  RETURN QUERY
  SELECT
    fa.name::TEXT as aid_name,
    CASE
      WHEN fa.amount_type = 'fixed' THEN LEAST(fa.amount_value, p_activity_price)
      WHEN fa.amount_type = 'per_day' THEN LEAST(fa.amount_value * p_duration_days, p_activity_price)
      ELSE 0
    END as amount,
    fa.territory_level::TEXT,
    fa.official_link::TEXT
  FROM public.financial_aids fa
  WHERE fa.active = true
    AND p_age BETWEEN fa.age_min AND fa.age_max
    AND (fa.qf_max IS NULL OR p_qf <= fa.qf_max)
    AND (
      fa.territory_level = 'national'
      OR (fa.territory_level = 'region' AND '84' = ANY(fa.territory_codes))
      OR (fa.territory_level IN ('metropole', 'commune') AND p_city_code = ANY(fa.territory_codes))
    )
    AND fa.categories && v_normalized_categories
    AND fa.cumulative = true
  ORDER BY
    CASE fa.territory_level
      WHEN 'commune' THEN 1
      WHEN 'metropole' THEN 2
      WHEN 'region' THEN 4
      WHEN 'national' THEN 5
    END,
    amount DESC;
END;
$function$;

-- =====================================================
-- ÉTAPE 7: Trigger pour refresh automatique
-- =====================================================

-- Trigger après INSERT/UPDATE/DELETE sur activities
CREATE OR REPLACE FUNCTION public.trigger_refresh_home_activities()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Refresh asynchrone (ne bloque pas la transaction)
  PERFORM pg_notify('refresh_home_activities', '');
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_refresh_home_activities ON public.activities;
CREATE TRIGGER trg_refresh_home_activities
AFTER INSERT OR UPDATE OR DELETE ON public.activities
FOR EACH STATEMENT
EXECUTE FUNCTION public.trigger_refresh_home_activities();

-- =====================================================
-- ÉTAPE 8: Log de migration
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed: Performance indexes for frontend alignment';
  RAISE NOTICE '   - Created composite indexes for home page filters';
  RAISE NOTICE '   - Created trigram indexes for text search';
  RAISE NOTICE '   - Created materialized view mv_home_activities';
  RAISE NOTICE '   - Optimized calculate_eligible_aids function';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '   - Set up pg_cron to refresh mv_home_activities every 5 minutes';
  RAISE NOTICE '   - Update frontend to use mv_home_activities for home page';
END $$;
