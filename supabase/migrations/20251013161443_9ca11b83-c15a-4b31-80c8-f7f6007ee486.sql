-- ============================================================
-- Migration: Enhanced city_insee implementation
-- Date: 2025-10-13
-- Purpose: Add city_insee with robust data cleaning + territorial index
-- ============================================================

-- Add city_insee column if not exists
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS city_insee CHAR(5);

-- Extract and clean INSEE code from profile_json->>'city_code'
-- REGEXP_REPLACE removes non-digits, LEFT takes first 5 chars
UPDATE public.profiles
SET city_insee = LEFT(REGEXP_REPLACE(profile_json->>'city_code', '[^0-9]', '', 'g'), 5)
WHERE (profile_json->>'city_code') IS NOT NULL
  AND (city_insee IS NULL OR city_insee = '');

-- Add constraint: must be 5 digits or NULL
ALTER TABLE public.profiles
  ADD CONSTRAINT chk_city_insee_format 
  CHECK (city_insee ~ '^[0-9]{5}$' OR city_insee IS NULL);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_city_insee ON public.profiles(city_insee);
CREATE INDEX IF NOT EXISTS idx_profiles_territory ON public.profiles(territory_id);

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.city_insee IS 'Normalized 5-digit INSEE commune code for territorial analytics (extracted from profile_json->city_code)';