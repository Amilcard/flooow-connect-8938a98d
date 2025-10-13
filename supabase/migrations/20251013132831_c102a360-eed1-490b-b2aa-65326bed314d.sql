-- Extension pgcrypto pour hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Table sessions avec metadata
CREATE TABLE IF NOT EXISTS public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tenant_id uuid NULL,
  roles text[] NOT NULL DEFAULT '{}',
  device text NULL,
  ip inet NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  revoked boolean NOT NULL DEFAULT false,
  mfa_verified boolean NOT NULL DEFAULT false,
  access_jti text NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_tenant ON public.sessions(tenant_id);

-- Table refresh_tokens avec hash
CREATE TABLE IF NOT EXISTS public.refresh_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_refresh_by_session ON public.refresh_tokens(session_id);
CREATE INDEX IF NOT EXISTS idx_refresh_hash ON public.refresh_tokens(token_hash);

-- RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refresh_tokens ENABLE ROW LEVEL SECURITY;

-- Policies sessions
CREATE POLICY "sessions_select_own" ON public.sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "sessions_modify_own" ON public.sessions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "sessions_insert_server" ON public.sessions
  FOR INSERT WITH CHECK (true);

-- Policies refresh_tokens
CREATE POLICY "refresh_select_owner" ON public.refresh_tokens
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.sessions s WHERE s.id = refresh_tokens.session_id AND s.user_id = auth.uid())
  );

CREATE POLICY "refresh_insert_server" ON public.refresh_tokens
  FOR INSERT WITH CHECK (true);

-- Function touch session
CREATE OR REPLACE FUNCTION public.touch_session_lastseen(p_session_id uuid)
RETURNS void LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.sessions SET last_seen_at = now() WHERE id = p_session_id;
END;
$$;