import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SessionMetadata {
  device_info: {
    browser?: string;
    os?: string;
    device?: string;
  };
  ip_address: string;
  user_agent: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();
    
    // Extract metadata
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    switch (path) {
      case 'login': {
        const { email, password, mfa_code } = await req.json();

        // Attempt login
        const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) {
          return new Response(
            JSON.stringify({ error: authError.message }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const userId = authData.user?.id;
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'User ID not found' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Check if MFA is enforced
        const { data: mfaSettings } = await supabaseClient
          .from('mfa_settings')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (mfaSettings?.enforced && mfaSettings?.mfa_enabled) {
          if (!mfa_code) {
            return new Response(
              JSON.stringify({ 
                error: 'MFA required',
                requires_mfa: true 
              }),
              { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          // Verify MFA code (simplified - in production use proper TOTP verification)
          // This is a placeholder for actual MFA verification
        }

        // Get user's territory
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('territory_id')
          .eq('id', userId)
          .single();

        // Create session record
        const sessionId = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days

        await supabaseClient.from('active_sessions').insert({
          session_id: sessionId,
          user_id: userId,
          tenant_id: profile?.territory_id,
          ip_address: ip,
          user_agent: userAgent,
          device_info: {
            browser: userAgent.split('/')[0],
            os: 'unknown',
            device: 'web'
          },
          expires_at: expiresAt.toISOString(),
        });

        // Log audit event
        await supabaseClient.rpc('log_audit_event', {
          _user_id: userId,
          _action: 'login',
          _resource_type: 'session',
          _resource_id: sessionId,
          _ip_address: ip,
          _user_agent: userAgent,
        });

        return new Response(
          JSON.stringify({
            access_token: authData.session?.access_token,
            refresh_token: authData.session?.refresh_token,
            session_id: sessionId,
            expires_in: authData.session?.expires_in,
            user: authData.user,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'refresh': {
        const { refresh_token } = await req.json();

        const { data: authData, error: authError } = await supabaseClient.auth.refreshSession({
          refresh_token,
        });

        if (authError) {
          return new Response(
            JSON.stringify({ error: authError.message }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update session last_seen
        if (authData.session) {
          const userId = authData.user?.id;
          await supabaseClient
            .from('active_sessions')
            .update({ last_seen: new Date().toISOString() })
            .eq('user_id', userId)
            .eq('revoked', false);
        }

        return new Response(
          JSON.stringify({
            access_token: authData.session?.access_token,
            refresh_token: authData.session?.refresh_token,
            expires_in: authData.session?.expires_in,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'logout': {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
          return new Response(
            JSON.stringify({ error: 'No authorization header' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

        if (userError || !user) {
          return new Response(
            JSON.stringify({ error: 'Invalid token' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { session_id } = await req.json();

        // Revoke session
        await supabaseClient
          .from('active_sessions')
          .update({
            revoked: true,
            revoked_at: new Date().toISOString(),
            revoked_by: user.id,
          })
          .eq('session_id', session_id);

        // Log audit event
        await supabaseClient.rpc('log_audit_event', {
          _user_id: user.id,
          _action: 'logout',
          _resource_type: 'session',
          _resource_id: session_id,
          _ip_address: ip,
          _user_agent: userAgent,
        });

        // Sign out from Supabase
        await supabaseClient.auth.signOut();

        return new Response(
          JSON.stringify({ message: 'Logged out successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'session-info': {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
          return new Response(
            JSON.stringify({ error: 'No authorization header' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

        if (userError || !user) {
          return new Response(
            JSON.stringify({ error: 'Invalid token' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get user roles
        const { data: roles } = await supabaseClient
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        // Get active sessions count
        const { count } = await supabaseClient
          .from('active_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('revoked', false);

        return new Response(
          JSON.stringify({
            user,
            roles: roles?.map(r => r.role) || [],
            active_sessions_count: count || 0,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown endpoint' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
