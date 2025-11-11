-- Ajouter le champ pour les emails de recommandations
ALTER TABLE public.notification_preferences 
ADD COLUMN IF NOT EXISTS recommendation_emails boolean DEFAULT false;

COMMENT ON COLUMN public.notification_preferences.recommendation_emails IS 'Recevoir des emails pour les nouvelles recommandations d''événements';