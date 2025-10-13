-- Add missing fields to activities table
ALTER TABLE public.activities 
  ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS price_note text,
  ADD COLUMN IF NOT EXISTS transport_options jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS documents_required jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS rules_acceptance_json jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS external_portal_url text,
  ADD COLUMN IF NOT EXISTS webhook_url_for_docs text,
  ADD COLUMN IF NOT EXISTS published boolean DEFAULT false;

-- Rename price to price_base and accessibility to accessibility_checklist for clarity
ALTER TABLE public.activities 
  RENAME COLUMN price TO price_base;
ALTER TABLE public.activities 
  RENAME COLUMN accessibility TO accessibility_checklist;

-- Add missing fields to structures table
ALTER TABLE public.structures 
  ADD COLUMN IF NOT EXISTS location geography(POINT, 4326);

-- Create spatial index for location queries
CREATE INDEX IF NOT EXISTS idx_structures_location ON public.structures USING GIST (location);

-- Add missing fields to bookings table
ALTER TABLE public.bookings 
  ADD COLUMN IF NOT EXISTS express_flag boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS idempotency_key text UNIQUE;

-- Create index on idempotency_key for fast duplicate detection
CREATE INDEX IF NOT EXISTS idx_bookings_idempotency_key ON public.bookings (idempotency_key) WHERE idempotency_key IS NOT NULL;

-- Insert test territory
INSERT INTO public.territories (name, covered, config_json)
VALUES ('Métropole de Lyon', true, '{"features": ["accessibility", "financial_aid"]}'::jsonb)
ON CONFLICT DO NOTHING;

-- Insert test structure: TC Villeurbannais
INSERT INTO public.structures (
  name,
  address,
  location,
  contact_json,
  accessibility_profile,
  territory_id
) VALUES (
  'Tennis Club de Villeurbanne',
  '23 Rue Racine, 69100 Villeurbanne',
  ST_GeomFromText('POINT(4.8798 45.7667)', 4326)::geography,
  jsonb_build_object(
    'email', 'contact@tcvilleurbannais.fr',
    'phone', '+33 4 78 89 12 34',
    'website', 'https://www.tcvilleurbannais.fr'
  ),
  jsonb_build_object(
    'pmr_parking', true,
    'elevator', false,
    'accessible_toilets', true,
    'ramp_access', true
  ),
  (SELECT id FROM public.territories WHERE name = 'Métropole de Lyon' LIMIT 1)
)
ON CONFLICT DO NOTHING;

-- Insert test activity: Tennis - TC Villeurbannais
INSERT INTO public.activities (
  structure_id,
  title,
  category,
  description,
  images,
  video_url,
  age_min,
  age_max,
  tags,
  price_base,
  price_note,
  accepts_aid_types,
  payment_echelonned,
  payment_plans,
  covoiturage_enabled,
  transport_options,
  accessibility_checklist,
  documents_required,
  capacity_policy,
  rules_acceptance_json,
  external_portal_url,
  published
) VALUES (
  (SELECT id FROM public.structures WHERE name = 'Tennis Club de Villeurbanne' LIMIT 1),
  'Tennis - TC Villeurbannais',
  'Sport',
  'Cours de tennis pour enfants et adolescents au Tennis Club de Villeurbanne. Apprentissage technique et jeu en groupe.',
  ARRAY['https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800', 'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=800'],
  'https://www.youtube.com/watch?v=example',
  6,
  16,
  ARRAY['tennis', 'sport', 'plein air', 'initiation'],
  180,
  'Tarif annuel, matériel fourni',
  '["CAF", "PassSport", "Coupon Sport"]'::jsonb,
  true,
  jsonb_build_array(
    jsonb_build_object('name', 'Paiement en 3 fois', 'installments', 3, 'description', '3 mensualités de 60€'),
    jsonb_build_object('name', 'Paiement en 10 fois', 'installments', 10, 'description', '10 mensualités de 18€')
  ),
  true,
  jsonb_build_array(
    jsonb_build_object('type', 'Covoiturage parents', 'details', 'Groupe WhatsApp disponible'),
    jsonb_build_object('type', 'Bus ligne C3', 'details', 'Arrêt Charpennes à 5min')
  ),
  jsonb_build_object(
    'pmr_access', true,
    'adapted_equipment', false,
    'specialized_staff', false,
    'sensory_friendly', true
  ),
  jsonb_build_array(
    jsonb_build_object('key', 'certificat_medical', 'mandatory', true, 'label', 'Certificat médical'),
    jsonb_build_object('key', 'autorisation_parentale', 'mandatory', true, 'label', 'Autorisation parentale'),
    jsonb_build_object('key', 'photo_identite', 'mandatory', false, 'label', 'Photo d''identité')
  ),
  jsonb_build_object(
    'seats_total', 20,
    'seats_remaining', 8,
    'waitlist_enabled', true,
    'overbooking_allowed', false
  ),
  jsonb_build_object(
    'rules_text', 'Les participants doivent respecter le règlement intérieur du club.',
    'acceptance_required', true
  ),
  'https://www.tcvilleurbannais.fr/inscriptions',
  true
)
ON CONFLICT DO NOTHING;