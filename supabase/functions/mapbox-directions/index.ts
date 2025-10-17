import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { start, end, profile } = await req.json();
    
    // Validate inputs
    if (!start || !end) {
      return new Response(
        JSON.stringify({ error: 'Start and end coordinates are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const MAPBOX_TOKEN = Deno.env.get('MAPBOX_PUBLIC_TOKEN');
    
    if (!MAPBOX_TOKEN) {
      console.error('MAPBOX_PUBLIC_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'Map service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use appropriate profile: walking, cycling, or driving-traffic
    const travelProfile = profile || 'walking';
    
    // Call Mapbox Directions API
    const url = `https://api.mapbox.com/directions/v5/mapbox/${travelProfile}/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&steps=true&language=fr&access_token=${MAPBOX_TOKEN}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error('Mapbox API error:', data);
      return new Response(
        JSON.stringify({ error: 'Failed to get directions', details: data }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in mapbox-directions:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
