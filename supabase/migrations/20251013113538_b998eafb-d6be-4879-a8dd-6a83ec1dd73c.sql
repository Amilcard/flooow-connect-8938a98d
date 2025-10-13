
-- Fix RLS: Allow anonymous users to view published activities
DROP POLICY IF EXISTS "Activities visible to all authenticated users" ON activities;

CREATE POLICY "Activities visible to everyone" 
ON activities 
FOR SELECT 
USING (published = true);

-- Also fix structures visibility
DROP POLICY IF EXISTS "Structures visible to all authenticated users" ON structures;

CREATE POLICY "Structures visible to everyone"
ON structures
FOR SELECT
USING (true);
