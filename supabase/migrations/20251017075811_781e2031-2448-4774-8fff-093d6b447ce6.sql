-- Migration: Ajout tables stops/stations + colonnes nearest pour transport_offers
-- Date: 2025-01-17 (partie 2)
-- Non-destructif: IF NOT EXISTS

-- Table arrêts bus/tram (STAS, GTFS)
CREATE TABLE IF NOT EXISTS public.transport_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stop_id TEXT NOT NULL,
  source TEXT NOT NULL,
  name TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,
  lines TEXT[],
  raw JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(stop_id, source)
);

-- Table stations vélos partagés (Vélivert)
CREATE TABLE IF NOT EXISTS public.bike_stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id TEXT NOT NULL,
  source TEXT NOT NULL,
  name TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,
  available_bikes INTEGER DEFAULT 0,
  available_slots INTEGER DEFAULT 0,
  raw JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(station_id, source)
);

-- Colonnes nearest dans transport_offers
ALTER TABLE public.transport_offers
  ADD COLUMN IF NOT EXISTS nearest_stop_id TEXT,
  ADD COLUMN IF NOT EXISTS nearest_stop_source TEXT,
  ADD COLUMN IF NOT EXISTS nearest_station_id TEXT,
  ADD COLUMN IF NOT EXISTS nearest_station_source TEXT;

-- Index géospatiaux pour recherche proximité (lat/lon)
CREATE INDEX IF NOT EXISTS idx_transport_stops_coords 
  ON public.transport_stops (lat, lon);

CREATE INDEX IF NOT EXISTS idx_bike_stations_coords 
  ON public.bike_stations (lat, lon);

-- Index pour recherche par source
CREATE INDEX IF NOT EXISTS idx_transport_stops_source 
  ON public.transport_stops (source);

CREATE INDEX IF NOT EXISTS idx_bike_stations_source 
  ON public.bike_stations (source);

-- RLS pour sécurité (lecture publique, écriture admin)
ALTER TABLE public.transport_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bike_stations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transport_stops_visible_all" 
  ON public.transport_stops FOR SELECT USING (true);

CREATE POLICY "bike_stations_visible_all" 
  ON public.bike_stations FOR SELECT USING (true);

CREATE POLICY "admins_manage_transport_stops" 
  ON public.transport_stops FOR ALL 
  USING (has_role(auth.uid(), 'superadmin'::app_role) OR has_role(auth.uid(), 'territory_admin'::app_role));

CREATE POLICY "admins_manage_bike_stations" 
  ON public.bike_stations FOR ALL 
  USING (has_role(auth.uid(), 'superadmin'::app_role) OR has_role(auth.uid(), 'territory_admin'::app_role));