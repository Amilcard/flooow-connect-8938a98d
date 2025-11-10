-- Create favorite_events table
CREATE TABLE public.favorite_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.territory_events(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Enable RLS
ALTER TABLE public.favorite_events ENABLE ROW LEVEL SECURITY;

-- Users can manage their own favorites
CREATE POLICY "Users can view their own favorite events"
ON public.favorite_events
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorite events"
ON public.favorite_events
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorite events"
ON public.favorite_events
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_favorite_events_user_id ON public.favorite_events(user_id);
CREATE INDEX idx_favorite_events_event_id ON public.favorite_events(event_id);