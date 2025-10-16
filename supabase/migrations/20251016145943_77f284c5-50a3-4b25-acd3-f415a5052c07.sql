-- Mise à jour images par activité avec URLs Unsplash (correction pour colonne images array)

-- Sport - Football enfants
UPDATE activities SET images = ARRAY['https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=600&fit=crop']
WHERE title LIKE '%Football%' AND age_min <= 9;

-- Sport - Basketball ados
UPDATE activities SET images = ARRAY['https://images.unsplash.com/photo-1594882645126-14020914d58d?w=800&h=600&fit=crop']
WHERE title LIKE '%Basket%' AND age_min >= 10;

-- Culture - Arts plastiques enfants
UPDATE activities SET images = ARRAY['https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=600&fit=crop']
WHERE 'Culture' = ANY(categories) AND title LIKE '%Arts%' AND age_max <= 13;

-- Culture - Photo ados
UPDATE activities SET images = ARRAY['https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&h=600&fit=crop']
WHERE 'Culture' = ANY(categories) AND title LIKE '%Photo%';

-- Loisirs - Cuisine enfants
UPDATE activities SET images = ARRAY['https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=800&h=600&fit=crop']
WHERE title LIKE '%Cuisine%' AND age_min <= 9;

-- Vacances - Colonie enfants
UPDATE activities SET images = ARRAY['https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&h=600&fit=crop']
WHERE 'Vacances' = ANY(categories) AND (title LIKE '%Colonie%' OR title LIKE '%Camp%') AND age_max <= 13;

-- Vacances - Camp aventure ados
UPDATE activities SET images = ARRAY['https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop']
WHERE 'Vacances' = ANY(categories) AND age_min >= 14;

-- Loisirs - Robotique
UPDATE activities SET images = ARRAY['https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=600&fit=crop']
WHERE title LIKE '%Robotique%';

-- Loisirs - Coding/Programmation ados
UPDATE activities SET images = ARRAY['https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=600&fit=crop']
WHERE title LIKE '%Code%' OR title LIKE '%Programmation%';