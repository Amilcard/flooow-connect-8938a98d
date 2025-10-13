-- ============================================================
-- Migration: Analytics Enhancement - 3 structural improvements
-- Date: 2025-10-13
-- Purpose: Add aid_simulations table, transport_meta, city_insee
-- ============================================================

-- 1. CREATE aid_simulations TABLE
-- Track all financial aid simulations for analytics
CREATE TABLE public.aid_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  
  -- Simulation inputs
  simulation_params JSONB NOT NULL DEFAULT '{}'::jsonb, -- {age, qf, city_code, price, duration_days, categories}
  
  -- Simulation results
  simulated_aids JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of eligible aids with amounts
  total_aid_amount DECIMAL(10,2) DEFAULT 0,
  final_price_after_aids DECIMAL(10,2) DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  converted_to_booking BOOLEAN DEFAULT false,
  ip_address INET,
  user_agent TEXT
);

-- Enable RLS on aid_simulations
ALTER TABLE public.aid_simulations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for aid_simulations
CREATE POLICY "users_view_own_simulations"
ON public.aid_simulations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "users_create_simulations"
ON public.aid_simulations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admins_view_all_simulations"
ON public.aid_simulations
FOR SELECT
USING (
  has_role(auth.uid(), 'superadmin') OR 
  has_role(auth.uid(), 'territory_admin')
);

-- Indexes for performance
CREATE INDEX idx_aid_simulations_user_id ON public.aid_simulations(user_id);
CREATE INDEX idx_aid_simulations_activity_id ON public.aid_simulations(activity_id);
CREATE INDEX idx_aid_simulations_created_at ON public.aid_simulations(created_at DESC);
CREATE INDEX idx_aid_simulations_booking_id ON public.aid_simulations(booking_id) WHERE booking_id IS NOT NULL;

-- 2. ADD transport_meta TO activities
-- Structured transport metadata replacing loose JSONB
ALTER TABLE public.activities 
ADD COLUMN transport_meta JSONB DEFAULT jsonb_build_object(
  'covoiturage_enabled', false,
  'bus_stop_distance_m', null,
  'nearest_station_id', null,
  'accessibility_notes', null
);

-- Migrate existing covoiturage_enabled data
UPDATE public.activities 
SET transport_meta = jsonb_set(
  transport_meta,
  '{covoiturage_enabled}',
  to_jsonb(covoiturage_enabled)
);

-- Add index for transport queries
CREATE INDEX idx_activities_transport_meta ON public.activities USING GIN(transport_meta);

-- 3. ADD city_insee TO profiles
-- Normalized INSEE code (5 chars) replacing unstructured city_code
ALTER TABLE public.profiles 
ADD COLUMN city_insee CHAR(5);

-- Migrate existing city_code from profile_json
UPDATE public.profiles 
SET city_insee = LEFT(profile_json->>'city_code', 5)
WHERE profile_json->>'city_code' IS NOT NULL 
  AND LENGTH(profile_json->>'city_code') >= 5;

-- Add index for territorial queries
CREATE INDEX idx_profiles_city_insee ON public.profiles(city_insee) 
WHERE city_insee IS NOT NULL;

-- Add check constraint for INSEE format (5 digits)
ALTER TABLE public.profiles 
ADD CONSTRAINT check_city_insee_format 
CHECK (city_insee ~ '^[0-9]{5}$' OR city_insee IS NULL);

-- ============================================================
-- ANALYTICS HELPER VIEWS
-- ============================================================

-- View: Aid simulation conversion rate
CREATE OR REPLACE VIEW public.aid_simulation_analytics AS
SELECT 
  DATE_TRUNC('day', created_at) as simulation_date,
  COUNT(*) as total_simulations,
  COUNT(*) FILTER (WHERE converted_to_booking = true) as converted_simulations,
  ROUND(
    COUNT(*) FILTER (WHERE converted_to_booking = true)::numeric / 
    NULLIF(COUNT(*), 0) * 100, 
    2
  ) as conversion_rate_pct,
  AVG(total_aid_amount) as avg_aid_amount,
  SUM(total_aid_amount) as total_aid_requested
FROM public.aid_simulations
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY simulation_date DESC;

-- Comment tables for documentation
COMMENT ON TABLE public.aid_simulations IS 'Tracks all financial aid simulations for analytics and conversion tracking';
COMMENT ON COLUMN public.activities.transport_meta IS 'Structured transport metadata: covoiturage, bus stops, stations';
COMMENT ON COLUMN public.profiles.city_insee IS 'Normalized INSEE commune code (5 digits) for territorial analytics';