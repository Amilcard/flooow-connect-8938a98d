-- ============================================================
-- SECURITY STEP 2: Secure user tables with RLS + policies
-- Tables: profiles, children, reviews, financial_aids
-- ============================================================

-- ============================================================
-- 1. PROFILES TABLE
-- User column: id (is the auth.uid() itself)
-- ============================================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Users can insert their own profile (on signup)
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Service role can do everything (for edge functions)
CREATE POLICY "profiles_service_role_all"
  ON public.profiles
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================
-- 2. CHILDREN TABLE
-- User column: family_id (references profiles.id)
-- ============================================================

-- Enable RLS
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own children
CREATE POLICY "children_select_own"
  ON public.children
  FOR SELECT
  USING (auth.uid() = family_id);

-- Policy: Users can insert children for their family
CREATE POLICY "children_insert_own"
  ON public.children
  FOR INSERT
  WITH CHECK (auth.uid() = family_id);

-- Policy: Users can update their own children
CREATE POLICY "children_update_own"
  ON public.children
  FOR UPDATE
  USING (auth.uid() = family_id)
  WITH CHECK (auth.uid() = family_id);

-- Policy: Users can delete their own children
CREATE POLICY "children_delete_own"
  ON public.children
  FOR DELETE
  USING (auth.uid() = family_id);

-- Policy: Service role can do everything (for edge functions)
CREATE POLICY "children_service_role_all"
  ON public.children
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================
-- 3. REVIEWS TABLE
-- User column: family_id (references profiles.id)
-- ============================================================

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read published/verified reviews
CREATE POLICY "reviews_select_verified"
  ON public.reviews
  FOR SELECT
  USING (is_verified = true);

-- Policy: Users can read their own reviews (even if not verified)
CREATE POLICY "reviews_select_own"
  ON public.reviews
  FOR SELECT
  USING (auth.uid() = family_id);

-- Policy: Users can insert reviews for their family
CREATE POLICY "reviews_insert_own"
  ON public.reviews
  FOR INSERT
  WITH CHECK (auth.uid() = family_id);

-- Policy: Users can update their own reviews
CREATE POLICY "reviews_update_own"
  ON public.reviews
  FOR UPDATE
  USING (auth.uid() = family_id)
  WITH CHECK (auth.uid() = family_id);

-- Policy: Users can delete their own reviews
CREATE POLICY "reviews_delete_own"
  ON public.reviews
  FOR DELETE
  USING (auth.uid() = family_id);

-- Policy: Service role can do everything (for edge functions)
CREATE POLICY "reviews_service_role_all"
  ON public.reviews
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================
-- 4. FINANCIAL_AIDS TABLE
-- This is reference data - no user column
-- Should be readable by all authenticated users
-- ============================================================

-- Enable RLS
ALTER TABLE public.financial_aids ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read all financial aids
CREATE POLICY "financial_aids_select_authenticated"
  ON public.financial_aids
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Service role can do everything (for admin operations)
CREATE POLICY "financial_aids_service_role_all"
  ON public.financial_aids
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================
-- VERIFICATION QUERIES:
-- ============================================================
-- Check RLS status:
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- AND tablename IN ('profiles', 'children', 'reviews', 'financial_aids');

-- Check policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- AND tablename IN ('profiles', 'children', 'reviews', 'financial_aids');

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
