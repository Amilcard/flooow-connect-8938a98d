-- ============================================================
-- VUES LECTURE SEULE - Scénarios de test (0 risque de casse)
-- Date: 2025-10-28
-- Purpose: Visualiser données pour scénarios 1,5,6,7,8,10 SANS modifier structure
-- Mode: READ-ONLY - Aucune table créée, aucune colonne ajoutée
-- ============================================================

-- ============================================================
-- SCÉNARIO 1: FRATRIE OPTIMISATION
-- ============================================================

-- Vue: Enfants d'une même famille (fratrie)
CREATE OR REPLACE VIEW vw_fratrie_groups AS
SELECT
  p.id as parent_id,
  p.email as parent_email,
  p.family_code,
  COUNT(c.id) as nombre_enfants,
  ARRAY_AGG(c.id) as child_ids,
  ARRAY_AGG(c.first_name) as prenoms,
  ARRAY_AGG(EXTRACT(YEAR FROM AGE(c.dob))::INTEGER) as ages
FROM public.profiles p
INNER JOIN public.children c ON c.user_id = p.id
GROUP BY p.id, p.email, p.family_code
HAVING COUNT(c.id) >= 2; -- Au moins 2 enfants

COMMENT ON VIEW vw_fratrie_groups IS 'Familles avec 2+ enfants (fratrie) - pour calcul réductions';

-- Vue: Réservations fratrie (2 enfants du même parent)
CREATE OR REPLACE VIEW vw_fratrie_bookings AS
SELECT
  b1.id as booking1_id,
  b2.id as booking2_id,
  b1.user_id as parent_id,
  b1.child_id as child1_id,
  b2.child_id as child2_id,
  c1.first_name as child1_name,
  c2.first_name as child2_name,
  b1.activity_id as activity1_id,
  b2.activity_id as activity2_id,
  a1.title as activity1_title,
  a2.title as activity2_title,
  a1.price_base as price1,
  a2.price_base as price2,
  (a1.price_base + a2.price_base) as total_sans_reduction,
  -- Simulation réduction fratrie 10%
  ROUND((a1.price_base + a2.price_base) * 0.90, 2) as total_avec_reduction_10pct,
  b1.status as status1,
  b2.status as status2
FROM public.bookings b1
INNER JOIN public.bookings b2 ON b1.user_id = b2.user_id
  AND b1.child_id < b2.child_id -- Éviter doublons (A,B) et (B,A)
INNER JOIN public.children c1 ON c1.id = b1.child_id
INNER JOIN public.children c2 ON c2.id = b2.child_id
INNER JOIN public.activities a1 ON a1.id = b1.activity_id
INNER JOIN public.activities a2 ON a2.id = b2.activity_id
WHERE b1.created_at::date = b2.created_at::date; -- Réservées le même jour

COMMENT ON VIEW vw_fratrie_bookings IS 'Paires de réservations fratrie avec simulation réduction 10%';

-- ============================================================
-- SCÉNARIO 5: DEMI-BOURSE CONDITION ASSIDUITÉ
-- ============================================================

-- Vue: Simulation présences (basée sur slots passés)
-- Note: Données fictives car pas de table attendance
CREATE OR REPLACE VIEW vw_attendance_simulation AS
SELECT
  b.id as booking_id,
  b.child_id,
  c.first_name,
  a.title as activity_title,
  COUNT(s.id) as total_sessions_passees,
  -- Simulation: 80% présence aléatoire
  ROUND(COUNT(s.id) * 0.80) as presences_estimees,
  ROUND(0.80 * 100, 2) as taux_presence_pct,
  CASE
    WHEN 0.80 >= 0.75 THEN 'Seuil atteint - Aide validée'
    ELSE 'Insuffisant - Aide refusée'
  END as statut_aide_conditionnelle
FROM public.bookings b
INNER JOIN public.children c ON c.id = b.child_id
INNER JOIN public.activities a ON a.id = b.activity_id
LEFT JOIN public.availability_slots s ON s.activity_id = b.activity_id
  AND s.start < NOW() -- Créneaux passés uniquement
WHERE b.status = 'validee'
GROUP BY b.id, b.child_id, c.first_name, a.title;

COMMENT ON VIEW vw_attendance_simulation IS 'Simulation taux assiduité (fictif, table attendance manquante)';

-- ============================================================
-- SCÉNARIO 6: ACCUEIL D'URGENCE (PLACEMENT RÉCENT)
-- ============================================================

-- Vue: Réservations récentes (dernières 48h) - candidats urgence
CREATE OR REPLACE VIEW vw_urgence_candidates AS
SELECT
  b.id as booking_id,
  b.created_at,
  EXTRACT(EPOCH FROM (NOW() - b.created_at)) / 3600 as heures_depuis_creation,
  b.child_id,
  c.first_name,
  b.activity_id,
  a.title as activity_title,
  s.start as debut_activite,
  EXTRACT(EPOCH FROM (s.start - b.created_at)) / 3600 as delai_avant_activite_h,
  b.status,
  CASE
    WHEN b.created_at > NOW() - INTERVAL '48 hours'
      AND s.start < NOW() + INTERVAL '7 days'
    THEN 'URGENCE - Traitement prioritaire'
    ELSE 'Normal'
  END as niveau_urgence_estime
FROM public.bookings b
INNER JOIN public.children c ON c.id = b.child_id
INNER JOIN public.activities a ON a.id = b.activity_id
LEFT JOIN public.availability_slots s ON s.id = b.slot_id
WHERE b.created_at > NOW() - INTERVAL '7 days'
ORDER BY b.created_at DESC;

COMMENT ON VIEW vw_urgence_candidates IS 'Réservations récentes avec délais (simulation urgence)';

-- ============================================================
-- SCÉNARIO 7: WAITLIST - INCLUSIVE SATURÉE
-- ============================================================

-- Vue: Activités inclusives saturées
CREATE OR REPLACE VIEW vw_inclusive_waitlist_needed AS
SELECT
  a.id as activity_id,
  a.title,
  a.category,
  a.accessibility_checklist,
  a.accessibility_checklist->>'pmr_access' as pmr_access,
  a.accessibility_checklist->>'adapted_equipment' as adapted_equipment,
  a.accessibility_checklist->>'specialized_staff' as specialized_staff,
  a.capacity_policy->>'waitlist_enabled' as waitlist_enabled,
  COUNT(s.id) as total_slots,
  SUM(s.seats_total) as capacite_totale,
  SUM(s.seats_remaining) as places_restantes,
  ROUND(
    (SUM(s.seats_total) - SUM(s.seats_remaining))::numeric /
    NULLIF(SUM(s.seats_total), 0) * 100,
    2
  ) as taux_remplissage_pct,
  CASE
    WHEN SUM(s.seats_remaining) = 0 THEN 'SATURÉ - Waitlist nécessaire'
    WHEN SUM(s.seats_remaining) <= 3 THEN 'Presque plein'
    ELSE 'Disponible'
  END as statut_disponibilite
FROM public.activities a
LEFT JOIN public.availability_slots s ON s.activity_id = a.id
WHERE a.published = true
  AND (
    a.accessibility_checklist->>'pmr_access' = 'true' OR
    a.accessibility_checklist->>'adapted_equipment' = 'true' OR
    a.accessibility_checklist->>'specialized_staff' = 'true'
  )
GROUP BY a.id, a.title, a.category, a.accessibility_checklist, a.capacity_policy
ORDER BY taux_remplissage_pct DESC;

COMMENT ON VIEW vw_inclusive_waitlist_needed IS 'Activités inclusives saturées nécessitant waitlist';

-- Vue: Alternatives inclusives disponibles
CREATE OR REPLACE VIEW vw_inclusive_alternatives AS
SELECT
  a.id as activity_id,
  a.title,
  a.category,
  a.age_min,
  a.age_max,
  a.price_base,
  a.accessibility_checklist,
  st.name as structure_name,
  st.address,
  COUNT(s.id) FILTER (WHERE s.seats_remaining > 0) as slots_disponibles,
  SUM(s.seats_remaining) as total_places_disponibles
FROM public.activities a
INNER JOIN public.structures st ON st.id = a.structure_id
LEFT JOIN public.availability_slots s ON s.activity_id = a.id
  AND s.start > NOW()
WHERE a.published = true
  AND (
    a.accessibility_checklist->>'pmr_access' = 'true' OR
    a.accessibility_checklist->>'adapted_equipment' = 'true' OR
    a.accessibility_checklist->>'specialized_staff' = 'true'
  )
GROUP BY a.id, a.title, a.category, a.age_min, a.age_max, a.price_base,
         a.accessibility_checklist, st.name, st.address
HAVING SUM(s.seats_remaining) > 0
ORDER BY total_places_disponibles DESC;

COMMENT ON VIEW vw_inclusive_alternatives IS 'Activités inclusives avec places disponibles';

-- ============================================================
-- SCÉNARIO 8: QUARTIER PILOTE A/B
-- ============================================================

-- Vue: Métriques par zone (INSEE code)
CREATE OR REPLACE VIEW vw_ab_metrics_by_zone AS
SELECT
  p.city_insee as zone_code,
  -- Inscriptions
  COUNT(DISTINCT b.id) as total_inscriptions,
  COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'validee') as inscriptions_validees,
  COUNT(DISTINCT b.id) FILTER (WHERE b.created_at > NOW() - INTERVAL '3 months') as inscriptions_3_derniers_mois,

  -- Enfants
  COUNT(DISTINCT c.id) as total_enfants,
  COUNT(DISTINCT c.id) FILTER (WHERE c.accessibility_flags != '{}') as enfants_besoins_specifiques,

  -- Aides
  COUNT(DISTINCT ais.id) as simulations_aides,
  COALESCE(AVG(ais.total_aid_amount), 0) as aide_moyenne,
  COALESCE(SUM(ais.total_aid_amount), 0) as aide_totale,

  -- Mobilité
  COUNT(DISTINCT b.id) FILTER (
    WHERE EXISTS (
      SELECT 1 FROM activities a
      WHERE a.id = b.activity_id
      AND a.transport_options != '[]'::jsonb
    )
  ) as inscriptions_avec_transport,

  -- Taux conversion
  ROUND(
    COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'validee')::numeric /
    NULLIF(COUNT(DISTINCT b.id), 0) * 100,
    2
  ) as taux_validation_pct

FROM public.profiles p
LEFT JOIN public.children c ON c.user_id = p.id
LEFT JOIN public.bookings b ON b.user_id = p.id
LEFT JOIN public.aid_simulations ais ON ais.user_id = p.id
WHERE p.city_insee IS NOT NULL
GROUP BY p.city_insee
ORDER BY total_inscriptions DESC;

COMMENT ON VIEW vw_ab_metrics_by_zone IS 'Métriques agrégées par code INSEE pour A/B testing zones';

-- Vue: Comparaison avant/après par période
CREATE OR REPLACE VIEW vw_ab_temporal_comparison AS
SELECT
  DATE_TRUNC('month', b.created_at) as mois,
  p.city_insee as zone_code,
  COUNT(DISTINCT b.id) as inscriptions,
  COUNT(DISTINCT b.child_id) as enfants_uniques,
  AVG(a.price_base) as prix_moyen,
  COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'validee') as taux_validation
FROM public.bookings b
INNER JOIN public.profiles p ON p.id = b.user_id
LEFT JOIN public.activities a ON a.id = b.activity_id
WHERE p.city_insee IS NOT NULL
GROUP BY DATE_TRUNC('month', b.created_at), p.city_insee
ORDER BY mois DESC, inscriptions DESC;

COMMENT ON VIEW vw_ab_temporal_comparison IS 'Évolution mensuelle par zone pour mesurer impact pilote';

-- ============================================================
-- SCÉNARIO 9: DASHBOARD FINANCEUR (déjà implémenté)
-- ============================================================

-- Vue: KPIs financeur global
CREATE OR REPLACE VIEW vw_dashboard_financeur_kpis AS
SELECT
  -- Enfants
  COUNT(DISTINCT b.child_id) as total_enfants_inscrits,
  COUNT(DISTINCT b.child_id) FILTER (
    WHERE EXISTS (
      SELECT 1 FROM children c
      WHERE c.id = b.child_id
      AND c.accessibility_flags != '{}'
    )
  ) as enfants_handicap,

  -- Inscriptions
  COUNT(DISTINCT b.id) as total_inscriptions,
  COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'validee') as inscriptions_validees,

  -- Aides financières
  COUNT(DISTINCT ais.id) as simulations_aides,
  COALESCE(SUM(ais.total_aid_amount), 0) as montant_total_aides,
  COALESCE(AVG(ais.total_aid_amount), 0) as aide_moyenne_par_enfant,

  -- Non-recours évité (estimation)
  COUNT(DISTINCT ais.id) FILTER (WHERE ais.total_aid_amount > 0) as familles_aidees,

  -- Mobilité
  COUNT(DISTINCT b.id) FILTER (
    WHERE EXISTS (
      SELECT 1 FROM activities a
      WHERE a.id = b.activity_id
      AND (a.covoiturage_enabled = true OR a.transport_options != '[]'::jsonb)
    )
  ) as inscriptions_mobilite_organisee,

  -- Inclusion
  ROUND(
    COUNT(DISTINCT b.child_id) FILTER (
      WHERE EXISTS (
        SELECT 1 FROM children c
        WHERE c.id = b.child_id
        AND c.accessibility_flags != '{}'
      )
    )::numeric /
    NULLIF(COUNT(DISTINCT b.child_id), 0) * 100,
    2
  ) as taux_inclusion_pct

FROM public.bookings b
LEFT JOIN public.aid_simulations ais ON ais.booking_id = b.id
WHERE b.created_at > NOW() - INTERVAL '3 months'; -- Trimestre en cours

COMMENT ON VIEW vw_dashboard_financeur_kpis IS 'KPIs trimestriels pour dashboard financeur';

-- ============================================================
-- SCÉNARIO 10: CRÉNEAUX BUS-FRIENDLY
-- ============================================================

-- Vue: Créneaux alignés sur horaires transport
CREATE OR REPLACE VIEW vw_bus_friendly_slots AS
SELECT
  s.id as slot_id,
  s.activity_id,
  a.title as activity_title,
  a.transport_options,
  st.name as structure_name,
  st.address,
  s.start,
  s.end,
  TO_CHAR(s.start, 'HH24:MI') as heure_debut,
  TO_CHAR(s.end, 'HH24:MI') as heure_fin,
  EXTRACT(DOW FROM s.start) as jour_semaine, -- 0=Dimanche, 1=Lundi, etc.
  s.seats_remaining,
  s.seats_total,
  -- Détection horaires bus-friendly (8h-9h, 17h-18h30)
  CASE
    WHEN EXTRACT(HOUR FROM s.start) BETWEEN 8 AND 9
      OR EXTRACT(HOUR FROM s.start) BETWEEN 17 AND 18
    THEN true
    ELSE false
  END as horaire_bus_friendly,
  CASE
    WHEN a.transport_options::text LIKE '%Bus%'
      OR a.transport_options::text LIKE '%Tram%'
    THEN true
    ELSE false
  END as transport_public_disponible,
  -- Estimation badge bas carbone
  CASE
    WHEN (
      (EXTRACT(HOUR FROM s.start) BETWEEN 8 AND 9 OR EXTRACT(HOUR FROM s.start) BETWEEN 17 AND 18)
      AND (a.transport_options::text LIKE '%Bus%' OR a.transport_options::text LIKE '%Tram%')
      AND a.covoiturage_enabled = true
    )
    THEN 'BADGE BAS CARBONE - 3 étoiles'
    WHEN (
      (a.transport_options::text LIKE '%Bus%' OR a.transport_options::text LIKE '%Tram%')
    )
    THEN 'BADGE BAS CARBONE - 2 étoiles'
    WHEN a.covoiturage_enabled = true
    THEN 'BADGE BAS CARBONE - 1 étoile'
    ELSE 'Pas de badge'
  END as badge_estimation
FROM public.availability_slots s
INNER JOIN public.activities a ON a.id = s.activity_id
INNER JOIN public.structures st ON st.id = a.structure_id
WHERE s.start > NOW()
  AND a.published = true
ORDER BY horaire_bus_friendly DESC, s.start ASC;

COMMENT ON VIEW vw_bus_friendly_slots IS 'Créneaux optimisés transport en commun avec estimation badge';

-- Vue: Analyse remplissage par horaire
CREATE OR REPLACE VIEW vw_slot_fill_rate_by_time AS
SELECT
  EXTRACT(HOUR FROM s.start) as heure_debut,
  CASE
    WHEN EXTRACT(HOUR FROM s.start) BETWEEN 8 AND 9 THEN 'Matin bus-friendly'
    WHEN EXTRACT(HOUR FROM s.start) BETWEEN 17 AND 18 THEN 'Soir bus-friendly'
    ELSE 'Autre horaire'
  END as categorie_horaire,
  COUNT(s.id) as total_slots,
  SUM(s.seats_total) as capacite_totale,
  SUM(s.seats_remaining) as places_restantes,
  ROUND(
    (SUM(s.seats_total) - SUM(s.seats_remaining))::numeric /
    NULLIF(SUM(s.seats_total), 0) * 100,
    2
  ) as taux_remplissage_pct,
  -- Hypothèse: créneaux bus-friendly remplissent mieux
  CASE
    WHEN EXTRACT(HOUR FROM s.start) BETWEEN 8 AND 9
      OR EXTRACT(HOUR FROM s.start) BETWEEN 17 AND 18
    THEN 'Optimisé transport - meilleur remplissage attendu'
    ELSE 'Standard'
  END as analyse
FROM public.availability_slots s
WHERE s.start > NOW() - INTERVAL '1 month'
GROUP BY EXTRACT(HOUR FROM s.start)
ORDER BY heure_debut;

COMMENT ON VIEW vw_slot_fill_rate_by_time IS 'Comparaison remplissage créneaux bus-friendly vs autres';

-- ============================================================
-- FIN DES VUES
-- ============================================================

-- Résumé des vues créées
COMMENT ON SCHEMA public IS 'Vues ajoutées (lecture seule):
- vw_fratrie_groups: Familles avec 2+ enfants
- vw_fratrie_bookings: Réservations fratrie avec réduction simulée
- vw_attendance_simulation: Simulation assiduité (fictive)
- vw_urgence_candidates: Réservations urgentes récentes
- vw_inclusive_waitlist_needed: Activités inclusives saturées
- vw_inclusive_alternatives: Alternatives inclusives disponibles
- vw_ab_metrics_by_zone: Métriques par zone INSEE (A/B)
- vw_ab_temporal_comparison: Évolution mensuelle par zone
- vw_dashboard_financeur_kpis: KPIs trimestriels financeur
- vw_bus_friendly_slots: Créneaux optimisés transport
- vw_slot_fill_rate_by_time: Analyse remplissage par horaire

AUCUNE TABLE MODIFIÉE - Mode READ-ONLY uniquement
';
