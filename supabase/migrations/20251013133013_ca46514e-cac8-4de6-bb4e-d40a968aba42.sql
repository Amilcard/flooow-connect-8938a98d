-- Recréer la vue sans SECURITY DEFINER (elle utilisera les permissions du querying user)
DROP VIEW IF EXISTS public.sessions_report;

CREATE VIEW public.sessions_report 
WITH (security_invoker=true)
AS
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

COMMENT ON VIEW public.sessions_report IS 'Session reporting view with security invoker - uses querying user permissions';