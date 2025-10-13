-- CULTURE (8 activities)
INSERT INTO public.activities (
  structure_id, title, category, description, images, age_min, age_max, tags,
  price_base, price_note, accepts_aid_types, payment_echelonned, payment_plans,
  covoiturage_enabled, transport_options, accessibility_checklist, documents_required,
  capacity_policy, rules_acceptance_json, published
)
VALUES
  -- 11. Piano
  (
    (SELECT id FROM public.structures WHERE name = 'Conservatoire Massenet' LIMIT 1),
    'Cours de Piano',
    'Culture',
    'Apprentissage piano classique et moderne. Solfège intégré, récitals, préparation concours.',
    ARRAY['https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800'],
    6, 17,
    ARRAY['musique', 'piano', 'classique'],
    250, 'Accès instrument sur place',
    '["CAF"]'::jsonb,
    true,
    jsonb_build_array(
      jsonb_build_object('name', 'Paiement en 5 fois', 'installments', 5, 'description', '5x 50€')
    ),
    false,
    '[]'::jsonb,
    jsonb_build_object('pmr_access', true, 'adapted_equipment', false, 'specialized_staff', false, 'sensory_friendly', true),
    jsonb_build_array(),
    jsonb_build_object('seats_total', 12, 'seats_remaining', 4, 'waitlist_enabled', true, 'overbooking_allowed', false),
    jsonb_build_object('rules_text', 'Pratique personnelle 30min/jour recommandée.', 'acceptance_required', false),
    true
  ),
  
  -- 12. Théâtre Ados
  (
    (SELECT id FROM public.structures WHERE name = 'Comédie de Saint-Étienne' LIMIT 1),
    'Atelier Théâtre Adolescents',
    'Culture',
    'Improvisation, jeu d''acteur, mise en scène. Spectacle de fin d''année sur scène professionnelle.',
    ARRAY['https://images.unsplash.com/photo-1503095396549-807759245b35?w=800'],
    12, 17,
    ARRAY['théâtre', 'comédie', 'spectacle'],
    180, 'Représentation finale incluse',
    '["CAF", "PassSport"]'::jsonb,
    false,
    '[]'::jsonb,
    true,
    jsonb_build_array(
      jsonb_build_object('type', 'Tram T2', 'details', 'Arrêt Bellevue')
    ),
    jsonb_build_object('pmr_access', true, 'adapted_equipment', false, 'specialized_staff', false, 'sensory_friendly', true),
    jsonb_build_array(),
    jsonb_build_object('seats_total', 15, 'seats_remaining', 6, 'waitlist_enabled', true, 'overbooking_allowed', false),
    jsonb_build_object('rules_text', 'Engagement présence aux répétitions.', 'acceptance_required', true),
    true
  ),
  
  -- 13. Dessin Peinture
  (
    (SELECT id FROM public.structures WHERE name = 'École des Beaux-Arts' LIMIT 1),
    'Atelier Arts Plastiques Enfants',
    'Culture',
    'Dessin, peinture, collage, modelage. Techniques variées, expression artistique libre.',
    ARRAY['https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800'],
    6, 14,
    ARRAY['dessin', 'peinture', 'arts plastiques'],
    120, 'Matériel fourni',
    '["CAF"]'::jsonb,
    true,
    jsonb_build_array(
      jsonb_build_object('name', 'Paiement en 3 fois', 'installments', 3, 'description', '3x 40€')
    ),
    false,
    '[]'::jsonb,
    jsonb_build_object('pmr_access', true, 'adapted_equipment', true, 'specialized_staff', false, 'sensory_friendly', true),
    jsonb_build_array(),
    jsonb_build_object('seats_total', 14, 'seats_remaining', 7, 'waitlist_enabled', false, 'overbooking_allowed', false),
    jsonb_build_object('rules_text', 'Tablier obligatoire.', 'acceptance_required', false),
    true
  ),
  
  -- 14. Chorale
  (
    (SELECT id FROM public.structures WHERE name = 'Conservatoire Massenet' LIMIT 1),
    'Chorale Jeunes Voix',
    'Culture',
    'Chant choral répertoire varié. Technique vocale, harmonies, concerts publics.',
    ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'],
    8, 16,
    ARRAY['musique', 'chant', 'chorale'],
    80, 'Gratuit si quotient familial <800€',
    '["CAF"]'::jsonb,
    false,
    '[]'::jsonb,
    false,
    '[]'::jsonb,
    jsonb_build_object('pmr_access', true, 'adapted_equipment', false, 'specialized_staff', false, 'sensory_friendly', true),
    jsonb_build_array(),
    jsonb_build_object('seats_total', 30, 'seats_remaining', 18, 'waitlist_enabled', false, 'overbooking_allowed', false),
    jsonb_build_object('rules_text', 'Assiduité indispensable.', 'acceptance_required', true),
    true
  ),
  
  -- 15. Guitare
  (
    (SELECT id FROM public.structures WHERE name = 'MJC de Montreynaud' LIMIT 1),
    'Cours de Guitare',
    'Culture',
    'Guitare acoustique/électrique. Folk, rock, pop. Cours individuels ou collectifs.',
    ARRAY['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800'],
    8, 17,
    ARRAY['musique', 'guitare', 'rock'],
    140, 'Guitare à fournir',
    '["CAF", "PassSport"]'::jsonb,
    true,
    jsonb_build_array(
      jsonb_build_object('name', 'Paiement en 3 fois', 'installments', 3, 'description', '3x 47€')
    ),
    false,
    '[]'::jsonb,
    jsonb_build_object('pmr_access', true, 'adapted_equipment', false, 'specialized_staff', false, 'sensory_friendly', false),
    jsonb_build_array(),
    jsonb_build_object('seats_total', 10, 'seats_remaining', 3, 'waitlist_enabled', true, 'overbooking_allowed', false),
    jsonb_build_object('rules_text', 'Pratique 20min/jour minimum.', 'acceptance_required', false),
    true
  ),
  
  -- 16. Visite Musée
  (
    (SELECT id FROM public.structures WHERE name = 'Musée d''Art Moderne et Contemporain' LIMIT 1),
    'Parcours Art Jeune Public',
    'Culture',
    'Visites guidées adaptées + ateliers créatifs. Découverte œuvres majeures art contemporain.',
    ARRAY['https://images.unsplash.com/photo-1564399579883-451a5d44ec08?w=800'],
    6, 15,
    ARRAY['musée', 'art', 'culture'],
    0, 'Gratuit pour les enfants',
    '[]'::jsonb,
    false,
    '[]'::jsonb,
    true,
    jsonb_build_array(
      jsonb_build_object('type', 'Bus C2', 'details', 'Arrêt Musée')
    ),
    jsonb_build_object('pmr_access', true, 'adapted_equipment', true, 'specialized_staff', true, 'sensory_friendly', true),
    jsonb_build_array(),
    jsonb_build_object('seats_total', 20, 'seats_remaining', 20, 'waitlist_enabled', false, 'overbooking_allowed', false),
    jsonb_build_object('rules_text', 'Réservation obligatoire.', 'acceptance_required', false),
    true
  ),
  
  -- 17. Cirque
  (
    (SELECT id FROM public.structures WHERE name = 'MJC de Montreynaud' LIMIT 1),
    'Arts du Cirque',
    'Culture',
    'Jonglerie, acrobatie, équilibre. Spectacle pluridisciplinaire fin d''année.',
    ARRAY['https://images.unsplash.com/photo-1518732159384-7863f4d0c990?w=800'],
    7, 14,
    ARRAY['cirque', 'acrobatie', 'spectacle'],
    150, 'Matériel cirque fourni',
    '["CAF", "PassSport"]'::jsonb,
    true,
    jsonb_build_array(
      jsonb_build_object('name', 'Paiement en 3 fois', 'installments', 3, 'description', '3x 50€')
    ),
    false,
    '[]'::jsonb,
    jsonb_build_object('pmr_access', false, 'adapted_equipment', false, 'specialized_staff', false, 'sensory_friendly', false),
    jsonb_build_array(
      jsonb_build_object('key', 'certificat_medical', 'mandatory', true, 'label', 'Certificat médical'),
      jsonb_build_object('key', 'autorisation_parentale', 'mandatory', true, 'label', 'Autorisation parentale')
    ),
    jsonb_build_object('seats_total', 16, 'seats_remaining', 8, 'waitlist_enabled', true, 'overbooking_allowed', false),
    jsonb_build_object('rules_text', 'Discipline et écoute exigées.', 'acceptance_required', true),
    true
  ),
  
  -- 18. Photographie
  (
    (SELECT id FROM public.structures WHERE name = 'École des Beaux-Arts' LIMIT 1),
    'Atelier Photo Ados',
    'Culture',
    'Initiation photographie argentique/numérique. Cadrage, lumière, retouche, expo finale.',
    ARRAY['https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800'],
    12, 17,
    ARRAY['photographie', 'image', 'art'],
    100, 'Appareil photo recommandé',
    '["CAF"]'::jsonb,
    false,
    '[]'::jsonb,
    false,
    '[]'::jsonb,
    jsonb_build_object('pmr_access', true, 'adapted_equipment', false, 'specialized_staff', false, 'sensory_friendly', true),
    jsonb_build_array(),
    jsonb_build_object('seats_total', 12, 'seats_remaining', 5, 'waitlist_enabled', false, 'overbooking_allowed', false),
    jsonb_build_object('rules_text', 'Respect matériel et sorties photo.', 'acceptance_required', true),
    true
  );

-- Part 2 complete: 8 CULTURE activities inserted