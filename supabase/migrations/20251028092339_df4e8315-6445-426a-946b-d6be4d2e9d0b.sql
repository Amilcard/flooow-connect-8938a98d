-- =============================================
-- TRACKING TABLES POUR ANALYTICS ET KPIs
-- =============================================

-- Table 1: search_logs (tracking recherches utilisateur)
CREATE TABLE IF NOT EXISTS public.search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_id TEXT,
  search_query TEXT,
  filters_applied JSONB DEFAULT '{}',
  results_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_search_logs_user ON public.search_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_created ON public.search_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_logs_session ON public.search_logs(session_id);

-- RLS policies pour search_logs
ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own searches"
  ON public.search_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own searches"
  ON public.search_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Admins can view all searches"
  ON public.search_logs FOR SELECT
  USING (
    has_role(auth.uid(), 'superadmin'::app_role) OR 
    has_role(auth.uid(), 'territory_admin'::app_role)
  );

-- Table 2: activity_views (tracking consultations fiches activités)
CREATE TABLE IF NOT EXISTS public.activity_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_id TEXT,
  view_duration_seconds INTEGER,
  source TEXT, -- 'search', 'home', 'direct', 'favorites'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_activity_views_activity ON public.activity_views(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_views_user ON public.activity_views(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_views_created ON public.activity_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_views_session ON public.activity_views(session_id);

-- RLS policies pour activity_views
ALTER TABLE public.activity_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity views"
  ON public.activity_views FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity views"
  ON public.activity_views FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Admins can view all activity views"
  ON public.activity_views FOR SELECT
  USING (
    has_role(auth.uid(), 'superadmin'::app_role) OR 
    has_role(auth.uid(), 'territory_admin'::app_role)
  );

CREATE POLICY "Structures can view views for their activities"
  ON public.activity_views FOR SELECT
  USING (
    has_role(auth.uid(), 'structure'::app_role) AND
    EXISTS (
      SELECT 1 FROM public.activities a
      JOIN public.structures s ON a.structure_id = s.id
      WHERE a.id = activity_views.activity_id
    )
  );

-- Modification Table 3: bookings (ajout confirmation présence)
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS participation_confirmed BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS participation_confirmed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS participation_confirmed_by UUID REFERENCES public.profiles(id);

-- Index pour recherches rapides
CREATE INDEX IF NOT EXISTS idx_bookings_participation ON public.bookings(participation_confirmed) 
WHERE participation_confirmed IS NOT NULL;

-- Commentaires pour documentation
COMMENT ON TABLE public.search_logs IS 'Tracking des recherches utilisateur pour analytics';
COMMENT ON TABLE public.activity_views IS 'Tracking des consultations de fiches activités';
COMMENT ON COLUMN public.bookings.participation_confirmed IS 'Confirmation de présence effective à l activité';
COMMENT ON COLUMN public.bookings.participation_confirmed_at IS 'Date/heure de confirmation de présence';
COMMENT ON COLUMN public.bookings.participation_confirmed_by IS 'Structure ayant confirmé la présence';