-- Migration : Ajouter Grenoble comme 5ème territoire de test

-- 1. Créer le territoire Grenoble
INSERT INTO public.territories (id, name, type, postal_codes, covered, active, parent_id, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111115',
  'Territoire Test Grenoble',
  'commune',
  ARRAY['38000', '38100', '38700'],
  true,
  true,
  '1c3292fd-4297-452e-b970-d0dbce7c04fb', -- Auvergne-Rhône-Alpes
  now(),
  now()
);

-- 2. Ajouter les codes postaux de Grenoble dans la table postal_codes
INSERT INTO public.postal_codes (code, city, territory_id, created_at)
VALUES
  ('38000', 'Grenoble', '11111111-1111-1111-1111-111111111115', now()),
  ('38100', 'Grenoble', '11111111-1111-1111-1111-111111111115', now()),
  ('38700', 'La Tronche', '11111111-1111-1111-1111-111111111115', now()),
  ('38320', 'Eybens', '11111111-1111-1111-1111-111111111115', now()),
  ('38130', 'Échirolles', '11111111-1111-1111-1111-111111111115', now()),
  ('38400', 'Saint-Martin-d''Hères', '11111111-1111-1111-1111-111111111115', now());

-- 3. Dupliquer les structures depuis Saint-Étienne vers Grenoble
INSERT INTO public.structures (id, name, address, contact_json, accessibility_profile, territory_id, location, created_at, updated_at)
SELECT
  gen_random_uuid(),
  name,
  CASE
    WHEN address LIKE '%Saint-Étienne%' THEN replace(address, 'Saint-Étienne', 'Grenoble')
    WHEN address LIKE '%42%' THEN replace(replace(address, '42000', '38000'), '42100', '38100')
    ELSE '1 Place de Verdun, 38000 Grenoble'
  END,
  contact_json,
  accessibility_profile,
  '11111111-1111-1111-1111-111111111115',
  ST_SetSRID(ST_MakePoint(5.7245, 45.1885), 4326), -- Coordonnées GPS de Grenoble
  now(),
  now()
FROM public.structures
WHERE territory_id = '0d533821-5995-420c-90c8-aa2a5ba78e93'; -- Saint-Étienne source

-- 4. Dupliquer les activités depuis Saint-Étienne vers Grenoble
INSERT INTO public.activities (
  id, structure_id, title, category, description, tags, images, video_url,
  price_base, price_note, accepts_aid_types, payment_echelonned, payment_plans,
  age_min, age_max, accessibility_checklist, covoiturage_enabled, capacity_policy,
  transport_options, transport_meta, documents_required, rules_acceptance_json,
  published, external_portal_url, webhook_url_for_docs, is_health_focused, is_apa,
  period_type, vacation_periods, duration_days, has_accommodation, categories,
  activity_purpose, price_unit, vacation_type, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  new_struct.id,
  orig_act.title,
  orig_act.category,
  orig_act.description,
  orig_act.tags,
  orig_act.images,
  orig_act.video_url,
  orig_act.price_base,
  orig_act.price_note,
  orig_act.accepts_aid_types,
  orig_act.payment_echelonned,
  orig_act.payment_plans,
  orig_act.age_min,
  orig_act.age_max,
  orig_act.accessibility_checklist,
  orig_act.covoiturage_enabled,
  orig_act.capacity_policy,
  orig_act.transport_options,
  orig_act.transport_meta,
  orig_act.documents_required,
  orig_act.rules_acceptance_json,
  orig_act.published,
  orig_act.external_portal_url,
  orig_act.webhook_url_for_docs,
  orig_act.is_health_focused,
  orig_act.is_apa,
  orig_act.period_type,
  orig_act.vacation_periods,
  orig_act.duration_days,
  orig_act.has_accommodation,
  orig_act.categories,
  orig_act.activity_purpose,
  orig_act.price_unit,
  orig_act.vacation_type,
  now(),
  now()
FROM public.activities orig_act
JOIN public.structures orig_struct ON orig_act.structure_id = orig_struct.id
JOIN public.structures new_struct ON new_struct.territory_id = '11111111-1111-1111-1111-111111111115'
WHERE orig_struct.territory_id = '0d533821-5995-420c-90c8-aa2a5ba78e93'
  AND new_struct.name = orig_struct.name;

-- 5. Dupliquer les slots depuis Saint-Étienne vers Grenoble
INSERT INTO public.availability_slots (
  id, activity_id, start, "end", recurrence, seats_total, seats_remaining,
  seats_available, price_override, day_of_week, time_start, time_end,
  start_date, end_date, recurrence_type, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  new_act.id,
  orig_slot.start,
  orig_slot."end",
  orig_slot.recurrence,
  orig_slot.seats_total,
  orig_slot.seats_remaining,
  orig_slot.seats_available,
  orig_slot.price_override,
  orig_slot.day_of_week,
  orig_slot.time_start,
  orig_slot.time_end,
  orig_slot.start_date,
  orig_slot.end_date,
  orig_slot.recurrence_type,
  now(),
  now()
FROM public.availability_slots orig_slot
JOIN public.activities orig_act ON orig_slot.activity_id = orig_act.id
JOIN public.structures orig_struct ON orig_act.structure_id = orig_struct.id
JOIN public.structures new_struct ON new_struct.territory_id = '11111111-1111-1111-1111-111111111115'
  AND new_struct.name = orig_struct.name
JOIN public.activities new_act ON new_act.structure_id = new_struct.id
  AND new_act.title = orig_act.title
WHERE orig_struct.territory_id = '0d533821-5995-420c-90c8-aa2a5ba78e93';