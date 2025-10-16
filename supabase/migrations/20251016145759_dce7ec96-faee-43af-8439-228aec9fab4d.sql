-- Update activities with new AI-generated images matching age and category

-- Sport 6-9 ans
UPDATE activities SET images = ARRAY['/src/assets/activity-judo-6-9.jpg']
WHERE title = 'Judo Enfant - Le Dojo' AND age_min = 6 AND age_max = 9;

UPDATE activities SET images = ARRAY['/src/assets/activity-natation-6-9.jpg']
WHERE title = 'Natation Enfants - Apprentissage' AND age_min = 6 AND age_max = 9;

-- Sport 10-13 ans
UPDATE activities SET images = ARRAY['/src/assets/activity-multisports-10-13.jpg']
WHERE title = 'Multisport Centre Jeunesse' AND age_min = 10 AND age_max = 13;

-- Sport 14-17 ans
UPDATE activities SET images = ARRAY['/src/assets/activity-escalade-14-17.jpg']
WHERE title = 'Escalade Jeunes - Grimpe & Fun' AND age_min = 14 AND age_max = 17;

UPDATE activities SET images = ARRAY['/src/assets/activity-hiphop-14-17.jpg']
WHERE title = 'Atelier Hip-Hop - CréaRythme' AND age_min = 6 AND age_max = 9;

-- Culture 6-9 ans
UPDATE activities SET images = ARRAY['/src/assets/activity-musique-6-9.jpg']
WHERE title = 'Éveil Musique - Conservatoire' AND age_min = 6 AND age_max = 9;

UPDATE activities SET images = ARRAY['/src/assets/activity-theatre-6-9.jpg']
WHERE title = 'Cours de Théâtre Jeune Public' AND age_min = 6 AND age_max = 9;

-- Culture 10-13 ans
UPDATE activities SET images = ARRAY['/src/assets/activity-arts-10-13.jpg']
WHERE title = 'Atelier Arts Plastiques' AND age_min = 10 AND age_max = 13;

UPDATE activities SET images = ARRAY['/src/assets/activity-photo-14-17.jpg']
WHERE title = 'Atelier Photo & Création' AND age_min = 10 AND age_max = 13;

-- Loisirs 6-9 ans
UPDATE activities SET images = ARRAY['/src/assets/activity-robotique-10-13.jpg']
WHERE title = 'Atelier Robotique Ludique' AND age_min = 6 AND age_max = 9;

UPDATE activities SET images = ARRAY['/src/assets/activity-jeux-6-9.jpg']
WHERE title = 'Club Jeux de Société - Après-midi' AND age_min = 6 AND age_max = 9;

-- Loisirs 10-13 ans
UPDATE activities SET images = ARRAY['/src/assets/activity-cuisine-6-9.jpg']
WHERE title = 'Atelier Cuisine Junior' AND age_min = 10 AND age_max = 13;

UPDATE activities SET images = ARRAY['/src/assets/activity-jardinage-10-13.jpg']
WHERE title = 'Atelier Jardinage Urbain' AND age_min = 10 AND age_max = 13;

-- Scolarité 6-9 ans
UPDATE activities SET images = ARRAY['/src/assets/activity-soutien-6-9.jpg']
WHERE title = 'Aide aux Devoirs - Primaire' AND age_min = 6 AND age_max = 9;

UPDATE activities SET images = ARRAY['/src/assets/activity-code-10-13.jpg']
WHERE title = 'Atelier Soutien Scolaire - Méthodo' AND age_min = 6 AND age_max = 9;

-- Vacances 6-9 ans
UPDATE activities SET images = ARRAY['/src/assets/activity-stage-foot-6-9.jpg']
WHERE title LIKE '%Stage Football%' AND age_min = 6 AND age_max = 9;

UPDATE activities SET images = ARRAY['/src/assets/activity-stage-foot-6-9.jpg']
WHERE title = 'Stage Multi-activités Printemps' AND age_min = 6 AND age_max = 9;

-- Vacances 10-13 ans
UPDATE activities SET images = ARRAY['/src/assets/activity-camp-10-13.jpg']
WHERE title LIKE '%Camp%' AND age_min = 10 AND age_max = 13;

-- Vacances 14-17 ans
UPDATE activities SET images = ARRAY['/src/assets/activity-sejour-14-17.jpg']
WHERE title LIKE '%Séjour%' AND age_min = 14 AND age_max = 17;