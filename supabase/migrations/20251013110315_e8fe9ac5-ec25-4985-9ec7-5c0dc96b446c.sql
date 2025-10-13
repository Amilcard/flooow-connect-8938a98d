-- LOISIRS (8 activities)
INSERT INTO public.activities (
  structure_id, title, category, description, images, age_min, age_max, tags,
  price_base, price_note, accepts_aid_types, payment_echelonned, payment_plans,
  covoiturage_enabled, transport_options, accessibility_checklist, documents_required,
  capacity_policy, rules_acceptance_json, published
)
VALUES
  -- 19. Centre Aéré
  (
    (SELECT id FROM public.structures WHERE name = 'Centre Aéré Les Petits Loups' LIMIT 1),
    'Centre de Loisirs Mercredis',
    'Loisirs',
    'Activités variées mercredis: sports, jeux, créations manuelles. Sorties mensuelles.',
    ARRAY['https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800'],
    6, 12,
    ARRAY['centre aéré', 'mercredis', 'loisirs'],
    8, 'Par mercredi, goûter inclus',
    '["CAF"]'::jsonb,
    false,
    '[]'::jsonb,
    false,
    '[]'::jsonb,
    jsonb_build_object('pmr_access', true, 'adapted_equipment', true, 'specialized_staff', true, 'sensory_friendly', true),
    jsonb_build_array(
      jsonb_build_object('key', 'fiche_sanitaire', 'mandatory', true, 'label', 'Fiche sanitaire'),
      jsonb_build_object('key', 'autorisation_parentale', 'mandatory', true, 'label', 'Autorisation sortie')
    ),
    jsonb_build_object('seats_total', 40, 'seats_remaining', 22, 'waitlist_enabled', true, 'overbooking_allowed', false),
    jsonb_build_object('rules_text', 'Règlement centre de loisirs.', 'acceptance_required', true),
    true
  ),
  
  -- 20. Club Robotique
  (
    (SELECT id FROM public.structures WHERE name = 'La Rotonde - Espace Sciences' LIMIT 1),
    'Club Robotique et Code',
    'Loisirs',
    'Initiation programmation, robots Lego, Arduino. Projets collectifs, compétitions.',
    ARRAY['https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800'],
    9, 16,
    ARRAY['robotique', 'code', 'STEM', 'sciences'],
    120, 'Matériel prêté',
    '["CAF", "PassSport"]'::jsonb,
    true,
    jsonb_build_array(
      jsonb_build_object('name', 'Paiement en 3 fois', 'installments', 3, 'description', '3x 40€')
    ),
    false,
    '[]'::jsonb,
    jsonb_build_object('pmr_access', true, 'adapted_equipment', true, 'specialized_staff', false, 'sensory_friendly', false),
    jsonb_build_array(),
    jsonb_build_object('seats_total', 14, 'seats_remaining', 6, 'waitlist_enabled', true, 'overbooking_allowed', false),
    jsonb_build_object('rules_text', 'Respect matériel informatique.', 'acceptance_required', false),
    true
  ),
  
  -- 21. Échecs
  (
    (SELECT id FROM public.structures WHERE name = 'Bibliothèque Municipale Tarentaize' LIMIT 1),
    'Club d''Échecs Jeunes',
    'Loisirs',
    'Apprentissage échecs, tournois internes, compétitions régionales.',
    ARRAY['https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800'],
    7, 17,
    ARRAY['échecs', 'stratégie', 'jeu'],
    40, 'Matériel fourni',
    '["CAF"]'::jsonb,
    false,
    '[]'::jsonb,
    false,
    '[]'::jsonb,
    jsonb_build_object('pmr_access', true, 'adapted_equipment', false, 'specialized_staff', false, 'sensory_friendly', true),
    jsonb_build_array(),
    jsonb_build_object('seats_total', 20, 'seats_remaining', 11, 'waitlist_enabled', false, 'overbooking_allowed', false),
    jsonb_build_object('rules_text', 'Silence et concentration requis.', 'acceptance_required', false),
    true
  ),
  
  -- 22. Expériences Scientifiques
  (
    (SELECT id FROM public.structures WHERE name = 'La Rotonde - Espace Sciences' LIMIT 1),
    'Atelier Sciences Expérimentales',
    'Loisirs',
    'Expériences chimie, physique, astronomie. Méthode scientifique ludique.',
    ARRAY['https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800'],
    8, 14,
    ARRAY['sciences', 'expériences', 'STEM'],
    90, 'Blouse fournie',
    '["CAF"]'::jsonb,
    false,
    '[]'::jsonb,
    true,
    jsonb_build_array(
      jsonb_build_object('type', 'Bus C14', 'details', 'Arrêt La Rotonde')
    ),
    jsonb_build_object('pmr_access', true, 'adapted_equipment', true, 'specialized_staff', true, 'sensory_friendly', true),
    jsonb_build_array(
      jsonb_build_object('key', 'autorisation_parentale', 'mandatory', true, 'label', 'Autorisation manip chimie')
    ),
    jsonb_build_object('seats_total', 16, 'seats_remaining', 9, 'waitlist_enabled', false, 'overbooking_allowed', false),
    jsonb_build_object('rules_text', 'Consignes sécurité labo.', 'acceptance_required', true),
    true
  ),
  
  -- 23. Jardinage Enfants
  (
    (SELECT id FROM public.structures WHERE name = 'MJC de Montreynaud' LIMIT 1),
    'Jardin Partagé Enfants',
    'Loisirs',
    'Jardinage bio, potager, compost. Apprentissage cycles naturels, récoltes.',
    ARRAY['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800'],
    6, 13,
    ARRAY['jardinage', 'nature', 'écologie'],
    50, 'Récoltes partagées',
    '["CAF"]'::jsonb,
    false,
    '[]'::jsonb,
    false,
    '[]'::jsonb,
    jsonb_build_object('pmr_access', false, 'adapted_equipment', false, 'specialized_staff', false, 'sensory_friendly', true),
    jsonb_build_array(),
    jsonb_build_object('seats_total', 18, 'seats_remaining', 10, 'waitlist_enabled', false, 'overbooking_allowed', false),
    jsonb_build_object('rules_text', 'Bottes et vêtements de jardin.', 'acceptance_required', false),
    true
  ),
  
  -- 24. Jeux de Société
  (
    (SELECT id FROM public.structures WHERE name = 'Bibliothèque Municipale Tarentaize' LIMIT 1),
    'Club Jeux de Société',
    'Loisirs',
    'Découverte jeux modernes, coopératifs, stratégie. Ludothèque gratuite.',
    ARRAY['https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=800'],
    6, 15,
    ARRAY['jeux', 'société', 'ludique'],
    0, 'Gratuit',
    '[]'::jsonb,
    false,
    '[]'::jsonb,
    false,
    '[]'::jsonb,
    jsonb_build_object('pmr_access', true, 'adapted_equipment', false, 'specialized_staff', false, 'sensory_friendly', true),
    jsonb_build_array(),
    jsonb_build_object('seats_total', 25, 'seats_remaining', 25, 'waitlist_enabled', false, 'overbooking_allowed', false),
    jsonb_build_object('rules_text', 'Respect matériel de jeu.', 'acceptance_required', false),
    true
  ),
  
  -- 25. Couture Créative
  (
    (SELECT id FROM public.structures WHERE name = 'MJC de Montreynaud' LIMIT 1),
    'Atelier Couture Enfants',
    'Loisirs',
    'Initiation couture, créations textiles, upcycling. Projets personnels.',
    ARRAY['https://images.unsplash.com/photo-1542296332-2e4473faf563?w=800'],
    9, 16,
    ARRAY['couture', 'créatif', 'textile'],
    70, 'Machines fournies',
    '["CAF"]'::jsonb,
    false,
    '[]'::jsonb,
    false,
    '[]'::jsonb,
    jsonb_build_object('pmr_access', true, 'adapted_equipment', true, 'specialized_staff', false, 'sensory_friendly', false),
    jsonb_build_array(
      jsonb_build_object('key', 'autorisation_parentale', 'mandatory', true, 'label', 'Autorisation machines')
    ),
    jsonb_build_object('seats_total', 10, 'seats_remaining', 4, 'waitlist_enabled', true, 'overbooking_allowed', false),
    jsonb_build_object('rules_text', 'Prudence avec aiguilles et ciseaux.', 'acceptance_required', true),
    true
  ),
  
  -- 26. Cuisine Enfants
  (
    (SELECT id FROM public.structures WHERE name = 'Centre Aéré Les Petits Loups' LIMIT 1),
    'Atelier Cuisine Junior',
    'Loisirs',
    'Pâtisserie, cuisine du monde, diététique. Recettes adaptées enfants.',
    ARRAY['https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800'],
    7, 14,
    ARRAY['cuisine', 'pâtisserie', 'gourmand'],
    60, 'Ingrédients fournis, dégustation',
    '["CAF"]'::jsonb,
    false,
    '[]'::jsonb,
    false,
    '[]'::jsonb,
    jsonb_build_object('pmr_access', true, 'adapted_equipment', true, 'specialized_staff', true, 'sensory_friendly', true),
    jsonb_build_array(
      jsonb_build_object('key', 'allergies', 'mandatory', true, 'label', 'Déclaration allergies')
    ),
    jsonb_build_object('seats_total', 12, 'seats_remaining', 6, 'waitlist_enabled', false, 'overbooking_allowed', false),
    jsonb_build_object('rules_text', 'Hygiène mains, charlotte obligatoire.', 'acceptance_required', true),
    true
  );

-- Part 3 complete: 8 LOISIRS activities inserted