-- ============================================================
-- SECURITY STEP 3: Fix Security Definer Views
-- Views: activities_with_age_groups, vw_fratrie_groups, vw_inscriptions_stats, vw_enfants_infos_sante
-- Action: Set security_invoker = true (respects caller's RLS)
-- Note: These views are NOT directly called from frontend (only FK references)
-- ============================================================

-- ============================================================
-- 1. activities_with_age_groups
-- ============================================================
ALTER VIEW public.activities_with_age_groups SET (security_invoker = true);

-- ============================================================
-- 2. vw_fratrie_groups
-- ============================================================
ALTER VIEW public.vw_fratrie_groups SET (security_invoker = true);

-- ============================================================
-- 3. vw_inscriptions_stats
-- ============================================================
ALTER VIEW public.vw_inscriptions_stats SET (security_invoker = true);

-- ============================================================
-- 4. vw_enfants_infos_sante
-- ============================================================
ALTER VIEW public.vw_enfants_infos_sante SET (security_invoker = true);

-- ============================================================
-- VERIFICATION:
-- ============================================================
-- Check view security settings:
-- SELECT viewname, viewowner
-- FROM pg_views
-- WHERE schemaname = 'public'
-- AND viewname IN ('activities_with_age_groups', 'vw_fratrie_groups', 'vw_inscriptions_stats', 'vw_enfants_infos_sante');

-- Check security_invoker attribute:
-- SELECT n.nspname as schema, c.relname as view_name,
--        pg_catalog.obj_description(c.oid, 'pg_class') as description,
--        c.reloptions
-- FROM pg_class c
-- JOIN pg_namespace n ON n.oid = c.relnamespace
-- WHERE c.relkind = 'v'
-- AND n.nspname = 'public'
-- AND c.relname IN ('activities_with_age_groups', 'vw_fratrie_groups', 'vw_inscriptions_stats', 'vw_enfants_infos_sante');

-- ============================================================
-- ROLLBACK SCRIPT (if needed):
-- ============================================================
-- ALTER VIEW public.activities_with_age_groups SET (security_invoker = false);
-- ALTER VIEW public.vw_fratrie_groups SET (security_invoker = false);
-- ALTER VIEW public.vw_inscriptions_stats SET (security_invoker = false);
-- ALTER VIEW public.vw_enfants_infos_sante SET (security_invoker = false);

-- ============================================================
-- NOTE: If ALTER VIEW SET doesn't work on your Postgres version,
-- you'll need to recreate the views. Get definitions with:
-- SELECT pg_get_viewdef('public.activities_with_age_groups'::regclass, true);
-- Then: DROP VIEW ... ; CREATE VIEW ... WITH (security_invoker = true) AS ...
-- ============================================================
