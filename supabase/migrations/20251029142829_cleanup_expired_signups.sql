-- =====================================================
-- Migration: Cleanup automatique demandes enfants expirées
-- Date: 2025-10-29
-- Objectif: Fonction pour marquer comme expirées les demandes > 48h
-- =====================================================

-- Fonction de nettoyage des demandes expirées
CREATE OR REPLACE FUNCTION cleanup_expired_child_signups()
RETURNS TABLE(expired_count INT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  count INT;
BEGIN
  -- Marquer comme expirées toutes les demandes pending dépassant expires_at
  UPDATE child_signup_requests
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < NOW();

  GET DIAGNOSTICS count = ROW_COUNT;

  -- Logger le résultat
  RAISE NOTICE 'Marked % child signup requests as expired', count;

  RETURN QUERY SELECT count;
END;
$$;

-- Documentation
COMMENT ON FUNCTION cleanup_expired_child_signups IS
'Marks all pending child signup requests as expired when expires_at has passed. Returns count of expired requests. Should be called periodically (hourly recommended).';

-- =====================================================
-- Option A: Programmation avec pg_cron (si disponible)
-- =====================================================
-- IMPORTANT: Décommenter UNIQUEMENT si l'extension pg_cron est activée
-- sur votre instance Supabase (Plan Pro ou supérieur)

-- CREATE EXTENSION IF NOT EXISTS pg_cron;
--
-- SELECT cron.schedule(
--   'cleanup-expired-child-signups',   -- nom de la tâche
--   '0 * * * *',                        -- toutes les heures à 0 minutes
--   'SELECT cleanup_expired_child_signups()'
-- );

-- =====================================================
-- Option B: Appel manuel ou via GitHub Actions
-- =====================================================
-- Si pg_cron n'est pas disponible, créer une GitHub Action qui appelle :
-- curl -X POST https://[PROJECT_ID].supabase.co/rest/v1/rpc/cleanup_expired_child_signups \
--   -H "apikey: [ANON_KEY]" \
--   -H "Content-Type: application/json"
--
-- Fichier: .github/workflows/cleanup-expired-signups.yml
-- Planification: "0 * * * *" (toutes les heures)

-- =====================================================
-- Accorder permissions pour appel RPC public
-- =====================================================
-- Permettre l'appel de la fonction via l'API REST
GRANT EXECUTE ON FUNCTION cleanup_expired_child_signups TO anon, authenticated;
