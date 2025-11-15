-- Ajouter des colonnes manquantes à territory_events pour l'agenda interactif
ALTER TABLE public.territory_events
ADD COLUMN IF NOT EXISTS age_min integer,
ADD COLUMN IF NOT EXISTS age_max integer,
ADD COLUMN IF NOT EXISTS price_indicative numeric,
ADD COLUMN IF NOT EXISTS booking_url text;

-- Ajouter des commentaires pour documenter
COMMENT ON COLUMN public.territory_events.age_min IS 'Âge minimum conseillé pour l''événement';
COMMENT ON COLUMN public.territory_events.age_max IS 'Âge maximum conseillé pour l''événement';
COMMENT ON COLUMN public.territory_events.price_indicative IS 'Prix indicatif en euros (peut être 0 pour gratuit)';
COMMENT ON COLUMN public.territory_events.booking_url IS 'URL de réservation/billetterie';

-- Créer un index pour filtrer par âge
CREATE INDEX IF NOT EXISTS idx_territory_events_age ON public.territory_events(age_min, age_max);

-- Créer un index pour filtrer par dates et publication
CREATE INDEX IF NOT EXISTS idx_territory_events_dates_published ON public.territory_events(start_date, end_date, published);