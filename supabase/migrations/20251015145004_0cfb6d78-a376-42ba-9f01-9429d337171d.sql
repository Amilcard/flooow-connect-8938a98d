-- ÉTAPE 1 : Nettoyer les anciennes politiques utilisateurs (garder les admin)
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.active_sessions;
DROP POLICY IF EXISTS "Users can revoke their own sessions" ON public.active_sessions;

-- ÉTAPE 2 : Politiques RLS propres pour utilisateurs
CREATE POLICY "View own sessions"
ON public.active_sessions FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Insert own sessions"
ON public.active_sessions FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Update own sessions"
ON public.active_sessions FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Delete own sessions"
ON public.active_sessions FOR DELETE
USING (user_id = auth.uid());

-- ÉTAPE 3 : Fonction de purge automatique (trigger-compatible)
CREATE OR REPLACE FUNCTION cleanup_old_sessions_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.active_sessions
  WHERE created_at < NOW() - INTERVAL '7 days'
     OR (revoked = true AND revoked_at < NOW() - INTERVAL '30 days');
  RETURN NEW;
END;
$$;

-- ÉTAPE 4 : Trigger de purge automatique à chaque insertion
DROP TRIGGER IF EXISTS auto_cleanup_sessions ON public.active_sessions;
CREATE TRIGGER auto_cleanup_sessions
AFTER INSERT ON public.active_sessions
FOR EACH STATEMENT
EXECUTE FUNCTION cleanup_old_sessions_trigger();

COMMENT ON TRIGGER auto_cleanup_sessions ON public.active_sessions 
IS 'Purge automatique sessions > 7j ou révoquées > 30j à chaque insertion';