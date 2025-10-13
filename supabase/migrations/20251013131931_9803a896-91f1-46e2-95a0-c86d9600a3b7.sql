-- =====================================================
-- SESSION MANAGEMENT & AUDIT SYSTEM
-- =====================================================

-- Table: active_sessions
-- Stocke toutes les sessions actives avec métadonnées complètes
CREATE TABLE IF NOT EXISTS public.active_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES public.territories(id) ON DELETE CASCADE,
  device_info jsonb DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_seen timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  revoked boolean DEFAULT false,
  revoked_at timestamp with time zone,
  revoked_by uuid REFERENCES auth.users(id),
  revoke_reason text
);

-- Indexes pour performance
CREATE INDEX idx_active_sessions_user_id ON public.active_sessions(user_id);
CREATE INDEX idx_active_sessions_session_id ON public.active_sessions(session_id);
CREATE INDEX idx_active_sessions_revoked ON public.active_sessions(revoked) WHERE revoked = false;
CREATE INDEX idx_active_sessions_expires_at ON public.active_sessions(expires_at);

-- Table: audit_logs
-- Logs toutes les actions sensibles pour conformité RGPD
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Table: mfa_settings
-- Configuration MFA par utilisateur
CREATE TABLE IF NOT EXISTS public.mfa_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mfa_enabled boolean DEFAULT false,
  mfa_method text, -- 'totp', 'sms', 'email'
  backup_codes jsonb DEFAULT '[]'::jsonb,
  enforced boolean DEFAULT false, -- MFA obligatoire pour ce user
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_mfa_settings_user_id ON public.mfa_settings(user_id);

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_settings ENABLE ROW LEVEL SECURITY;

-- Policies: active_sessions
CREATE POLICY "Users can view their own sessions"
  ON public.active_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can revoke their own sessions"
  ON public.active_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND revoked = true);

CREATE POLICY "Admins can view all sessions in their tenant"
  ON public.active_sessions FOR SELECT
  USING (
    has_role(auth.uid(), 'superadmin'::app_role) OR 
    (has_role(auth.uid(), 'territory_admin'::app_role) AND tenant_id = get_user_territory(auth.uid()))
  );

CREATE POLICY "Admins can revoke sessions in their tenant"
  ON public.active_sessions FOR UPDATE
  USING (
    has_role(auth.uid(), 'superadmin'::app_role) OR 
    (has_role(auth.uid(), 'territory_admin'::app_role) AND tenant_id = get_user_territory(auth.uid()))
  )
  WITH CHECK (revoked = true);

-- Policies: audit_logs
CREATE POLICY "Users can view their own audit logs"
  ON public.audit_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    has_role(auth.uid(), 'superadmin'::app_role) OR 
    has_role(auth.uid(), 'territory_admin'::app_role)
  );

-- Policies: mfa_settings
CREATE POLICY "Users can manage their own MFA settings"
  ON public.mfa_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view MFA settings"
  ON public.mfa_settings FOR SELECT
  USING (
    has_role(auth.uid(), 'superadmin'::app_role) OR 
    has_role(auth.uid(), 'territory_admin'::app_role)
  );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function: log_audit_event
CREATE OR REPLACE FUNCTION public.log_audit_event(
  _user_id uuid,
  _action text,
  _resource_type text,
  _resource_id text DEFAULT NULL,
  _metadata jsonb DEFAULT '{}'::jsonb,
  _ip_address inet DEFAULT NULL,
  _user_agent text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _log_id uuid;
BEGIN
  INSERT INTO public.audit_logs (
    user_id, action, resource_type, resource_id, 
    metadata, ip_address, user_agent
  ) VALUES (
    _user_id, _action, _resource_type, _resource_id, 
    _metadata, _ip_address, _user_agent
  )
  RETURNING id INTO _log_id;
  
  RETURN _log_id;
END;
$$;

-- Function: cleanup_expired_sessions
-- Nettoie les sessions expirées (à appeler via cron)
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _deleted_count integer;
BEGIN
  DELETE FROM public.active_sessions
  WHERE expires_at < now() OR (revoked = true AND revoked_at < now() - interval '30 days');
  
  GET DIAGNOSTICS _deleted_count = ROW_COUNT;
  RETURN _deleted_count;
END;
$$;

-- Function: enforce_admin_mfa
-- Vérifie que les admins ont MFA activé
CREATE OR REPLACE FUNCTION public.enforce_admin_mfa()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Si l'utilisateur a un role admin, forcer MFA
  IF EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = NEW.user_id 
    AND role IN ('superadmin', 'territory_admin')
  ) THEN
    NEW.enforced := true;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_enforce_admin_mfa
  BEFORE INSERT OR UPDATE ON public.mfa_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_admin_mfa();

-- Function: update_session_last_seen
CREATE OR REPLACE FUNCTION public.update_session_last_seen(
  _session_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.active_sessions
  SET last_seen = now()
  WHERE session_id = _session_id AND revoked = false;
END;
$$;