-- Activer RLS sur les vues dashboard
ALTER VIEW vw_dashboard_collectivite_overview SET (security_invoker = on);
ALTER VIEW vw_dashboard_financeur_aid_usage SET (security_invoker = on);

-- Donner accès en lecture pour tous les utilisateurs authentifiés
GRANT SELECT ON vw_dashboard_collectivite_overview TO authenticated;
GRANT SELECT ON vw_dashboard_financeur_aid_usage TO authenticated;