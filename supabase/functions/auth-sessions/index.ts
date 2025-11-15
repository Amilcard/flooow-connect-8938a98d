import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { create, verify } from "https://deno.land/x/djwt@v2.8/mod.ts";
import { LoginSchema, RefreshTokenSchema, parseRequestBody } from "../_shared/validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Credentials': 'true',
};

const ACCESS_TTL_SEC = 15 * 60; // 15 minutes
const REFRESH_DAYS = 14;

// Rate limit: 1 requête par seconde par IP
const lastCall: Record<string, number> = {};

// Helper functions
function randomToken(): string {
  const buffer = new Uint8Array(48);
  crypto.getRandomValues(buffer);
  return Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hashToken(token: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function setCookies(headers: Headers, accessToken: string, refreshToken: string, sessionId: string) {
  const accessMaxAge = ACCESS_TTL_SEC;
  const refreshMaxAge = REFRESH_DAYS * 24 * 3600;
  
  // Access token cookie (HttpOnly, Secure)
  headers.append('Set-Cookie', 
    `access_token=${accessToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${accessMaxAge}`
  );
  
  // Refresh token cookie (HttpOnly, Secure)
  headers.append('Set-Cookie',
    `refresh_token=${refreshToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${refreshMaxAge}`
  );
  
  // Session ID cookie (readable by client for UI)
  headers.append('Set-Cookie',
    `session_id=${sessionId}; Secure; SameSite=Lax; Path=/; Max-Age=${refreshMaxAge}`
  );
}

function clearCookies(headers: Headers) {
  headers.append('Set-Cookie', 'access_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');
  headers.append('Set-Cookie', 'refresh_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');
  headers.append('Set-Cookie', 'session_id=; Secure; SameSite=Lax; Path=/; Max-Age=0');
}

async function createAccessToken(userId: string, roles: string[], sessionId: string): Promise<string> {
  // CRITICAL SECURITY: JWT_SECRET must be configured in production
  const jwtSecret = Deno.env.get('JWT_SECRET');
  if (!jwtSecret) {
    console.error('FATAL: JWT_SECRET environment variable not configured');
    throw new Error('JWT_SECRET environment variable is required for security');
  }

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(jwtSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  return await create(
    { alg: 'HS256', typ: 'JWT' },
    {
      sub: userId,
      roles,
      sessionId,
      exp: Math.floor(Date.now() / 1000) + ACCESS_TTL_SEC,
    },
    key
  );
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting
  const ip = req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for") ?? "unknown";
  const now = Date.now();
  
  if (lastCall[ip] && now - lastCall[ip] < 1000) {
    return new Response("Trop rapide 🙂 Attendez une seconde.", { 
      status: 429,
      headers: corsHeaders 
    });
  }
  
  lastCall[ip] = now;

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();
    
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // ========== LOGIN ==========
    if (path === 'login' && req.method === 'POST') {
      const validationResult = await parseRequestBody(req, LoginSchema);
      
      if (!validationResult.success) {
        return new Response(
          JSON.stringify({ 
            error: validationResult.error,
            details: validationResult.details 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { email, password, device } = validationResult.data;

      // Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const userId = authData.user.id;

      // Get user roles
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      const roles = userRoles?.map(r => r.role) || [];

      // Get user territory
      const { data: profile } = await supabase
        .from('profiles')
        .select('territory_id')
        .eq('id', userId)
        .single();

      // Create session row
      const sessionId = crypto.randomUUID();
      const { error: sessError } = await supabase
        .from('sessions')
        .insert({
          id: sessionId,
          user_id: userId,
          tenant_id: profile?.territory_id,
          roles,
          device,
          ip,
          mfa_verified: false, // TODO: implement MFA flow
        });

      if (sessError) {
        console.error('Session insert error:', sessError);
        return new Response(
          JSON.stringify({ error: 'Session creation failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create tokens
      const accessToken = await createAccessToken(userId, roles, sessionId);
      const rawRefreshToken = randomToken();
      const tokenHash = await hashToken(rawRefreshToken);
      const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 3600 * 1000).toISOString();

      const { error: rtError } = await supabase
        .from('refresh_tokens')
        .insert({
          session_id: sessionId,
          token_hash: tokenHash,
          expires_at: expiresAt,
        });

      if (rtError) {
        console.error('Refresh token insert error:', rtError);
        // Cleanup session
        await supabase.from('sessions').delete().eq('id', sessionId);
        return new Response(
          JSON.stringify({ error: 'Token creation failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Log audit event
      await supabase.rpc('log_audit_event', {
        _user_id: userId,
        _action: 'login',
        _resource_type: 'session',
        _resource_id: sessionId,
        _ip_address: ip,
        _user_agent: userAgent,
      });

      // Set cookies
      const responseHeaders = new Headers(corsHeaders);
      responseHeaders.set('Content-Type', 'application/json');
      setCookies(responseHeaders, accessToken, rawRefreshToken, sessionId);

      return new Response(
        JSON.stringify({
          success: true,
          session_id: sessionId,
          user: {
            id: userId,
            email: authData.user.email,
            roles,
          },
        }),
        { headers: responseHeaders }
      );
    }

    // ========== REFRESH ==========
    if (path === 'refresh' && req.method === 'POST') {
      const cookies = req.headers.get('cookie') || '';
      const refreshTokenMatch = cookies.match(/refresh_token=([^;]+)/);
      const rawRefreshToken = refreshTokenMatch?.[1];

      if (!rawRefreshToken) {
        return new Response(
          JSON.stringify({ error: 'No refresh token provided' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const tokenHash = await hashToken(rawRefreshToken);

      // Find valid refresh token
      const { data: tokenData, error: tokenError } = await supabase
        .from('refresh_tokens')
        .select('id, session_id, expires_at, revoked')
        .eq('token_hash', tokenHash)
        .eq('revoked', false)
        .single();

      if (tokenError || !tokenData || new Date(tokenData.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ error: 'Invalid or expired refresh token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get session
      const { data: session, error: sessError } = await supabase
        .from('sessions')
        .select('id, user_id, tenant_id, roles, revoked')
        .eq('id', tokenData.session_id)
        .eq('revoked', false)
        .single();

      if (sessError || !session) {
        return new Response(
          JSON.stringify({ error: 'Session not found or revoked' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Revoke old refresh token (single-use rotation)
      await supabase
        .from('refresh_tokens')
        .update({ revoked: true })
        .eq('id', tokenData.id);

      // Create new tokens
      const newAccessToken = await createAccessToken(session.user_id, session.roles, session.id);
      const newRawRefreshToken = randomToken();
      const newTokenHash = await hashToken(newRawRefreshToken);
      const newExpiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 3600 * 1000).toISOString();

      await supabase
        .from('refresh_tokens')
        .insert({
          session_id: session.id,
          token_hash: newTokenHash,
          expires_at: newExpiresAt,
        });

      // Update session last_seen
      await supabase.rpc('touch_session_lastseen', { p_session_id: session.id });

      // Set new cookies
      const responseHeaders = new Headers(corsHeaders);
      responseHeaders.set('Content-Type', 'application/json');
      setCookies(responseHeaders, newAccessToken, newRawRefreshToken, session.id);

      return new Response(
        JSON.stringify({
          success: true,
          session_id: session.id,
        }),
        { headers: responseHeaders }
      );
    }

    // ========== LOGOUT ==========
    if (path === 'logout' && req.method === 'POST') {
      const cookies = req.headers.get('cookie') || '';
      const sessionIdMatch = cookies.match(/session_id=([^;]+)/);
      const sessionId = sessionIdMatch?.[1];

      if (sessionId) {
        // Revoke session and all its tokens
        await supabase.rpc('revoke_session', {
          p_session_id: sessionId,
          p_reason: 'User logout',
        });
      }

      const responseHeaders = new Headers(corsHeaders);
      responseHeaders.set('Content-Type', 'application/json');
      clearCookies(responseHeaders);

      return new Response(
        JSON.stringify({ success: true, message: 'Logged out' }),
        { headers: responseHeaders }
      );
    }

    // ========== SESSION INFO ==========
    if (path === 'session-info' && req.method === 'GET') {
      const cookies = req.headers.get('cookie') || '';
      const sessionIdMatch = cookies.match(/session_id=([^;]+)/);
      const sessionId = sessionIdMatch?.[1];

      if (!sessionId) {
        return new Response(
          JSON.stringify({ error: 'No session' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: session } = await supabase
        .from('sessions')
        .select('user_id, tenant_id, roles, device, ip, created_at, last_seen_at, mfa_verified')
        .eq('id', sessionId)
        .eq('revoked', false)
        .single();

      if (!session) {
        return new Response(
          JSON.stringify({ error: 'Session not found or expired' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ session }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Unknown endpoint' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
