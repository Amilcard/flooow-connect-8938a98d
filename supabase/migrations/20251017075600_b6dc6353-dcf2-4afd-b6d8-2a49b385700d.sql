-- Migration: Ajout colonnes transport_offers pour sync API transport
-- Date: 2025-01-17
-- Non-destructif: IF NOT EXISTS sur toutes les colonnes

ALTER TABLE public.transport_offers 
  ADD COLUMN IF NOT EXISTS external_id TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS start_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS start_lon DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS end_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS end_lon DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS price_cents INTEGER,
  ADD COLUMN IF NOT EXISTS currency TEXT,
  ADD COLUMN IF NOT EXISTS departure_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS arrival_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS raw JSONB,
  ADD COLUMN IF NOT EXISTS expired BOOLEAN DEFAULT FALSE;

-- Index composite pour upsert rapide (external_id, source)
CREATE INDEX IF NOT EXISTS idx_transport_offers_external_source 
  ON public.transport_offers (external_id, source);

-- Index sur expired pour réconciliation efficace
CREATE INDEX IF NOT EXISTS idx_transport_offers_expired 
  ON public.transport_offers (expired) 
  WHERE expired = FALSE;