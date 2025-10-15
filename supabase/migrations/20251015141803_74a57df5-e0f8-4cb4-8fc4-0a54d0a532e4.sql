-- 1. Supprimer VUE inutilisée sessions_report (0 rows, aucune politique)
DROP VIEW IF EXISTS public.sessions_report CASCADE;

-- 2. Activer pgcrypto pour hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 3. Fonction auto-hash IP (one-way, anonymisé)
CREATE OR REPLACE FUNCTION public.hash_ip_before_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Hash IP avec SHA256 (irreversible, pour analytics seulement)
  IF NEW.ip_address IS NOT NULL THEN
    NEW.ip_address = (digest(NEW.ip_address::TEXT, 'sha256'))::TEXT::inet;
  END IF;
  RETURN NEW;
END;
$$;

-- 4. Trigger sur active_sessions
DROP TRIGGER IF EXISTS hash_ip_on_insert ON public.active_sessions;
CREATE TRIGGER hash_ip_on_insert
  BEFORE INSERT ON public.active_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.hash_ip_before_insert();

-- 5. Fonction cleanup auto (supprimer sessions > 90 jours)
CREATE OR REPLACE FUNCTION public.cleanup_old_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.active_sessions
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- 6. Commentaires
COMMENT ON FUNCTION public.hash_ip_before_insert IS 'Hash IPs avec SHA256 (one-way) pour anonymisation';
COMMENT ON FUNCTION public.cleanup_old_sessions IS 'Supprime sessions > 90 jours (GDPR compliance)';