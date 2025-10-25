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
    console.log('📊 Fetching MOCK dashboard KPIs for demo...');

    // Données mock réalistes pour Saint-Étienne Métropole
    const mockResponse = {
      kpis: {
        inscriptions: {
          total: 347,
          source: "MOCK - Données démo",
          description: "Nombre total de réservations validées"
        },
        handicap: {
          percentage: "12.5",
          count: 43,
          total: 347,
          source: "MOCK - children.accessibility_flags",
          description: "Pourcentage d'enfants avec handicap déclaré parmi les inscrits"
        },
        qpv: {
          percentage: "18.3",
          note: "64 profils en QPV sur 350 (basé sur codes postaux)",
          source: "MOCK - profiles.city_insee QPV",
          description: "Pourcentage d'habitants en Quartier Prioritaire de la Ville"
        },
        mobilite: {
          distribution: [
            { mode: "bus", count: 142, percentage: "40.9" },
            { mode: "car", count: 98, percentage: "28.2" },
            { mode: "bike", count: 67, percentage: "19.3" },
            { mode: "covoiturage", count: 28, percentage: "8.1" },
            { mode: "walking", count: 12, percentage: "3.5" }
          ],
          source: "MOCK - bookings.transport_mode",
          description: "Répartition des modes de transport utilisés"
        },
        sante: {
          weeklyMinutes: "90",
          avgPerActivity: "90",
          source: "MOCK - availability_slots × bookings",
          description: "Minutes d'activité physique par semaine (estimation)"
        }
      },
      _demo: true,
      timestamp: new Date().toISOString()
    };

    console.log('✅ MOCK KPIs generated:', mockResponse);

    return new Response(
      JSON.stringify(mockResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('❌ Error generating mock KPIs:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
