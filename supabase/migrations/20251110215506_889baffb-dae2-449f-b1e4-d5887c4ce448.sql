-- Créer une table pour les inscriptions aux événements
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES territory_events(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'interested' CHECK (status IN ('interested', 'going', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_event_registrations_event 
  ON event_registrations(event_id, status);

CREATE INDEX IF NOT EXISTS idx_event_registrations_user 
  ON event_registrations(user_id);

-- RLS policies pour event_registrations
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all registrations"
  ON event_registrations FOR SELECT
  USING (true);

CREATE POLICY "Users can register to events"
  ON event_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registrations"
  ON event_registrations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own registrations"
  ON event_registrations FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_event_registrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_event_registrations_updated_at
  BEFORE UPDATE ON event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_event_registrations_updated_at();

-- Vue pour les statistiques d'événements avec compteur de participants
CREATE OR REPLACE VIEW event_stats AS
SELECT 
  te.id as event_id,
  te.title,
  te.start_date,
  COUNT(DISTINCT er.user_id) FILTER (WHERE er.status IN ('interested', 'going')) as participants_count,
  COUNT(DISTINCT er.user_id) FILTER (WHERE er.status = 'going') as confirmed_count,
  COUNT(DISTINCT er.user_id) FILTER (WHERE er.status = 'interested') as interested_count
FROM territory_events te
LEFT JOIN event_registrations er ON te.id = er.event_id
GROUP BY te.id, te.title, te.start_date;

-- Enable realtime pour event_registrations
ALTER PUBLICATION supabase_realtime ADD TABLE event_registrations;

-- Commentaires
COMMENT ON TABLE event_registrations IS 'Track user registrations and interest in territory events';
COMMENT ON COLUMN event_registrations.status IS 'User registration status: interested (saved for later), going (confirmed attendance), cancelled';
COMMENT ON VIEW event_stats IS 'Aggregated statistics for event participation';