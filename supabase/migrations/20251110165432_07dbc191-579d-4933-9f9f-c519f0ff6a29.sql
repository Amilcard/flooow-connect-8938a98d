-- Create territory_events table for agenda feature
CREATE TABLE public.territory_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  territory_id UUID REFERENCES public.territories(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('enfants_ados', 'reunion_parents', 'info_collectivite', 'atelier', 'autre')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  organizer_name TEXT,
  organizer_contact TEXT,
  image_url TEXT,
  external_link TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- Create indexes for better performance
CREATE INDEX idx_territory_events_territory ON public.territory_events(territory_id);
CREATE INDEX idx_territory_events_start_date ON public.territory_events(start_date);
CREATE INDEX idx_territory_events_type ON public.territory_events(event_type);
CREATE INDEX idx_territory_events_published ON public.territory_events(published) WHERE published = true;

-- Enable Row Level Security
ALTER TABLE public.territory_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Everyone can view published events
CREATE POLICY "Published events visible to all"
ON public.territory_events
FOR SELECT
USING (published = true);

-- Admins can manage all events
CREATE POLICY "Admins can manage events"
ON public.territory_events
FOR ALL
USING (
  has_role(auth.uid(), 'superadmin'::app_role) 
  OR has_role(auth.uid(), 'territory_admin'::app_role)
);

-- Territory admins can manage events in their territory
CREATE POLICY "Territory admins manage their events"
ON public.territory_events
FOR ALL
USING (
  has_role(auth.uid(), 'territory_admin'::app_role)
  AND territory_id = get_user_territory(auth.uid())
);

-- Structures can view all published events
CREATE POLICY "Structures view published events"
ON public.territory_events
FOR SELECT
USING (
  has_role(auth.uid(), 'structure'::app_role)
  AND published = true
);

-- Update timestamp trigger
CREATE TRIGGER update_territory_events_updated_at
BEFORE UPDATE ON public.territory_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();