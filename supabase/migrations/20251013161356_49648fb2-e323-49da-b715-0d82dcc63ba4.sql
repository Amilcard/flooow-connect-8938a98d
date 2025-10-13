-- ============================================================
-- Migration: Fix aid_simulations constraints + RLS
-- Date: 2025-10-13
-- Purpose: Add NOT NULL constraints and RLS policies to aid_simulations
-- ============================================================

-- Drop and recreate table with correct constraints
DROP TABLE IF EXISTS public.aid_simulations CASCADE;

CREATE TABLE public.aid_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  simulated_aids JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.aid_simulations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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

-- Indexes
CREATE INDEX idx_aid_simulations_booking ON public.aid_simulations(booking_id);
CREATE INDEX idx_aid_simulations_user ON public.aid_simulations(user_id);
CREATE INDEX idx_aid_simulations_activity ON public.aid_simulations(activity_id);
CREATE INDEX idx_aid_simulations_created_at ON public.aid_simulations(created_at DESC);