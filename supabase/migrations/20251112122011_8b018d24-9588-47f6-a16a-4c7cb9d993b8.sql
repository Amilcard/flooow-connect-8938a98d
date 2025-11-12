
-- Migration B.1: Dupliquer les activités de Saint-Étienne vers Paris, Lyon, Marseille, Toulouse

-- Dupliquer vers Paris
INSERT INTO activities (
  structure_id, title, category, description, tags, images, video_url,
  price_base, price_note, price_unit, accepts_aid_types, payment_echelonned, payment_plans,
  age_min, age_max, period_type, vacation_periods, vacation_type, duration_days, has_accommodation,
  accessibility_checklist, covoiturage_enabled, capacity_policy, transport_options,
  documents_required, rules_acceptance_json, external_portal_url, webhook_url_for_docs,
  transport_meta, is_health_focused, is_apa, activity_purpose, published, categories
)
SELECT 
  (SELECT id FROM structures WHERE territory_id = '11111111-1111-1111-1111-111111111111' LIMIT 1) as structure_id,
  title, category, description, tags, images, video_url,
  price_base, price_note, price_unit, accepts_aid_types, payment_echelonned, payment_plans,
  age_min, age_max, period_type, vacation_periods, vacation_type, duration_days, has_accommodation,
  accessibility_checklist, covoiturage_enabled, capacity_policy, transport_options,
  documents_required, rules_acceptance_json, external_portal_url, webhook_url_for_docs,
  transport_meta, is_health_focused, is_apa, activity_purpose, published, categories
FROM activities
WHERE structure_id IN (SELECT id FROM structures WHERE territory_id = '0d533821-5995-420c-90c8-aa2a5ba78e93');

-- Dupliquer vers Lyon
INSERT INTO activities (
  structure_id, title, category, description, tags, images, video_url,
  price_base, price_note, price_unit, accepts_aid_types, payment_echelonned, payment_plans,
  age_min, age_max, period_type, vacation_periods, vacation_type, duration_days, has_accommodation,
  accessibility_checklist, covoiturage_enabled, capacity_policy, transport_options,
  documents_required, rules_acceptance_json, external_portal_url, webhook_url_for_docs,
  transport_meta, is_health_focused, is_apa, activity_purpose, published, categories
)
SELECT 
  (SELECT id FROM structures WHERE territory_id = '11111111-1111-1111-1111-111111111112' LIMIT 1) as structure_id,
  title, category, description, tags, images, video_url,
  price_base, price_note, price_unit, accepts_aid_types, payment_echelonned, payment_plans,
  age_min, age_max, period_type, vacation_periods, vacation_type, duration_days, has_accommodation,
  accessibility_checklist, covoiturage_enabled, capacity_policy, transport_options,
  documents_required, rules_acceptance_json, external_portal_url, webhook_url_for_docs,
  transport_meta, is_health_focused, is_apa, activity_purpose, published, categories
FROM activities
WHERE structure_id IN (SELECT id FROM structures WHERE territory_id = '0d533821-5995-420c-90c8-aa2a5ba78e93');

-- Dupliquer vers Marseille
INSERT INTO activities (
  structure_id, title, category, description, tags, images, video_url,
  price_base, price_note, price_unit, accepts_aid_types, payment_echelonned, payment_plans,
  age_min, age_max, period_type, vacation_periods, vacation_type, duration_days, has_accommodation,
  accessibility_checklist, covoiturage_enabled, capacity_policy, transport_options,
  documents_required, rules_acceptance_json, external_portal_url, webhook_url_for_docs,
  transport_meta, is_health_focused, is_apa, activity_purpose, published, categories
)
SELECT 
  (SELECT id FROM structures WHERE territory_id = '11111111-1111-1111-1111-111111111113' LIMIT 1) as structure_id,
  title, category, description, tags, images, video_url,
  price_base, price_note, price_unit, accepts_aid_types, payment_echelonned, payment_plans,
  age_min, age_max, period_type, vacation_periods, vacation_type, duration_days, has_accommodation,
  accessibility_checklist, covoiturage_enabled, capacity_policy, transport_options,
  documents_required, rules_acceptance_json, external_portal_url, webhook_url_for_docs,
  transport_meta, is_health_focused, is_apa, activity_purpose, published, categories
FROM activities
WHERE structure_id IN (SELECT id FROM structures WHERE territory_id = '0d533821-5995-420c-90c8-aa2a5ba78e93');

-- Dupliquer vers Toulouse
INSERT INTO activities (
  structure_id, title, category, description, tags, images, video_url,
  price_base, price_note, price_unit, accepts_aid_types, payment_echelonned, payment_plans,
  age_min, age_max, period_type, vacation_periods, vacation_type, duration_days, has_accommodation,
  accessibility_checklist, covoiturage_enabled, capacity_policy, transport_options,
  documents_required, rules_acceptance_json, external_portal_url, webhook_url_for_docs,
  transport_meta, is_health_focused, is_apa, activity_purpose, published, categories
)
SELECT 
  (SELECT id FROM structures WHERE territory_id = '11111111-1111-1111-1111-111111111114' LIMIT 1) as structure_id,
  title, category, description, tags, images, video_url,
  price_base, price_note, price_unit, accepts_aid_types, payment_echelonned, payment_plans,
  age_min, age_max, period_type, vacation_periods, vacation_type, duration_days, has_accommodation,
  accessibility_checklist, covoiturage_enabled, capacity_policy, transport_options,
  documents_required, rules_acceptance_json, external_portal_url, webhook_url_for_docs,
  transport_meta, is_health_focused, is_apa, activity_purpose, published, categories
FROM activities
WHERE structure_id IN (SELECT id FROM structures WHERE territory_id = '0d533821-5995-420c-90c8-aa2a5ba78e93');
