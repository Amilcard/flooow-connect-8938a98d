-- =========================================================
-- MIGRATION: Sécurisation des vues avec security_invoker
-- =========================================================
-- Cette migration résout les problèmes de sécurité suivants:
-- 1. Vues sans RLS (MISSING_RLS)
-- 2. Vues avec SECURITY DEFINER (SUPA_security_definer_view)
--
-- Solution: Recréer toutes les vues avec security_invoker = true
-- Cela fait que les vues utilisent les permissions de l'utilisateur
-- qui les interroge, héritant ainsi des RLS policies des tables sous-jacentes.
-- =========================================================

-- 1. Vue event_stats
-- Agrège les statistiques d'inscription aux événements
DROP VIEW IF EXISTS public.event_stats CASCADE;
CREATE VIEW public.event_stats
WITH (security_invoker = true)
AS
SELECT 
  te.id AS event_id,
  te.title,
  te.start_date,
  count(DISTINCT er.user_id) FILTER (WHERE (er.status = ANY (ARRAY['interested'::text, 'going'::text]))) AS participants_count,
  count(DISTINCT er.user_id) FILTER (WHERE (er.status = 'going'::text)) AS confirmed_count,
  count(DISTINCT er.user_id) FILTER (WHERE (er.status = 'interested'::text)) AS interested_count
FROM territory_events te
LEFT JOIN event_registrations er ON (te.id = er.event_id)
GROUP BY te.id, te.title, te.start_date;

COMMENT ON VIEW public.event_stats IS 'Vue sécurisée avec security_invoker - hérite des RLS policies de territory_events et event_registrations';

-- 2. Vue territory_user_stats
-- Statistiques démographiques par territoire (sensible - admins seulement)
DROP VIEW IF EXISTS public.territory_user_stats CASCADE;
CREATE VIEW public.territory_user_stats
WITH (security_invoker = true)
AS
SELECT 
  territory_id,
  count(*) AS total_users,
  count(CASE WHEN (quotient_familial < 500) THEN 1 END) AS low_income_count,
  count(CASE WHEN (quotient_familial >= 500 AND quotient_familial <= 1000) THEN 1 END) AS medium_income_count,
  count(CASE WHEN (quotient_familial > 1000) THEN 1 END) AS high_income_count,
  avg(quotient_familial) AS avg_quotient_familial,
  count(CASE WHEN (marital_status = 'married') THEN 1 END) AS married_count,
  count(CASE WHEN (marital_status = 'single') THEN 1 END) AS single_count,
  count(CASE WHEN (marital_status = 'divorced') THEN 1 END) AS divorced_count,
  count(CASE WHEN (marital_status = 'widowed') THEN 1 END) AS widowed_count,
  array_agg(DISTINCT left(postal_code, 2)) FILTER (WHERE (postal_code IS NOT NULL)) AS postal_code_prefixes
FROM profiles
WHERE territory_id IS NOT NULL
GROUP BY territory_id;

COMMENT ON VIEW public.territory_user_stats IS 'Vue sécurisée avec security_invoker - hérite des RLS policies de profiles (admins uniquement)';

-- 3. Vue v_children_with_age
-- Enfants avec âges calculés
DROP VIEW IF EXISTS public.v_children_with_age CASCADE;
CREATE VIEW public.v_children_with_age
WITH (security_invoker = true)
AS
SELECT 
  id,
  user_id,
  first_name,
  dob,
  needs_json,
  accessibility_flags,
  created_at,
  updated_at,
  is_student,
  education_level,
  school_postal_code,
  get_child_age(dob) AS age,
  CASE
    WHEN ((get_child_age(dob) >= 11) AND (is_student IS NULL)) THEN 'Précisez si scolarisé pour voir aides supplémentaires'
    ELSE NULL
  END AS student_status_hint
FROM children;

COMMENT ON VIEW public.v_children_with_age IS 'Vue sécurisée avec security_invoker - hérite des RLS policies de children';

-- 4. Vue v_non_recours_financier
-- Statistiques de non-recours aux aides financières
DROP VIEW IF EXISTS public.v_non_recours_financier CASCADE;
CREATE VIEW public.v_non_recours_financier
WITH (security_invoker = true)
AS
SELECT 
  count(DISTINCT p.id) FILTER (WHERE (p.price_blocked = true)) AS familles_bloquees,
  count(DISTINCT b.id) FILTER (WHERE (b.abandon_raison_financiere = true)) AS reservations_abandonnees_prix,
  count(DISTINCT b.id) FILTER (WHERE (b.reste_a_charge > 100)) AS reservations_rac_eleve,
  avg(b.reste_a_charge) FILTER (WHERE (b.reste_a_charge IS NOT NULL)) AS rac_moyen,
  percentile_cont(0.5) WITHIN GROUP (ORDER BY p.seuil_prix_max) AS seuil_prix_median
FROM profiles p
LEFT JOIN bookings b ON (b.user_id = p.id);

COMMENT ON VIEW public.v_non_recours_financier IS 'Vue sécurisée avec security_invoker - hérite des RLS policies de profiles et bookings';

-- 5. Vue v_profile_completion
-- Statut de complétion des profils utilisateur
DROP VIEW IF EXISTS public.v_profile_completion CASCADE;
CREATE VIEW public.v_profile_completion
WITH (security_invoker = true)
AS
SELECT 
  p.id,
  p.email,
  (p.postal_code IS NOT NULL) AS has_postal_code,
  (p.quotient_familial IS NOT NULL) AS has_qf,
  (p.marital_status IS NOT NULL) AS has_marital_status,
  (p.territory_id IS NOT NULL) AS has_territory,
  (count(c.id) > 0) AS has_children,
  CASE
    WHEN (p.postal_code IS NULL) THEN 'incomplete'
    WHEN (p.quotient_familial IS NULL) THEN 'partial'
    WHEN (count(c.id) = 0) THEN 'partial'
    ELSE 'complete'
  END AS completion_status,
  CASE
    WHEN (p.postal_code IS NULL) THEN 'Ajoutez votre code postal'
    WHEN (p.quotient_familial IS NULL) THEN 'Renseignez votre quotient familial pour voir les aides'
    WHEN (count(c.id) = 0) THEN 'Ajoutez au moins un enfant'
    ELSE 'Profil complet'
  END AS completion_message
FROM profiles p
LEFT JOIN children c ON (c.user_id = p.id)
GROUP BY p.id, p.email, p.postal_code, p.quotient_familial, p.marital_status, p.territory_id;

COMMENT ON VIEW public.v_profile_completion IS 'Vue sécurisée avec security_invoker - hérite des RLS policies de profiles et children';

-- 6. Vue v_qpv_stats
-- Statistiques sur les quartiers prioritaires
DROP VIEW IF EXISTS public.v_qpv_stats CASCADE;
CREATE VIEW public.v_qpv_stats
WITH (security_invoker = true)
AS
SELECT 
  count(DISTINCT p.id) AS total_profiles,
  count(DISTINCT p.id) FILTER (WHERE is_profile_in_qpv(p.id)) AS qpv_profiles,
  CASE 
    WHEN count(DISTINCT p.id) > 0 THEN 
      round((count(DISTINCT p.id) FILTER (WHERE is_profile_in_qpv(p.id))::numeric / count(DISTINCT p.id)::numeric * 100), 2)
    ELSE 0
  END AS qpv_percentage
FROM profiles p;

COMMENT ON VIEW public.v_qpv_stats IS 'Vue sécurisée avec security_invoker - hérite des RLS policies de profiles';

-- 7. Vue vw_alternative_slots
-- Créneaux alternatifs disponibles pour les activités
DROP VIEW IF EXISTS public.vw_alternative_slots CASCADE;
CREATE VIEW public.vw_alternative_slots
WITH (security_invoker = true)
AS
SELECT 
  s.id AS slot_id,
  s.activity_id,
  s.start,
  s.end,
  s.seats_remaining,
  s.seats_total,
  a.age_min,
  a.age_max,
  a.price_base,
  a.title AS activity_title,
  a.category,
  a.period_type,
  st.name AS structure_name,
  st.address AS structure_address
FROM availability_slots s
JOIN activities a ON (s.activity_id = a.id)
JOIN structures st ON (a.structure_id = st.id)
WHERE s.seats_remaining > 0
  AND s.start > now();

COMMENT ON VIEW public.vw_alternative_slots IS 'Vue sécurisée avec security_invoker - hérite des RLS policies de availability_slots, activities, structures';

-- =========================================================
-- VÉRIFICATION: Les tables sous-jacentes ont bien des RLS
-- =========================================================
-- Cette section vérifie que les tables utilisées par les vues
-- ont bien des politiques RLS actives.

DO $$
DECLARE
  tables_without_rls TEXT[];
BEGIN
  -- Vérifier que RLS est activé sur les tables critiques
  SELECT array_agg(tablename)
  INTO tables_without_rls
  FROM pg_tables t
  WHERE schemaname = 'public'
    AND tablename IN (
      'profiles', 
      'children', 
      'bookings', 
      'activities', 
      'structures', 
      'availability_slots',
      'territory_events',
      'event_registrations'
    )
    AND NOT EXISTS (
      SELECT 1 
      FROM pg_class c
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE n.nspname = 'public'
        AND c.relname = t.tablename
        AND c.relrowsecurity = true
    );
  
  IF array_length(tables_without_rls, 1) > 0 THEN
    RAISE WARNING 'Les tables suivantes n''ont pas RLS activé: %', array_to_string(tables_without_rls, ', ');
  ELSE
    RAISE NOTICE '✓ Toutes les tables critiques ont RLS activé';
  END IF;
END $$;