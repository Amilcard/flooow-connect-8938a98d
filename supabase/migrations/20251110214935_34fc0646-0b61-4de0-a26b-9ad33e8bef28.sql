-- Créer la table notification_preferences si elle n'existe pas
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interested_categories TEXT[] DEFAULT '{}',
  notify_territory_events BOOLEAN DEFAULT true,
  notify_favorite_categories BOOLEAN DEFAULT false,
  email_notifications BOOLEAN DEFAULT false,
  event_reminders_enabled BOOLEAN DEFAULT true,
  event_reminder_days_before INTEGER DEFAULT 3,
  event_reminder_email BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLS policies pour notification_preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notification preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Créer une table pour suivre les rappels déjà envoyés
CREATE TABLE IF NOT EXISTS event_reminders_sent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES territory_events(id) ON DELETE CASCADE,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('notification', 'email')),
  days_before INTEGER NOT NULL,
  UNIQUE(user_id, event_id, reminder_type, days_before)
);

-- RLS policies pour event_reminders_sent
ALTER TABLE event_reminders_sent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reminders sent"
  ON event_reminders_sent FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert reminders sent"
  ON event_reminders_sent FOR INSERT
  WITH CHECK (true);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user 
  ON notification_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_event_reminders_sent_user_event 
  ON event_reminders_sent(user_id, event_id);

CREATE INDEX IF NOT EXISTS idx_event_reminders_sent_sent_at 
  ON event_reminders_sent(sent_at);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_preferences_updated_at();