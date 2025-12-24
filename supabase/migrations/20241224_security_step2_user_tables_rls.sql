-- ============================================================
-- SECURITY STEP 2: Secure user tables with RLS + policies
-- Tables: profiles, children, reviews, financial_aids
-- UPDATED: children/reviews use families.profile_id lookup
-- ============================================================

-- ============================================================
-- 1. PROFILES TABLE
-- User column: id (is the auth.uid() itself)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_service_role_all" ON public.profiles;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_service_role_all" ON public.profiles FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================
-- 2. CHILDREN TABLE
-- User column: family_id -> families.profile_id/user_id
-- IMPORTANT: children.family_id references families.id (NOT profiles.id)
-- ============================================================

ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "children_select_own" ON public.children;
DROP POLICY IF EXISTS "children_insert_own" ON public.children;
DROP POLICY IF EXISTS "children_update_own" ON public.children;
DROP POLICY IF EXISTS "children_delete_own" ON public.children;
DROP POLICY IF EXISTS "children_service_role_all" ON public.children;

CREATE POLICY "children_select_own" ON public.children FOR SELECT
USING (family_id IN (SELECT id FROM public.families WHERE profile_id = auth.uid() OR user_id = auth.uid()));

CREATE POLICY "children_insert_own" ON public.children FOR INSERT
WITH CHECK (family_id IN (SELECT id FROM public.families WHERE profile_id = auth.uid() OR user_id = auth.uid()));

CREATE POLICY "children_update_own" ON public.children FOR UPDATE
USING (family_id IN (SELECT id FROM public.families WHERE profile_id = auth.uid() OR user_id = auth.uid()))
WITH CHECK (family_id IN (SELECT id FROM public.families WHERE profile_id = auth.uid() OR user_id = auth.uid()));

CREATE POLICY "children_delete_own" ON public.children FOR DELETE
USING (family_id IN (SELECT id FROM public.families WHERE profile_id = auth.uid() OR user_id = auth.uid()));

CREATE POLICY "children_service_role_all" ON public.children FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================
-- 3. REVIEWS TABLE
-- User column: family_id -> families.profile_id/user_id
-- IMPORTANT: reviews.family_id references families.id (NOT profiles.id)
-- ============================================================

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_select_verified" ON public.reviews;
DROP POLICY IF EXISTS "reviews_select_own" ON public.reviews;
DROP POLICY IF EXISTS "reviews_insert_own" ON public.reviews;
DROP POLICY IF EXISTS "reviews_update_own" ON public.reviews;
DROP POLICY IF EXISTS "reviews_delete_own" ON public.reviews;
DROP POLICY IF EXISTS "reviews_service_role_all" ON public.reviews;

CREATE POLICY "reviews_select_verified" ON public.reviews FOR SELECT USING (is_verified = true);

CREATE POLICY "reviews_select_own" ON public.reviews FOR SELECT
USING (family_id IN (SELECT id FROM public.families WHERE profile_id = auth.uid() OR user_id = auth.uid()));

CREATE POLICY "reviews_insert_own" ON public.reviews FOR INSERT
WITH CHECK (family_id IN (SELECT id FROM public.families WHERE profile_id = auth.uid() OR user_id = auth.uid()));

CREATE POLICY "reviews_update_own" ON public.reviews FOR UPDATE
USING (family_id IN (SELECT id FROM public.families WHERE profile_id = auth.uid() OR user_id = auth.uid()))
WITH CHECK (family_id IN (SELECT id FROM public.families WHERE profile_id = auth.uid() OR user_id = auth.uid()));

CREATE POLICY "reviews_delete_own" ON public.reviews FOR DELETE
USING (family_id IN (SELECT id FROM public.families WHERE profile_id = auth.uid() OR user_id = auth.uid()));

CREATE POLICY "reviews_service_role_all" ON public.reviews FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================
-- 4. FINANCIAL_AIDS TABLE
-- Reference data - readable by all authenticated users
-- ============================================================

ALTER TABLE public.financial_aids ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "financial_aids_select_authenticated" ON public.financial_aids;
DROP POLICY IF EXISTS "financial_aids_service_role_all" ON public.financial_aids;

CREATE POLICY "financial_aids_select_authenticated" ON public.financial_aids FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "financial_aids_service_role_all" ON public.financial_aids FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================
-- ROLLBACK SCRIPT (if needed):
-- ============================================================
-- DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
-- DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
-- DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
-- DROP POLICY IF EXISTS "profiles_service_role_all" ON public.profiles;
-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- DROP POLICY IF EXISTS "children_select_own" ON public.children;
-- DROP POLICY IF EXISTS "children_insert_own" ON public.children;
-- DROP POLICY IF EXISTS "children_update_own" ON public.children;
-- DROP POLICY IF EXISTS "children_delete_own" ON public.children;
-- DROP POLICY IF EXISTS "children_service_role_all" ON public.children;
-- ALTER TABLE public.children DISABLE ROW LEVEL SECURITY;

-- DROP POLICY IF EXISTS "reviews_select_verified" ON public.reviews;
-- DROP POLICY IF EXISTS "reviews_select_own" ON public.reviews;
-- DROP POLICY IF EXISTS "reviews_insert_own" ON public.reviews;
-- DROP POLICY IF EXISTS "reviews_update_own" ON public.reviews;
-- DROP POLICY IF EXISTS "reviews_delete_own" ON public.reviews;
-- DROP POLICY IF EXISTS "reviews_service_role_all" ON public.reviews;
-- ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;

-- DROP POLICY IF EXISTS "financial_aids_select_authenticated" ON public.financial_aids;
-- DROP POLICY IF EXISTS "financial_aids_service_role_all" ON public.financial_aids;
-- ALTER TABLE public.financial_aids DISABLE ROW LEVEL SECURITY;
