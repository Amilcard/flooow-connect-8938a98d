-- ============================================================
-- SECURITY STEP 1: Lock unused tables (RLS enabled, no policies)
-- Tables: reservations, collectivities, financial_partners, registrations, payments, favorites
-- Effect: Deny all access by default (no policies = deny)
-- Rollback: See rollback script below
-- ============================================================

-- 1. reservations (not used - MesReservations uses mock data)
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- 2. collectivities (types exist but no frontend calls)
ALTER TABLE public.collectivities ENABLE ROW LEVEL SECURITY;

-- 3. financial_partners (types exist but no frontend calls)
ALTER TABLE public.financial_partners ENABLE ROW LEVEL SECURITY;

-- 4. registrations (types exist but no frontend calls)
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- 5. payments (types exist but no frontend calls)
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 6. favorites (not used - favorite_events is used instead)
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- VERIFICATION: Check RLS is enabled
-- ============================================================
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- AND tablename IN ('reservations', 'collectivities', 'financial_partners', 'registrations', 'payments', 'favorites');

-- ============================================================
-- ROLLBACK SCRIPT (if needed):
-- ============================================================
-- ALTER TABLE public.reservations DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.collectivities DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.financial_partners DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.registrations DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.favorites DISABLE ROW LEVEL SECURITY;
