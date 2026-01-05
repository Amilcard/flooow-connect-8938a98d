-- Migration to fix RLS policies that use wrong column name 'published' instead of 'is_published'
-- This fixes the P0 regression where activities fail to load due to RLS policy evaluation error

-- ============================================
-- FIX ACTIVITIES RLS POLICIES
-- ============================================

-- Drop existing policies with wrong column name
DROP POLICY IF EXISTS "Activities visible to everyone" ON public.activities;
DROP POLICY IF EXISTS "Activities visible to anonymous users" ON public.activities;
DROP POLICY IF EXISTS "Activities are viewable by everyone" ON public.activities;

-- Recreate policies with correct column name (is_published)
CREATE POLICY "Activities visible to everyone"
ON public.activities
FOR SELECT
USING (is_published = true);

CREATE POLICY "Activities visible to anonymous users"
ON public.activities
FOR SELECT TO anon
USING (is_published = true);

-- ============================================
-- FIX TERRITORY_EVENTS RLS POLICIES (if table exists)
-- Note: territory_events may have a 'published' column - check before changing
-- ============================================

-- Only fix if the table has is_published column, otherwise leave as is
DO $$
BEGIN
  -- Check if territory_events exists and has is_published column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'territory_events'
    AND column_name = 'is_published'
  ) THEN
    -- Drop and recreate with correct column
    DROP POLICY IF EXISTS "Published events visible to all" ON public.territory_events;
    DROP POLICY IF EXISTS "Territory events visible to authenticated users" ON public.territory_events;
    DROP POLICY IF EXISTS "Territory events visible to anonymous users" ON public.territory_events;
    DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.territory_events;

    EXECUTE 'CREATE POLICY "Published events visible to all"
      ON public.territory_events
      FOR SELECT
      USING (is_published = true)';

    EXECUTE 'CREATE POLICY "Territory events visible to anonymous users"
      ON public.territory_events
      FOR SELECT TO anon
      USING (is_published = true)';
  END IF;
END $$;

-- ============================================
-- VERIFICATION COMMENT
-- ============================================
COMMENT ON POLICY "Activities visible to everyone" ON public.activities IS
  'Fixed: Uses is_published instead of published to match actual column name';
