-- Activer security_invoker sur les vues existantes
ALTER VIEW v_profile_completion SET (security_invoker = on);
ALTER VIEW v_children_with_age SET (security_invoker = on);
ALTER VIEW territory_user_stats SET (security_invoker = on);
ALTER VIEW vw_alternative_slots SET (security_invoker = on);