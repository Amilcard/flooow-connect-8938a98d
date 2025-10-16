-- ========================================
-- CORRECTIF SÉCURITÉ: Accès excessif admins (version corrigée)
-- ========================================

-- 1. Créer vue statistiques agrégées pour territory admins
CREATE VIEW territory_user_stats AS
SELECT 
  territory_id,
  COUNT(*) as total_users,
  COUNT(CASE WHEN quotient_familial < 500 THEN 1 END) as low_income_count,
  COUNT(CASE WHEN quotient_familial BETWEEN 500 AND 1000 THEN 1 END) as medium_income_count,
  COUNT(CASE WHEN quotient_familial > 1000 THEN 1 END) as high_income_count,
  AVG(quotient_familial) as avg_quotient_familial,
  -- Stats état civil anonymisées
  COUNT(CASE WHEN marital_status = 'married' THEN 1 END) as married_count,
  COUNT(CASE WHEN marital_status = 'single' THEN 1 END) as single_count,
  COUNT(CASE WHEN marital_status = 'divorced' THEN 1 END) as divorced_count,
  COUNT(CASE WHEN marital_status = 'widowed' THEN 1 END) as widowed_count,
  -- Distribution codes postaux (2 premiers chiffres)
  ARRAY_AGG(DISTINCT LEFT(postal_code, 2)) FILTER (WHERE postal_code IS NOT NULL) as postal_code_prefixes
FROM profiles
WHERE territory_id IS NOT NULL
GROUP BY territory_id;

-- Autoriser lecture vue statistiques aux authentifiés
GRANT SELECT ON territory_user_stats TO authenticated;

-- Politique RLS pour vue statistiques
ALTER VIEW territory_user_stats SET (security_invoker = on);

-- 2. Supprimer politique trop permissive existante
DROP POLICY IF EXISTS "Admins can view all profiles in their territory" ON profiles;

-- 3. Créer politiques restrictives
-- Superadmins gardent accès complet
CREATE POLICY "Superadmins can view all profiles"
ON profiles FOR SELECT
USING (has_role(auth.uid(), 'superadmin'::app_role));

-- Commentaires documentation
COMMENT ON VIEW territory_user_stats IS 
  'Vue agrégée anonymisée pour reporting territoire. Territory admins voient statistiques sans accès aux données individuelles.';

COMMENT ON COLUMN profiles.quotient_familial IS 
  'Donnée financière sensible. Accès restreint aux superadmins uniquement. Territory admins voient statistiques agrégées via territory_user_stats.';