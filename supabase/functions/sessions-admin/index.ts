import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Credentials': 'true',
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
    const supabase = createClient(
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
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const method = req.method;

    // Check if user is superadmin
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isSuperAdmin = userRoles?.some(r => r.role === 'superadmin');
    
    if (!isSuperAdmin) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions - superadmin only' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========== LIST SESSIONS ==========
    if (method === 'GET') {
      const searchQuery = url.searchParams.get('search') || '';
      
      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions_report')
        .select('*')
        .eq('revoked', false)
        .order('created_at', { ascending: false });

      if (sessionsError) {
        return new Response(
          JSON.stringify({ error: sessionsError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Apply search filter in memory (can be moved to query for performance)
      let filteredSessions = sessions || [];
      if (searchQuery) {
        const lowerSearch = searchQuery.toLowerCase();
        filteredSessions = filteredSessions.filter(s =>
          s.device?.toLowerCase().includes(lowerSearch) ||
          s.ip?.toString().includes(lowerSearch) ||
          s.user_id?.toLowerCase().includes(lowerSearch)
        );
      }

      return new Response(
        JSON.stringify({ sessions: filteredSessions }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========== REVOKE SESSION ==========
    if (method === 'DELETE') {
      const pathParts = url.pathname.split('/');
      const sessionId = pathParts[pathParts.length - 1];

      if (sessionId === 'sessions-admin') {
        return new Response(
          JSON.stringify({ error: 'Session ID required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get session to check permissions
      const { data: session } = await supabase
        .from('sessions')
        .select('id, user_id, tenant_id')
        .eq('id', sessionId)
        .single();

      if (!session) {
        return new Response(
          JSON.stringify({ error: 'Session not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Only superadmins can revoke sessions (already checked above)

      const { revoke_reason } = await req.json().catch(() => ({ revoke_reason: 'Admin revocation' }));

      // Revoke session
      await supabase.rpc('revoke_session', {
        p_session_id: sessionId,
        p_reason: revoke_reason,
      });

      // Log audit event
      await supabase.rpc('log_audit_event', {
        _user_id: user.id,
        _action: 'admin_revoke_session',
        _resource_type: 'session',
        _resource_id: sessionId,
        _metadata: { 
          target_user_id: session.user_id,
          reason: revoke_reason 
        },
      });

      return new Response(
        JSON.stringify({ success: true, message: 'Session revoked' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
