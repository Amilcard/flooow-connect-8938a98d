-- Insert 40 activities for Saint-Étienne (01/11/2025 → 30/06/2026)
-- 5 univers: Scolarité (8), Sport (10), Culture (8), Loisirs (8), Vacances (6)

-- SPORT (10 activities)
INSERT INTO public.activities (
  structure_id, title, category, description, images, age_min, age_max, tags,
  price_base, price_note, accepts_aid_types, payment_echelonned, payment_plans,
  covoiturage_enabled, transport_options, accessibility_checklist, documents_required,
  capacity_policy, rules_acceptance_json, published
)
VALUES
  -- 1. Tennis (modèle exact)
  (
    (SELECT id FROM public.structures WHERE name = 'Tennis Club de Saint-Étienne' LIMIT 1),
    'Tennis - TC Saint-Étienne',
    'Sport',
    'Cours de tennis pour enfants et adolescents. Apprentissage technique, jeu en groupe, participation à des tournois locaux.',
    ARRAY['https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800', 'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=800'],
    6, 17,
    ARRAY['tennis', 'sport', 'raquette', 'compétition'],
    180, 'Tarif annuel, raquettes fournies',
    '["CAF", "PassSport", "Coupon Sport"]'::jsonb,
    true,
    jsonb_build_array(
      jsonb_build_object('name', 'Paiement en 3 fois', 'installments', 3, 'description', '3 mensualités de 60€'),
      jsonb_build_object('name', 'Paiement en 10 fois', 'installments', 10, 'description', '10 mensualités de 18€')
    ),
    true,
    jsonb_build_array(
      jsonb_build_object('type', 'Covoiturage parents', 'details', 'Groupe WhatsApp dispo'),
      jsonb_build_object('type', 'Tram T3', 'details', 'Arrêt Châteaucreux 8min')
    ),
    jsonb_build_object('pmr_access', true, 'adapted_equipment', false, 'specialized_staff', false, 'sensory_friendly', true),
    jsonb_build_array(
      jsonb_build_object('key', 'certificat_medical', 'mandatory', true, 'label', 'Certificat médical'),
      jsonb_build_object('key', 'autorisation_parentale', 'mandatory', true, 'label', 'Autorisation parentale')
    ),
    jsonb_build_object('seats_total', 20, 'seats_remaining', 12, 'waitlist_enabled', true, 'overbooking_allowed', false),
    jsonb_build_object('rules_text', 'Respect du règlement intérieur du club.', 'acceptance_required', true),
    true
  ),
  
  -- 2. Football ASSE
  (
    (SELECT id FROM public.structures WHERE name = 'Stade Geoffroy-Guichard - École de Football' LIMIT 1),
    'École de Football ASSE',
    'Sport',
    'Formation football avec entraîneurs diplômés. Entraînements techniques, matchs amicaux, esprit d''équipe.',
    ARRAY['https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800', 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800'],
    7, 16,
    ARRAY['football', 'sport collectif', 'ASSE', 'compétition'],
    200, 'Licence FFF incluse',
    '["CAF", "PassSport"]'::jsonb,
    true,
    jsonb_build_array(
      jsonb_build_object('name', 'Paiement en 4 fois', 'installments', 4, 'description', '4x 50€')
    ),
    true,
    jsonb_build_array(
      jsonb_build_object('type', 'Covoiturage', 'details', 'Organisation parents'),
      jsonb_build_object('type', 'Bus C7', 'details', 'Arrêt Stade Geoffroy')
    ),
    jsonb_build_object('pmr_access', true, 'adapted_equipment', false, 'specialized_staff', true, 'sensory_friendly', false),
    jsonb_build_array(
      jsonb_build_object('key', 'certificat_medical', 'mandatory', true, 'label', 'Certificat médical'),
      jsonb_build_object('key', 'photo_identite', 'mandatory', true, 'label', 'Photo d''identité')
    ),
    jsonb_build_object('seats_total', 30, 'seats_remaining', 18, 'waitlist_enabled', true, 'overbooking_allowed', false),
    jsonb_build_object('rules_text', 'Charte sportive ASSE à signer.', 'acceptance_required', true),
    true
  ),
  
  -- 3. Natation
  (
    (SELECT id FROM public.structures WHERE name = 'Piscine Municipale Plaine Achille' LIMIT 1),
    'École de Natation',
    'Sport',
    'Apprentissage natation tous niveaux. Du water polo aux perfectionnements, nageurs débutants à confirmés.',
    ARRAY['https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800', 'https://images.unsplash.com/photo-1560089000-7433a4ebbd64?w=800'],
    6, 15,
    ARRAY['natation', 'piscine', 'sport', 'santé'],
    150, 'Bonnet et lunettes fournis',
    '["CAF", "PassSport", "Coupon Sport"]'::jsonb,
    true,
    jsonb_build_array(
      jsonb_build_object('name', 'Paiement en 3 fois', 'installments', 3, 'description', '3x 50€')
    ),
    false,
    '[]'::jsonb,
    jsonb_build_object('pmr_access', true, 'adapted_equipment', true, 'specialized_staff', true, 'sensory_friendly', true),
    jsonb_build_array(
      jsonb_build_object('key', 'certificat_medical', 'mandatory', true, 'label', 'Certificat médical natation')
    ),
    jsonb_build_object('seats_total', 25, 'seats_remaining', 15, 'waitlist_enabled', true, 'overbooking_allowed', false),
    jsonb_build_object('rules_text', 'Hygiène piscine obligatoire.', 'acceptance_required', true),
    true
  ),
  
  -- 4. Basket
  (
    (SELECT id FROM public.structures WHERE name = 'Gymnase Jean Jaurès' LIMIT 1),
    'Basket Club Jeunes',
    'Sport',
    'Initiation et perfectionnement basket. Mini-basket pour 6-9 ans, poussins/benjamins 10-13, cadets 14-17.',
    ARRAY['https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800', 'https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=800'],
    6, 17,
    ARRAY['basket', 'sport collectif', 'compétition'],
    120, 'Maillots du club fournis',
    '["CAF", "PassSport"]'::jsonb,
    true,
    jsonb_build_array(
      jsonb_build_object('name', 'Paiement en 2 fois', 'installments', 2, 'description', '2x 60€')
    ),
    true,
    jsonb_build_array(
      jsonb_build_object('type', 'Covoiturage', 'details', 'Organisation parents')
    ),
    jsonb_build_object('pmr_access', true, 'adapted_equipment', false, 'specialized_staff', false, 'sensory_friendly', false),
    jsonb_build_array(
      jsonb_build_object('key', 'certificat_medical', 'mandatory', true, 'label', 'Certificat médical')
    ),
    jsonb_build_object('seats_total', 24, 'seats_remaining', 10, 'waitlist_enabled', true, 'overbooking_allowed', false),
    jsonb_build_object('rules_text', 'Fair-play exigé.', 'acceptance_required', true),
    true
  ),
  
  -- 5. Judo
  (
    (SELECT id FROM public.structures WHERE name = 'Gymnase Jean Jaurès' LIMIT 1),
    'Judo Kids',
    'Sport',
    'Judo traditionnel, discipline et respect. Apprentissage chutes, katas, combats. Passages de ceinture.',
    ARRAY['https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800'],
    6, 14,
    ARRAY['judo', 'arts martiaux', 'discipline'],
    140, 'Kimono à fournir',
    '["CAF", "PassSport"]'::jsonb,
    true,
    jsonb_build_array(
      jsonb_build_object('name', 'Paiement en 3 fois', 'installments', 3, 'description', '3x 47€')
    ),
    false,
    '[]'::jsonb,
    jsonb_build_object('pmr_access', true, 'adapted_equipment', false, 'specialized_staff', false, 'sensory_friendly', true),
    jsonb_build_array(
      jsonb_build_object('key', 'certificat_medical', 'mandatory', true, 'label', 'Certificat médical')
    ),
    jsonb_build_object('seats_total', 20, 'seats_remaining', 8, 'waitlist_enabled', true, 'overbooking_allowed', false),
    jsonb_build_object('rules_text', 'Code moral du judo.', 'acceptance_required', true),
    true
  ),
  
  -- 6. Escalade
  (
    (SELECT id FROM public.structures WHERE name = 'Gymnase Jean Jaurès' LIMIT 1),
    'Escalade Jeunes',
    'Sport',
    'Initiation escalade mur artificiel. Sécurité, technique grimpe, confiance en soi.',
    ARRAY['https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800'],
    8, 17,
    ARRAY['escalade', 'grimpe', 'sport'],
    130, 'Matériel sécurité fourni',
    '["PassSport"]'::jsonb,
    false,
    '[]'::jsonb,
    true,
    jsonb_build_array(
      jsonb_build_object('type', 'Covoiturage', 'details', 'Organisation parents')
    ),
    jsonb_build_object('pmr_access', false, 'adapted_equipment', false, 'specialized_staff', false, 'sensory_friendly', false),
    jsonb_build_array(
      jsonb_build_object('key', 'certificat_medical', 'mandatory', true, 'label', 'Certificat médical'),
      jsonb_build_object('key', 'autorisation_parentale', 'mandatory', true, 'label', 'Décharge responsabilité')
    ),
    jsonb_build_object('seats_total', 15, 'seats_remaining', 7, 'waitlist_enabled', true, 'overbooking_allowed', false),
    jsonb_build_object('rules_text', 'Consignes sécurité strictes.', 'acceptance_required', true),
    true
  ),
  
  -- 7. Yoga Kids
  (
    (SELECT id FROM public.structures WHERE name = 'MJC de Montreynaud' LIMIT 1),
    'Yoga Enfants',
    'Sport',
    'Yoga ludique adapté enfants. Postures, respiration, relaxation, concentration.',
    ARRAY['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'],
    6, 12,
    ARRAY['yoga', 'bien-être', 'relaxation'],
    90, 'Tapis fournis',
    '["CAF"]'::jsonb,
    true,
    jsonb_build_array(
      jsonb_build_object('name', 'Paiement en 2 fois', 'installments', 2, 'description', '2x 45€')
    ),
    false,
    '[]'::jsonb,
    jsonb_build_object('pmr_access', true, 'adapted_equipment', true, 'specialized_staff', true, 'sensory_friendly', true),
    jsonb_build_array(),
    jsonb_build_object('seats_total', 12, 'seats_remaining', 5, 'waitlist_enabled', false, 'overbooking_allowed', false),
    jsonb_build_object('rules_text', 'Calme et respect demandés.', 'acceptance_required', false),
    true
  ),
  
  -- 8. Danse Hip-Hop
  (
    (SELECT id FROM public.structures WHERE name = 'MJC de Montreynaud' LIMIT 1),
    'Hip-Hop Dance Academy',
    'Sport',
    'Cours hip-hop débutant à avancé. Chorégraphies, battles, spectacles de fin d''année.',
    ARRAY['https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?w=800'],
    8, 17,
    ARRAY['danse', 'hip-hop', 'urban'],
    110, 'Spectacle de fin d''année inclus',
    '["CAF", "PassSport"]'::jsonb,
    false,
    '[]'::jsonb,
    true,
    jsonb_build_array(
      jsonb_build_object('type', 'Tram T1', 'details', 'Arrêt Montreynaud')
    ),
    jsonb_build_object('pmr_access', true, 'adapted_equipment', false, 'specialized_staff', false, 'sensory_friendly', false),
    jsonb_build_array(),
    jsonb_build_object('seats_total', 18, 'seats_remaining', 9, 'waitlist_enabled', true, 'overbooking_allowed', false),
    jsonb_build_object('rules_text', 'Tenue de sport obligatoire.', 'acceptance_required', false),
    true
  ),
  
  -- 9. Athlétisme
  (
    (SELECT id FROM public.structures WHERE name = 'Stade Geoffroy-Guichard - École de Football' LIMIT 1),
    'Athlétisme Jeunes',
    'Sport',
    'Découverte athlétisme: course, saut, lancer. Développement motricité et endurance.',
    ARRAY['https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800'],
    6, 15,
    ARRAY['athlétisme', 'course', 'sport'],
    100, 'Équipement personnel requis',
    '["CAF", "PassSport"]'::jsonb,
    true,
    jsonb_build_array(
      jsonb_build_object('name', 'Paiement en 2 fois', 'installments', 2, 'description', '2x 50€')
    ),
    true,
    jsonb_build_array(
      jsonb_build_object('type', 'Covoiturage', 'details', 'Organisation parents')
    ),
    jsonb_build_object('pmr_access', true, 'adapted_equipment', true, 'specialized_staff', false, 'sensory_friendly', false),
    jsonb_build_array(
      jsonb_build_object('key', 'certificat_medical', 'mandatory', true, 'label', 'Certificat médical')
    ),
    jsonb_build_object('seats_total', 25, 'seats_remaining', 14, 'waitlist_enabled', false, 'overbooking_allowed', false),
    jsonb_build_object('rules_text', 'Respect des consignes entraîneurs.', 'acceptance_required', true),
    true
  ),
  
  -- 10. Handball
  (
    (SELECT id FROM public.structures WHERE name = 'Gymnase Jean Jaurès' LIMIT 1),
    'Handball Club',
    'Sport',
    'Handball mixte enfants/ados. Technique, stratégie, matchs championnat.',
    ARRAY['https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800'],
    7, 16,
    ARRAY['handball', 'sport collectif', 'compétition'],
    115, 'Maillot club fourni',
    '["CAF", "PassSport"]'::jsonb,
    true,
    jsonb_build_array(
      jsonb_build_object('name', 'Paiement en 2 fois', 'installments', 2, 'description', '2x 58€')
    ),
    false,
    '[]'::jsonb,
    jsonb_build_object('pmr_access', true, 'adapted_equipment', false, 'specialized_staff', false, 'sensory_friendly', false),
    jsonb_build_array(
      jsonb_build_object('key', 'certificat_medical', 'mandatory', true, 'label', 'Certificat médical')
    ),
    jsonb_build_object('seats_total', 22, 'seats_remaining', 11, 'waitlist_enabled', true, 'overbooking_allowed', false),
    jsonb_build_object('rules_text', 'Fair-play exigé.', 'acceptance_required', true),
    true
  );
  
-- Part 1 complete: 10 SPORT activities inserted
-- Continuing with CULTURE (8), LOISIRS (8), SCOLARITÉ (8), VACANCES (6) in next parts...