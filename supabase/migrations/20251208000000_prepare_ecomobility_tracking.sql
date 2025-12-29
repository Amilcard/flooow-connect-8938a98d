-- Migration: Préparation du suivi écomobilité (cumul CO2/km économisés)
-- Cette table permettra de cumuler les économies CO2 par famille/utilisateur
-- À activer quand la fonctionnalité sera prête

-- Table pour stocker les choix de mobilité des utilisateurs
-- CREATE TABLE IF NOT EXISTS mobility_choices (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
--   activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
--
--   -- Type de transport choisi
--   transport_type TEXT NOT NULL CHECK (transport_type IN ('bus', 'bike', 'walk', 'carpool')),
--
--   -- Données du trajet
--   distance_km NUMERIC(10, 2), -- Distance en km
--   duration_min INTEGER, -- Durée en minutes
--
--   -- Impact environnemental calculé
--   co2_saved_kg NUMERIC(10, 3), -- CO2 évités vs voiture (kg)
--   calories_burned INTEGER, -- Calories brûlées (vélo/marche)
--   steps_count INTEGER, -- Nombre de pas (marche uniquement)
--
--   -- Métadonnées
--   created_at TIMESTAMPTZ DEFAULT NOW(),
--   trip_date DATE DEFAULT CURRENT_DATE
-- );

-- Index pour les requêtes de cumul par utilisateur et période
-- CREATE INDEX idx_mobility_choices_user_date ON mobility_choices(user_id, trip_date);

-- Vue pour le cumul mensuel par utilisateur (future fonctionnalité "Mon compte")
-- CREATE OR REPLACE VIEW v_monthly_ecomobility_stats AS
-- SELECT
--   user_id,
--   DATE_TRUNC('month', trip_date) AS month,
--   COUNT(*) AS total_trips,
--   SUM(distance_km) AS total_distance_km,
--   SUM(co2_saved_kg) AS total_co2_saved_kg,
--   SUM(calories_burned) AS total_calories,
--   SUM(steps_count) AS total_steps
-- FROM mobility_choices
-- GROUP BY user_id, DATE_TRUNC('month', trip_date);

-- RLS policies (à activer avec la fonctionnalité)
-- ALTER TABLE mobility_choices ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view their own mobility choices"
--   ON mobility_choices FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can insert their own mobility choices"
--   ON mobility_choices FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Note: Cette migration est commentée pour ne pas impacter la production.
-- Décommenter et exécuter quand la fonctionnalité de cumul écomobilité sera développée.

SELECT 'Migration préparée pour le cumul écomobilité - tables commentées' AS status;
