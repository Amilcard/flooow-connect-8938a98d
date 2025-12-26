-- ============================================================
-- SECURITY STEP 5: Fix remaining RLS Disabled tables
-- Applied: 2024-12-24
-- ============================================================

-- 1. NOTIFICATIONS (user owns via profile_id)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_service_role" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (auth.uid() = profile_id);
CREATE POLICY "notifications_delete_own" ON public.notifications FOR DELETE USING (auth.uid() = profile_id);
CREATE POLICY "notifications_service_role" ON public.notifications FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 2. ACTIVITY_MEDIA (catalogue public - SELECT only)
ALTER TABLE public.activity_media ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "activity_media_select_public" ON public.activity_media;
DROP POLICY IF EXISTS "activity_media_service_role" ON public.activity_media;
CREATE POLICY "activity_media_select_public" ON public.activity_media FOR SELECT USING (true);
CREATE POLICY "activity_media_service_role" ON public.activity_media FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 3. TRANSPORT_STATIONS (catalogue public - SELECT only)
ALTER TABLE public.transport_stations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "transport_stations_select_public" ON public.transport_stations;
DROP POLICY IF EXISTS "transport_stations_service_role" ON public.transport_stations;
CREATE POLICY "transport_stations_select_public" ON public.transport_stations FOR SELECT USING (true);
CREATE POLICY "transport_stations_service_role" ON public.transport_stations FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 4. EVENTS (logging - authenticated can INSERT)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "events_insert_authenticated" ON public.events;
DROP POLICY IF EXISTS "events_service_role" ON public.events;
CREATE POLICY "events_insert_authenticated" ON public.events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "events_service_role" ON public.events FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 5. FAMILIES (user owns via profile_id or user_id)
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "families_select_own" ON public.families;
DROP POLICY IF EXISTS "families_insert_own" ON public.families;
DROP POLICY IF EXISTS "families_update_own" ON public.families;
DROP POLICY IF EXISTS "families_delete_own" ON public.families;
DROP POLICY IF EXISTS "families_service_role" ON public.families;
CREATE POLICY "families_select_own" ON public.families FOR SELECT USING (profile_id = auth.uid() OR user_id = auth.uid());
CREATE POLICY "families_insert_own" ON public.families FOR INSERT WITH CHECK (profile_id = auth.uid() OR user_id = auth.uid());
CREATE POLICY "families_update_own" ON public.families FOR UPDATE USING (profile_id = auth.uid() OR user_id = auth.uid()) WITH CHECK (profile_id = auth.uid() OR user_id = auth.uid());
CREATE POLICY "families_delete_own" ON public.families FOR DELETE USING (profile_id = auth.uid() OR user_id = auth.uid());
CREATE POLICY "families_service_role" ON public.families FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================
-- ROLLBACK (if needed)
-- ============================================================
-- DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
-- DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
-- DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;
-- DROP POLICY IF EXISTS "notifications_service_role" ON public.notifications;
-- ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
-- (repeat for each table)
