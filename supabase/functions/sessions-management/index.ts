import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limit: 1 requête par seconde par IP
const lastCall: Record<string, number> = {};

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

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

    const url = new URL(req.url);
    const method = req.method;

    // GET /sessions - List sessions
    if (method === 'GET') {
      const { data: userRoles } = await supabaseClient
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const isAdmin = userRoles?.some(r => 
        r.role === 'superadmin'
      );

      let query = supabaseClient
        .from('active_sessions')
        .select(`
          *,
          profiles!active_sessions_user_id_fkey(email)
        `)
        .eq('revoked', false)
        .order('created_at', { ascending: false });

      // If not admin, only show own sessions
      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }

      const { data: sessions, error: sessionsError } = await query;

      if (sessionsError) {
        return new Response(
          JSON.stringify({ error: sessionsError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ sessions }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE /sessions/:id - Revoke specific session
    if (method === 'DELETE') {
      const pathParts = url.pathname.split('/');
      const sessionId = pathParts[pathParts.length - 1];

      if (sessionId === 'sessions') {
        // DELETE /sessions - Revoke all sessions
        const { error: revokeError } = await supabaseClient
          .from('active_sessions')
          .update({
            revoked: true,
            revoked_at: new Date().toISOString(),
            revoked_by: user.id,
            revoke_reason: 'User revoked all sessions',
          })
          .eq('user_id', user.id)
          .eq('revoked', false);

        if (revokeError) {
          return new Response(
            JSON.stringify({ error: revokeError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Log audit event
        await supabaseClient.rpc('log_audit_event', {
          _user_id: user.id,
          _action: 'revoke_all_sessions',
          _resource_type: 'session',
          _metadata: { reason: 'User initiated' },
        });

        return new Response(
          JSON.stringify({ message: 'All sessions revoked' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get session to check ownership
      const { data: session } = await supabaseClient
        .from('active_sessions')
        .select('user_id, tenant_id')
        .eq('session_id', sessionId)
        .single();

      if (!session) {
        return new Response(
          JSON.stringify({ error: 'Session not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check permissions
      const { data: userRoles } = await supabaseClient
        .from('user_roles')
        .select('role, territory_id')
        .eq('user_id', user.id);

      const isOwner = session.user_id === user.id;
      const isSuperAdmin = userRoles?.some(r => r.role === 'superadmin');

      if (!isOwner && !isSuperAdmin) {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions - superadmin only' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { revoke_reason } = await req.json().catch(() => ({ revoke_reason: 'Manual revocation' }));

      // Revoke session
      const { error: revokeError } = await supabaseClient
        .from('active_sessions')
        .update({
          revoked: true,
          revoked_at: new Date().toISOString(),
          revoked_by: user.id,
          revoke_reason,
        })
        .eq('session_id', sessionId);

      if (revokeError) {
        return new Response(
          JSON.stringify({ error: revokeError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Log audit event
      await supabaseClient.rpc('log_audit_event', {
        _user_id: user.id,
        _action: 'revoke_session',
        _resource_type: 'session',
        _resource_id: sessionId,
        _metadata: { 
          target_user_id: session.user_id,
          reason: revoke_reason 
        },
      });

      return new Response(
        JSON.stringify({ message: 'Session revoked successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[sessions-management] Internal error');
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
