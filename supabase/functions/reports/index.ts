import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limit: 1 requête par seconde par IP
const lastCall: Record<string, number> = {};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const url = new URL(req.url);
    const pathname = url.pathname;

    console.log('[reports] Processing request');

    // Route: GET /check_migrations
    if (pathname.includes('/check_migrations') && req.method === 'GET') {
      console.log('[reports] Checking migration status...');

      // Count aid_simulations
      const { count: aidSimulationsCount, error: aidError } = await supabase
        .from('aid_simulations')
        .select('*', { count: 'exact', head: true });

      if (aidError) {
        console.error('[reports] Error counting aid_simulations');
        throw aidError;
      }

      // Count activities with transport_meta NOT NULL
      const { count: activitiesWithTransportMeta, error: activitiesError } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true })
        .not('transport_meta', 'is', null);

      if (activitiesError) {
        console.error('[reports] Error counting activities with transport_meta');
        throw activitiesError;
      }

      // Count profiles with city_insee NOT NULL
      const { count: profilesWithCityInsee, error: profilesError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .not('city_insee', 'is', null);

      if (profilesError) {
        console.error('[reports] Error counting profiles with city_insee');
        throw profilesError;
      }

      const report = {
        success: true,
        migration_status: {
          aid_simulations_count: aidSimulationsCount || 0,
          activities_with_transport_meta: activitiesWithTransportMeta || 0,
          profiles_with_city_insee: profilesWithCityInsee || 0,
        },
        timestamp: new Date().toISOString(),
      };

      console.log('[reports] Migration check complete');

      return new Response(
        JSON.stringify(report),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Default: 404 Not Found
    return new Response(
      JSON.stringify({ error: 'Endpoint not found', path: pathname }),
      {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('[reports] Internal error');
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const errorDetails = error instanceof Error ? error.toString() : String(error);
    
    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: errorDetails,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
