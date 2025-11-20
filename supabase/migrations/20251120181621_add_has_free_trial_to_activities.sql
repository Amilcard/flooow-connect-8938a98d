-- Migration: Add has_free_trial column to activities table
-- Description: This column indicates if an activity offers a free trial/initiation session
-- Date: 2025-11-20

-- Add the column
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS has_free_trial BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN activities.has_free_trial IS 
'Indicates if the activity offers a free trial/initiation session (séance d''essai gratuite)';

-- Optional: Set has_free_trial to true for activities that are currently marked as free
-- (You may want to adjust this logic based on your business rules)
-- UPDATE activities 
-- SET has_free_trial = true 
-- WHERE price_base = 0 AND <additional conditions>;

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_activities_has_free_trial 
ON activities(has_free_trial) 
WHERE has_free_trial = true;
