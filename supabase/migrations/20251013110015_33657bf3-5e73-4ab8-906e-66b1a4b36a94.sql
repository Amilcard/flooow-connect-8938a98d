-- Backup before deletion: 1 activity saved to backup_activities_before_replace.json

-- Delete existing activities (cascade will handle related slots/bookings)
DELETE FROM public.activities WHERE published = true;

-- Create Saint-Étienne territory if not exists
INSERT INTO public.territories (name, covered, config_json)
VALUES (
  'Métropole de Saint-Étienne',
  true,
  jsonb_build_object(
    'features', ARRAY['accessibility', 'financial_aid', 'covoiturage'],
    'zones', ARRAY['Saint-Étienne Centre', 'Saint-Étienne Nord', 'Saint-Étienne Sud', 'Firminy', 'Rive-de-Gier']
  )
)
ON CONFLICT DO NOTHING;

-- Create structures for Saint-Étienne (15 structures for 40 activities)
INSERT INTO public.structures (name, address, location, contact_json, accessibility_profile, territory_id)
VALUES
  -- Sport structures
  (
    'Tennis Club de Saint-Étienne',
    '12 Avenue de Rochetaillée, 42100 Saint-Étienne',
    ST_GeomFromText('POINT(4.3872 45.4343)', 4326)::geography,
    jsonb_build_object('email', 'contact@tcse.fr', 'phone', '+33477338800', 'website', 'https://www.tcse.fr'),
    jsonb_build_object('pmr_parking', true, 'elevator', false, 'accessible_toilets', true, 'ramp_access', true),
    (SELECT id FROM public.territories WHERE name = 'Métropole de Saint-Étienne' LIMIT 1)
  ),
  (
    'Stade Geoffroy-Guichard - École de Football',
    '14 Rue Paul et Pierre Guichard, 42000 Saint-Étienne',
    ST_GeomFromText('POINT(4.3906 45.4608)', 4326)::geography,
    jsonb_build_object('email', 'ecole@asse.fr', 'phone', '+33477922020'),
    jsonb_build_object('pmr_parking', true, 'elevator', true, 'accessible_toilets', true, 'ramp_access', true),
    (SELECT id FROM public.territories WHERE name = 'Métropole de Saint-Étienne' LIMIT 1)
  ),
  (
    'Piscine Municipale Plaine Achille',
    'Avenue de Rochetaillée, 42100 Saint-Étienne',
    ST_GeomFromText('POINT(4.3889 45.4354)', 4326)::geography,
    jsonb_build_object('email', 'piscine@saint-etienne.fr', 'phone', '+33477417200'),
    jsonb_build_object('pmr_parking', true, 'elevator', true, 'accessible_toilets', true, 'ramp_access', true, 'adapted_equipment', true),
    (SELECT id FROM public.territories WHERE name = 'Métropole de Saint-Étienne' LIMIT 1)
  ),
  (
    'Gymnase Jean Jaurès',
    '5 Rue Jules Verne, 42000 Saint-Étienne',
    ST_GeomFromText('POINT(4.3917 45.4397)', 4326)::geography,
    jsonb_build_object('email', 'gymnase.jaures@saint-etienne.fr', 'phone', '+33477428900'),
    jsonb_build_object('pmr_parking', true, 'accessible_toilets', true, 'ramp_access', true),
    (SELECT id FROM public.territories WHERE name = 'Métropole de Saint-Étienne' LIMIT 1)
  ),
  
  -- Culture structures
  (
    'Conservatoire Massenet',
    '5 Rue Buisson, 42000 Saint-Étienne',
    ST_GeomFromText('POINT(4.3876 45.4343)', 4326)::geography,
    jsonb_build_object('email', 'conservatoire@saint-etienne-metropole.fr', 'phone', '+33477490404'),
    jsonb_build_object('pmr_parking', false, 'elevator', true, 'accessible_toilets', true, 'ramp_access', true),
    (SELECT id FROM public.territories WHERE name = 'Métropole de Saint-Étienne' LIMIT 1)
  ),
  (
    'Comédie de Saint-Étienne',
    '7 Avenue Émile Loubet, 42000 Saint-Étienne',
    ST_GeomFromText('POINT(4.3854 45.4359)', 4326)::geography,
    jsonb_build_object('email', 'accueil@lacomedie.fr', 'phone', '+33477255014'),
    jsonb_build_object('pmr_parking', true, 'elevator', true, 'accessible_toilets', true, 'ramp_access', true),
    (SELECT id FROM public.territories WHERE name = 'Métropole de Saint-Étienne' LIMIT 1)
  ),
  (
    'Musée d''Art Moderne et Contemporain',
    'Rue Fernand Léger, 42270 Saint-Priest-en-Jarez',
    ST_GeomFromText('POINT(4.3745 45.4721)', 4326)::geography,
    jsonb_build_object('email', 'mamc@saint-etienne-metropole.fr', 'phone', '+33477795200'),
    jsonb_build_object('pmr_parking', true, 'elevator', true, 'accessible_toilets', true, 'ramp_access', true),
    (SELECT id FROM public.territories WHERE name = 'Métropole de Saint-Étienne' LIMIT 1)
  ),
  
  -- Loisirs structures
  (
    'Centre Aéré Les Petits Loups',
    '28 Rue Waldeck Rousseau, 42000 Saint-Étienne',
    ST_GeomFromText('POINT(4.3923 45.4289)', 4326)::geography,
    jsonb_build_object('email', 'lespetitsloups@mairie-st-etienne.fr', 'phone', '+33477490300'),
    jsonb_build_object('pmr_parking', true, 'accessible_toilets', true, 'ramp_access', true),
    (SELECT id FROM public.territories WHERE name = 'Métropole de Saint-Étienne' LIMIT 1)
  ),
  (
    'MJC de Montreynaud',
    '2 Rue Edmond Rostand, 42100 Saint-Étienne',
    ST_GeomFromText('POINT(4.4123 45.4512)', 4326)::geography,
    jsonb_build_object('email', 'mjc.montreynaud@wanadoo.fr', 'phone', '+33477381234'),
    jsonb_build_object('pmr_parking', true, 'elevator', false, 'accessible_toilets', true, 'ramp_access', true),
    (SELECT id FROM public.territories WHERE name = 'Métropole de Saint-Étienne' LIMIT 1)
  ),
  (
    'La Rotonde - Espace Sciences',
    '158 Cours Fauriel, 42100 Saint-Étienne',
    ST_GeomFromText('POINT(4.4012 45.4234)', 4326)::geography,
    jsonb_build_object('email', 'contact@larotonde-sciences.com', 'phone', '+33477421661'),
    jsonb_build_object('pmr_parking', true, 'elevator', true, 'accessible_toilets', true, 'ramp_access', true),
    (SELECT id FROM public.territories WHERE name = 'Métropole de Saint-Étienne' LIMIT 1)
  ),
  
  -- Scolarité structures
  (
    'Bibliothèque Municipale Tarentaize',
    '2 Rue de la Paix, 42000 Saint-Étienne',
    ST_GeomFromText('POINT(4.3967 45.4401)', 4326)::geography,
    jsonb_build_object('email', 'bib.tarentaize@saint-etienne.fr', 'phone', '+33477491800'),
    jsonb_build_object('pmr_parking', false, 'elevator', true, 'accessible_toilets', true, 'ramp_access', true),
    (SELECT id FROM public.territories WHERE name = 'Métropole de Saint-Étienne' LIMIT 1)
  ),
  (
    'École des Beaux-Arts',
    '15 Rue Buisson, 42000 Saint-Étienne',
    ST_GeomFromText('POINT(4.3881 45.4348)', 4326)::geography,
    jsonb_build_object('email', 'contact@esadse.fr', 'phone', '+33477473888'),
    jsonb_build_object('pmr_parking', true, 'elevator', true, 'accessible_toilets', true, 'ramp_access', true),
    (SELECT id FROM public.territories WHERE name = 'Métropole de Saint-Étienne' LIMIT 1)
  ),
  
  -- Vacances structures
  (
    'Colonie Le Grand Air - Pilat',
    'Route du Pilat, 42410 Pélussin',
    ST_GeomFromText('POINT(4.6789 45.4190)', 4326)::geography,
    jsonb_build_object('email', 'legrandair@colonies-se.fr', 'phone', '+33477514200'),
    jsonb_build_object('pmr_parking', true, 'accessible_toilets', true, 'ramp_access', false),
    (SELECT id FROM public.territories WHERE name = 'Métropole de Saint-Étienne' LIMIT 1)
  ),
  (
    'Base de Loisirs du Barrage de Grangent',
    'Le Pertuiset, 42660 Saint-Genest-Malifaux',
    ST_GeomFromText('POINT(4.4523 45.3456)', 4326)::geography,
    jsonb_build_object('email', 'accueil@grangent-loisirs.fr', 'phone', '+33477398800'),
    jsonb_build_object('pmr_parking', true, 'accessible_toilets', true, 'ramp_access', true),
    (SELECT id FROM public.territories WHERE name = 'Métropole de Saint-Étienne' LIMIT 1)
  ),
  (
    'Centre Équestre des Côteaux',
    'Chemin des Écuries, 42230 Roche-la-Molière',
    ST_GeomFromText('POINT(4.3234 45.4312)', 4326)::geography,
    jsonb_build_object('email', 'equitation@coteaux.fr', 'phone', '+33477529900'),
    jsonb_build_object('pmr_parking', true, 'accessible_toilets', true, 'ramp_access', true, 'adapted_equipment', true),
    (SELECT id FROM public.territories WHERE name = 'Métropole de Saint-Étienne' LIMIT 1)
  )
ON CONFLICT DO NOTHING;