-- Migration: Add image_url and images columns to activities_with_sessions view
-- Date: 2024-12-10
-- Purpose: Enable front-end to display real images from Supabase instead of fallback images

-- Step 1: Ensure image_url column exists on activities table
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Step 2: Drop and recreate the view with image columns
-- NOTE: You need to run this in Supabase SQL Editor because the view definition
-- may vary. Below is a template that adds image_url and images to the existing view.

-- First, get the current view definition by running:
-- SELECT pg_get_viewdef('activities_with_sessions', true);

-- Then recreate the view by adding these columns to the SELECT clause:
-- a.image_url,
-- a.images,

-- Example template (adjust based on your actual view definition):
/*
DROP VIEW IF EXISTS activities_with_sessions;

CREATE OR REPLACE VIEW activities_with_sessions AS
SELECT
    a.id,
    a.title,
    a.description,
    a.categories,
    a.age_min,
    a.age_max,
    a.price_base,
    a.accepts_aid_types,
    a.tags,
    a.period_type,
    a.vacation_periods,
    a.address,
    a.city,
    a.postal_code,
    a.latitude,
    a.longitude,
    a.date_debut,
    a.date_fin,
    a.jours_horaires,
    a.price_unit,
    a.is_published,
    a.image_url,           -- NEW: Single image URL
    a.images,              -- NEW: Array of image URLs
    -- Add all other existing columns from your current view...
    o.name as organism_name,
    o.type as organism_type,
    o.address as organism_address,
    o.phone as organism_phone,
    o.email as organism_email,
    o.website as organism_website,
    -- Session aggregation
    COALESCE(
        jsonb_agg(
            DISTINCT jsonb_build_object(
                'id', s.id,
                'age_min', s.age_min,
                'age_max', s.age_max,
                'day_of_week', s.day_of_week,
                'start_time', s.start_time,
                'end_time', s.end_time
            )
        ) FILTER (WHERE s.id IS NOT NULL),
        '[]'::jsonb
    ) as sessions_json,
    MIN(s.age_min) as session_age_min,
    MAX(s.age_max) as session_age_max
FROM activities a
LEFT JOIN organisms o ON a.organism_id = o.id
LEFT JOIN activity_sessions s ON s.activity_id = a.id
GROUP BY
    a.id, a.title, a.description, a.categories, a.age_min, a.age_max,
    a.price_base, a.accepts_aid_types, a.tags, a.period_type,
    a.vacation_periods, a.address, a.city, a.postal_code,
    a.latitude, a.longitude, a.date_debut, a.date_fin,
    a.jours_horaires, a.price_unit, a.is_published,
    a.image_url, a.images,  -- NEW: Include in GROUP BY
    o.name, o.type, o.address, o.phone, o.email, o.website;
*/

-- IMPORTANT:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. First run: SELECT pg_get_viewdef('activities_with_sessions', true);
-- 3. Copy the result and add: a.image_url, a.images to the SELECT and GROUP BY
-- 4. Run the modified CREATE OR REPLACE VIEW statement
