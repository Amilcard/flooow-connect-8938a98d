-- Policies admin pour sessions
CREATE POLICY "admins_view_all_sessions" ON public.sessions
  FOR SELECT USING (
    has_role(auth.uid(), 'superadmin'::app_role) OR
    (has_role(auth.uid(), 'territory_admin'::app_role) AND tenant_id = get_user_territory(auth.uid()))
  );

CREATE POLICY "admins_revoke_sessions" ON public.sessions
  FOR UPDATE USING (
    has_role(auth.uid(), 'superadmin'::app_role) OR
    (has_role(auth.uid(), 'territory_admin'::app_role) AND tenant_id = get_user_territory(auth.uid()))
  );

-- Policies admin pour refresh_tokens
CREATE POLICY "admins_view_refresh_tokens" ON public.refresh_tokens
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sessions s 
      WHERE s.id = refresh_tokens.session_id 
      AND (
        has_role(auth.uid(), 'superadmin'::app_role) OR
        (has_role(auth.uid(), 'territory_admin'::app_role) AND s.tenant_id = get_user_territory(auth.uid()))
      )
    )
  );

CREATE POLICY "admins_revoke_refresh_tokens" ON public.refresh_tokens
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.sessions s 
      WHERE s.id = refresh_tokens.session_id 
      AND (
        has_role(auth.uid(), 'superadmin'::app_role) OR
        (has_role(auth.uid(), 'territory_admin'::app_role) AND s.tenant_id = get_user_territory(auth.uid()))
      )
    )
  );

-- Function pour révoquer une session et ses tokens
CREATE OR REPLACE FUNCTION public.revoke_session(p_session_id uuid, p_reason text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Révoquer la session
  UPDATE public.sessions 
  SET revoked = true 
  WHERE id = p_session_id;
  
  -- Révoquer tous les refresh tokens associés
  UPDATE public.refresh_tokens 
  SET revoked = true 
  WHERE session_id = p_session_id;
  
  -- Log audit si la table existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
    INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id, metadata)
    SELECT user_id, 'revoke_session', 'session', p_session_id::text, 
           jsonb_build_object('reason', p_reason)
    FROM public.sessions WHERE id = p_session_id;
  END IF;
END;
$$;

-- View pour reporting admin
CREATE OR REPLACE VIEW public.sessions_report AS
SELECT 
  s.id, 
  s.user_id, 
  s.tenant_id, 
  s.roles, 
  s.device, 
  s.ip, 
  s.created_at, 
  s.last_seen_at, 
  s.revoked,
  s.mfa_verified,
  rt.expires_at as refresh_token_expires_at,
  rt.revoked as refresh_token_revoked
FROM public.sessions s
LEFT JOIN LATERAL (
  SELECT expires_at, revoked 
  FROM public.refresh_tokens rt 
  WHERE rt.session_id = s.id 
  ORDER BY rt.created_at DESC 
  LIMIT 1
) rt ON true;

-- Function pour nettoyer les sessions expirées
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions_and_tokens()
RETURNS integer LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _deleted_count integer;
BEGIN
  -- Révoquer les sessions avec des refresh tokens expirés
  UPDATE public.sessions s
  SET revoked = true
  WHERE s.id IN (
    SELECT DISTINCT rt.session_id 
    FROM public.refresh_tokens rt 
    WHERE rt.expires_at < now() 
    AND rt.revoked = false
  ) AND s.revoked = false;
  
  -- Marquer les refresh tokens expirés comme révoqués
  UPDATE public.refresh_tokens
  SET revoked = true
  WHERE expires_at < now() AND revoked = false;
  
  -- Supprimer les anciennes sessions révoquées (> 30 jours)
  DELETE FROM public.sessions
  WHERE revoked = true 
  AND last_seen_at < now() - interval '30 days';
  
  GET DIAGNOSTICS _deleted_count = ROW_COUNT;
  RETURN _deleted_count;
END;
$$;