-- ============================================================
-- AUDIT SQL QUERIES (Read-Only)
-- Execute in Supabase SQL Editor to get current status
-- ============================================================

-- 1) RLS status on public schema
SELECT schemaname, tablename, rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2) Existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3) GRANTs visible (focus anon/authenticated/service_role)
SELECT table_schema, table_name, grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
AND grantee IN ('anon', 'authenticated', 'service_role')
ORDER BY table_name, grantee, privilege_type;

-- 4) Effective privileges check
SELECT
  c.relname AS table_name,
  r.rolname AS role,
  has_table_privilege(r.rolname, format('%I.%I', 'public', c.relname), 'select') AS can_select,
  has_table_privilege(r.rolname, format('%I.%I', 'public', c.relname), 'insert') AS can_insert,
  has_table_privilege(r.rolname, format('%I.%I', 'public', c.relname), 'update') AS can_update,
  has_table_privilege(r.rolname, format('%I.%I', 'public', c.relname), 'delete') AS can_delete
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
CROSS JOIN (SELECT unnest(array['anon', 'authenticated', 'service_role']) AS rolname) r
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY c.relname, r.rolname;

-- 5) Views definition + options
SELECT
  c.relname AS view_name,
  pg_get_viewdef(c.oid, true) AS view_def
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
AND c.relkind = 'v'
AND c.relname IN ('activities_with_age_groups', 'vw_fratrie_groups', 'vw_inscriptions_stats', 'vw_enfants_infos_sante');

-- 6) View/table owner (for security definer diagnostic)
SELECT
  c.relname,
  c.relkind,
  pg_get_userbyid(c.relowner) AS owner
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
AND c.relname IN ('activities_with_age_groups', 'vw_fratrie_groups', 'vw_inscriptions_stats', 'vw_enfants_infos_sante');
