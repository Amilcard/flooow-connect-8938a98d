-- 1. Ajouter colonne pour périodes de vacances spécifiques
ALTER TABLE activities ADD COLUMN IF NOT EXISTS vacation_periods TEXT[];

-- 2. Transformer category en array pour double catégorisation
-- Créer nouvelle colonne temporaire
ALTER TABLE activities ADD COLUMN IF NOT EXISTS categories TEXT[];

-- Migrer les données existantes
UPDATE activities SET categories = ARRAY[category] WHERE categories IS NULL;

-- Mettre à jour quelques activités avec double catégorie
UPDATE activities 
SET categories = ARRAY['Sport', 'Vacances']
WHERE title ILIKE '%stage%' AND category = 'Sport';

UPDATE activities 
SET categories = ARRAY['Culture', 'Loisirs']
WHERE title ILIKE '%atelier%arts%';

UPDATE activities 
SET categories = ARRAY['Loisirs', 'Vacances']
WHERE title ILIKE '%camp%';

-- 3. Définir les périodes de vacances pour activités concernées
UPDATE activities 
SET vacation_periods = ARRAY['février_2025', 'printemps_2025']
WHERE category = 'Vacances' OR 'Vacances' = ANY(categories);

-- 4. Créer index pour optimiser les requêtes sur categories
CREATE INDEX IF NOT EXISTS idx_activities_categories ON activities USING GIN(categories);