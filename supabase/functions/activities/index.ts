import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const url = new URL(req.url);
    const qp = url.searchParams;

    // Base query parameters
    const baseSelect = qp.get("select") ?? "id,title,category,age_min,age_max,price_base,images,accessibility_checklist,accepts_aid_types,capacity_policy,covoiturage_enabled,structure_id";
    const limit = qp.get("limit") ?? "20";
    const offset = qp.get("offset") ?? "0";

    // Build filters - always enforce published=true
    const filters: string[] = ["published=eq.true"];
    
    if (qp.get("category")) {
      filters.push(`category=eq.${encodeURIComponent(qp.get("category")!)}`);
    }
    if (qp.get("age_min")) {
      filters.push(`age_min=lte.${encodeURIComponent(qp.get("age_min")!)}`);
    }
    if (qp.get("age_max")) {
      filters.push(`age_max=gte.${encodeURIComponent(qp.get("age_max")!)}`);
    }
    if (qp.get("max_price")) {
      filters.push(`price_base=lte.${encodeURIComponent(qp.get("max_price")!)}`);
    }
    if (qp.get("accessibility") === "true") {
      filters.push(`accessibility_checklist->>wheelchair=eq.true`);
    }
    if (qp.get("covoiturage") === "true") {
      filters.push(`covoiturage_enabled=eq.true`);
    }

    // Construct Supabase REST URL
    const restUrl = `${SUPABASE_URL}/rest/v1/activities?select=${encodeURIComponent(baseSelect)}&${filters.join("&")}&limit=${limit}&offset=${offset}&order=created_at.desc`;

    console.log(`[activities] Fetching: ${restUrl}`);

    // Call Supabase REST API
    const response = await fetch(restUrl, {
      method: "GET",
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        "accept-profile": "public",
      },
    });

    if (!response.ok) {
      console.error(`[activities] Supabase error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`[activities] Error body: ${errorText}`);
      
      return new Response(
        JSON.stringify({ error: "upstream_error", details: errorText }), 
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    console.log(`[activities] Success: ${data.length} activities returned`);

    // Return with cache headers (60 seconds)
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=60",
      },
    });

  } catch (err) {
    console.error("[activities] Internal error:", err);
    return new Response(
      JSON.stringify({ 
        error: "internal_error", 
        message: err instanceof Error ? err.message : String(err) 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
