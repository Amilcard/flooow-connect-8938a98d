-- 3. Restrict MFA settings access to superadmins only
DROP POLICY IF EXISTS "Admins can view MFA settings" ON public.mfa_settings;

CREATE POLICY "Only superadmins can view MFA settings"
ON public.mfa_settings
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'superadmin'::app_role)
);

-- 4. Restrict sessions/tokens access to superadmins only (remove territory_admin access)
DROP POLICY IF EXISTS "Admins can view all sessions in their tenant" ON public.active_sessions;
DROP POLICY IF EXISTS "Admins can revoke sessions in their tenant" ON public.active_sessions;

CREATE POLICY "Only superadmins can view all sessions"
ON public.active_sessions
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Only superadmins can revoke sessions"
ON public.active_sessions
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'superadmin'::app_role)
)
WITH CHECK (
  revoked = true
);

-- Same for sessions table
DROP POLICY IF EXISTS "admins_view_all_sessions" ON public.sessions;
DROP POLICY IF EXISTS "admins_revoke_sessions" ON public.sessions;

CREATE POLICY "superadmins_view_all_sessions"
ON public.sessions
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "superadmins_revoke_sessions"
ON public.sessions
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'superadmin'::app_role)
);

-- Same for refresh_tokens
DROP POLICY IF EXISTS "admins_view_refresh_tokens" ON public.refresh_tokens;
DROP POLICY IF EXISTS "admins_revoke_refresh_tokens" ON public.refresh_tokens;

CREATE POLICY "superadmins_view_refresh_tokens"
ON public.refresh_tokens
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "superadmins_revoke_refresh_tokens"
ON public.refresh_tokens
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'superadmin'::app_role)
);