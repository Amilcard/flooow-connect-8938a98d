-- Extension pgcrypto (si nécessaire)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Table transport_stations (stations de transport)
CREATE TABLE IF NOT EXISTS public.transport_stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location GEOMETRY,
  station_type TEXT,
  external_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transport_stations_location ON public.transport_stations USING GIST(location);

-- Table transport_offers (offres de transport liées aux activités)
CREATE TABLE IF NOT EXISTS public.transport_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE NOT NULL,
  station_id UUID REFERENCES public.transport_stations(id) ON DELETE SET NULL,
  mode TEXT NOT NULL,
  travel_time_min INTEGER,
  distance_m INTEGER,
  carbon_saved_kg NUMERIC(8,4),
  price_estimate NUMERIC(8,2),
  route_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transport_offers_activity ON public.transport_offers(activity_id);
CREATE INDEX IF NOT EXISTS idx_transport_offers_station ON public.transport_offers(station_id);
CREATE INDEX IF NOT EXISTS idx_transport_offers_mode ON public.transport_offers(mode);

-- Table transport_sync_meta (métadonnées de synchronisation)
CREATE TABLE IF NOT EXISTS public.transport_sync_meta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  last_sync_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  details JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transport_sync_meta_provider ON public.transport_sync_meta(provider);
CREATE INDEX IF NOT EXISTS idx_transport_sync_meta_status ON public.transport_sync_meta(status);

-- Triggers pour updated_at
CREATE TRIGGER update_transport_stations_updated_at
  BEFORE UPDATE ON public.transport_stations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transport_offers_updated_at
  BEFORE UPDATE ON public.transport_offers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transport_sync_meta_updated_at
  BEFORE UPDATE ON public.transport_sync_meta
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS pour transport_stations
ALTER TABLE public.transport_stations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stations visibles par tous"
  ON public.transport_stations
  FOR SELECT
  USING (true);

CREATE POLICY "Admins peuvent gérer les stations"
  ON public.transport_stations
  FOR ALL
  USING (has_role(auth.uid(), 'superadmin'::app_role) OR has_role(auth.uid(), 'territory_admin'::app_role));

-- RLS pour transport_offers
ALTER TABLE public.transport_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Offres visibles par tous"
  ON public.transport_offers
  FOR SELECT
  USING (true);

CREATE POLICY "Structures peuvent gérer offres de leurs activités"
  ON public.transport_offers
  FOR ALL
  USING (
    has_role(auth.uid(), 'structure'::app_role) 
    AND EXISTS (
      SELECT 1 FROM activities a
      JOIN structures s ON a.structure_id = s.id
      WHERE a.id = transport_offers.activity_id
    )
  );

CREATE POLICY "Admins peuvent gérer toutes les offres"
  ON public.transport_offers
  FOR ALL
  USING (has_role(auth.uid(), 'superadmin'::app_role) OR has_role(auth.uid(), 'territory_admin'::app_role));

-- RLS pour transport_sync_meta
ALTER TABLE public.transport_sync_meta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seuls admins peuvent voir sync meta"
  ON public.transport_sync_meta
  FOR SELECT
  USING (has_role(auth.uid(), 'superadmin'::app_role) OR has_role(auth.uid(), 'territory_admin'::app_role));

CREATE POLICY "Seuls admins peuvent gérer sync meta"
  ON public.transport_sync_meta
  FOR ALL
  USING (has_role(auth.uid(), 'superadmin'::app_role));