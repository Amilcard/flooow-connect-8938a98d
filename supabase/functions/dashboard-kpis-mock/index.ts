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

    // Données mock cohérentes pour Saint-Étienne Métropole
    // TOTAUX COHÉRENTS: 508 inscrits (156 + 218 + 134)
    const mockResponse = {
      kpis: {
        inscriptions: {
          total: 508,
          source: "MOCK - Somme cohérente des 3 quartiers",
          description: "Nombre total de réservations validées (La Ricamarie: 156, Grand Clos: 218, Crêt de Roch: 134)"
        },
        handicap: {
          percentage: "12.4",
          count: 63,
          total: 508,
          source: "MOCK - children.accessibility_flags",
          description: "Pourcentage d'enfants avec handicap déclaré parmi les inscrits (19+28+16)"
        },
        qpv: {
          percentage: "74.6",
          note: "379 profils en QPV sur 508 (117+172+90)",
          source: "MOCK - profiles.city_insee QPV",
          description: "Pourcentage d'habitants en Quartier Prioritaire de la Ville"
        },
        mobilite: {
          distribution: [
            { mode: "bus", count: 312, percentage: "61.4" },
            { mode: "voiture", count: 94, percentage: "18.5" },
            { mode: "velo", count: 60, percentage: "11.8" },
            { mode: "covoiturage", count: 28, percentage: "5.5" },
            { mode: "marche", count: 14, percentage: "2.8" }
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
      _note: "Données mock cohérentes avec territoriesData dans dashboardMockData.ts",
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
