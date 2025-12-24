-- ============================================================
-- SECURITY STEP 4: C1 Baseline - Lock Ultra-Sensitive Tables
-- Tables NOT used by frontend - safe to lock completely
-- ============================================================

-- 1. api_keys - API credentials (NEVER expose)
REVOKE ALL ON TABLE public.api_keys FROM anon, authenticated;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- 2. webhooks - Webhook configurations (admin only)
REVOKE ALL ON TABLE public.webhooks FROM anon, authenticated;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

-- 3. system_settings - System configuration (admin only)
REVOKE ALL ON TABLE public.system_settings FROM anon, authenticated;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- 4. audit_logs - Security audit trail (admin only)
REVOKE ALL ON TABLE public.audit_logs FROM anon, authenticated;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. white_labels - White label configurations (admin only)
REVOKE ALL ON TABLE public.white_labels FROM anon, authenticated;
ALTER TABLE public.white_labels ENABLE ROW LEVEL SECURITY;

-- 6. search_history - User search history (not used)
REVOKE ALL ON TABLE public.search_history FROM anon, authenticated;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- 7. messages - Internal messaging (not used)
REVOKE ALL ON TABLE public.messages FROM anon, authenticated;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 8. documents - Document storage (not used by frontend)
REVOKE ALL ON TABLE public.documents FROM anon, authenticated;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 9. mobility_choices - Mobility preferences (not used)
REVOKE ALL ON TABLE public.mobility_choices FROM anon, authenticated;
ALTER TABLE public.mobility_choices ENABLE ROW LEVEL SECURITY;

-- 10. organisms - Organization data (not directly queried)
REVOKE ALL ON TABLE public.organisms FROM anon, authenticated;
ALTER TABLE public.organisms ENABLE ROW LEVEL SECURITY;

-- 11. activity_media - Media files (not directly queried)
REVOKE ALL ON TABLE public.activity_media FROM anon, authenticated;
ALTER TABLE public.activity_media ENABLE ROW LEVEL SECURITY;

-- 12. activity_prices - Pricing data (not directly queried)
REVOKE ALL ON TABLE public.activity_prices FROM anon, authenticated;
ALTER TABLE public.activity_prices ENABLE ROW LEVEL SECURITY;

-- 13. activity_categories - Categories (not directly queried)
REVOKE ALL ON TABLE public.activity_categories FROM anon, authenticated;
ALTER TABLE public.activity_categories ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- VERIFICATION
-- ============================================================
-- Run this to verify RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables
-- WHERE schemaname = 'public'
-- AND tablename IN ('api_keys', 'webhooks', 'system_settings', 'audit_logs', 'white_labels', 'search_history', 'messages', 'documents', 'mobility_choices', 'organisms', 'activity_media', 'activity_prices', 'activity_categories');

-- ============================================================
-- ROLLBACK (if needed)
-- ============================================================
-- GRANT ALL ON TABLE public.api_keys TO anon, authenticated;
-- ALTER TABLE public.api_keys DISABLE ROW LEVEL SECURITY;
-- (repeat for each table)
