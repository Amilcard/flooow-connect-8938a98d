-- Migration: Enable anonymous access to activities and events
-- This allows unauthenticated users to browse activities and events

-- Enable public SELECT on activities table
DROP POLICY IF EXISTS "Activities are viewable by everyone" ON public.activities;
CREATE POLICY "Activities are viewable by everyone"
ON public.activities
FOR SELECT
USING (published = true);

-- Enable public SELECT on territory_events table
DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.territory_events;
CREATE POLICY "Events are viewable by everyone"
ON public.territory_events
FOR SELECT
USING (published = true);

-- Enable public SELECT on availability_slots
DROP POLICY IF EXISTS "Slots are viewable by everyone" ON public.availability_slots;
CREATE POLICY "Slots are viewable by everyone"
ON public.availability_slots
FOR SELECT
USING (true);

-- Enable public SELECT on structures (for activity details)
DROP POLICY IF EXISTS "Structures are viewable by everyone" ON public.structures;
CREATE POLICY "Structures are viewable by everyone"
ON public.structures
FOR SELECT
USING (true);

-- Enable public SELECT on financial_aids
DROP POLICY IF EXISTS "Financial aids are viewable by everyone" ON public.financial_aids;
CREATE POLICY "Financial aids are viewable by everyone"
ON public.financial_aids
FOR SELECT
USING (active = true);