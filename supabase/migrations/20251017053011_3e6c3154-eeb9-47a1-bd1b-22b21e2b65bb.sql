-- ==========================================
-- LOT 2 : Vues Dashboard (corrigées)
-- ==========================================

-- Vue 1 : Dashboard Collectivité
CREATE OR REPLACE VIEW vw_dashboard_collectivite_overview AS
SELECT 
  t.id as territory_id,
  t.name as territory_name,
  t.type as territory_type,
  COUNT(DISTINCT a.id) as total_activities,
  COUNT(DISTINCT CASE WHEN a.published THEN a.id END) as published_activities,
  COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'validee') as total_registrations,
  COUNT(DISTINCT b.child_id) FILTER (WHERE b.status = 'validee') as unique_children_registered,
  SUM(a.price_base) FILTER (WHERE b.status = 'validee') as total_revenue_potential,
  COUNT(DISTINCT ais.id) as total_aid_simulations
FROM territories t
LEFT JOIN structures s ON s.territory_id = t.id
LEFT JOIN activities a ON a.structure_id = s.id
LEFT JOIN bookings b ON b.activity_id = a.id
LEFT JOIN aid_simulations ais ON ais.booking_id = b.id
WHERE t.active = true
GROUP BY t.id, t.name, t.type;

-- Vue 2 : Dashboard Financeur (corrigée)
CREATE OR REPLACE VIEW vw_dashboard_financeur_aid_usage AS
SELECT 
  fa.id as aid_id,
  fa.name as aid_name,
  fa.categories as aid_categories,
  fa.eligibility_summary as aid_description,
  fa.territory_level,
  COUNT(DISTINCT ais.id) as total_simulations,
  COUNT(DISTINCT ais.user_id) as unique_users,
  COUNT(DISTINCT b.child_id) FILTER (WHERE b.status = 'validee') as total_children_benefiting,
  -- Extraction montant du jsonb simulated_aids
  SUM((ais.simulated_aids->0->>'amount')::numeric) as total_simulated_amount,
  AVG((ais.simulated_aids->0->>'amount')::numeric) as avg_aid_amount
FROM financial_aids fa
LEFT JOIN aid_simulations ais ON ais.simulated_aids @> jsonb_build_array(jsonb_build_object('name', fa.name))
LEFT JOIN bookings b ON b.id = ais.booking_id
WHERE fa.active = true
GROUP BY fa.id, fa.name, fa.categories, fa.eligibility_summary, fa.territory_level;