-- Migrate "Santé" category to "Activités Innovantes"
-- Update activities with tech/innovation focus
UPDATE activities 
SET category = 'Activités Innovantes'
WHERE category = 'Santé'
AND (
  title ILIKE '%Robotique%' OR
  title ILIKE '%Code%' OR 
  title ILIKE '%Programmation%' OR
  title ILIKE '%Innovation%' OR
  title ILIKE '%Drone%' OR
  title ILIKE '%3D%' OR
  title ILIKE '%IA%' OR
  title ILIKE '%Numérique%' OR
  title ILIKE '%Technolog%' OR
  title ILIKE '%Entrepren%' OR
  title ILIKE '%Startup%'
);