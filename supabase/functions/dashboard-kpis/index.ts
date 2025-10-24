import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Fetching dashboard KPIs...');

    // 1. Total inscriptions (bookings validées)
    const { count: totalInscriptions } = await supabaseClient
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'validee');

    // 2. % handicap parmi les enfants inscrits
    const { data: bookingsForChildren } = await supabaseClient
      .from('bookings')
      .select('child_id')
      .eq('status', 'validee');

    const childIds = bookingsForChildren?.map(b => b.child_id) || [];
    
    const { data: childrenData } = await supabaseClient
      .from('children')
      .select('accessibility_flags')
      .in('id', childIds);

    const childrenWithDisability = childrenData?.filter(
      child => child.accessibility_flags && 
               (child.accessibility_flags.mobility_impaired || 
                child.accessibility_flags.visual_impaired || 
                child.accessibility_flags.hearing_impaired)
    ).length || 0;

    const handicapPercentage = childrenData?.length 
      ? ((childrenWithDisability / childrenData.length) * 100).toFixed(1)
      : '0';

    // 3. % QPV - Calcul basé sur city_insee des profils vs référentiel QPV
    const { data: profilesData } = await supabaseClient
      .from('profiles')
      .select('city_insee')
      .not('city_insee', 'is', null);

    const totalProfiles = profilesData?.length || 0;
    
    // Récupérer tous les codes INSEE QPV du référentiel
    const { data: qpvData } = await supabaseClient
      .from('qpv_reference')
      .select('code_insee');

    const qpvCodeInsee = new Set(qpvData?.map(q => q.code_insee) || []);
    
    // Compter les profils en QPV
    const profilesInQPV = profilesData?.filter(
      profile => profile.city_insee && qpvCodeInsee.has(profile.city_insee)
    ).length || 0;

    const qpvPercentage = totalProfiles > 0 
      ? ((profilesInQPV / totalProfiles) * 100).toFixed(1)
      : '0';
    
    const qpvNote = qpvData && qpvData.length > 0 
      ? `Basé sur ${qpvData.length} codes INSEE QPV du référentiel`
      : "Référentiel QPV vide - aucune donnée QPV chargée";

    // 4. Répartition mobilité
    const { data: mobilityData } = await supabaseClient
      .from('bookings')
      .select('transport_mode')
      .eq('status', 'validee')
      .not('transport_mode', 'is', null)
      .not('transport_mode', 'eq', 'non_renseigne');

    const mobilityStats = mobilityData?.reduce((acc, booking) => {
      const mode = booking.transport_mode || 'non_renseigne';
      acc[mode] = (acc[mode] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const totalMobility = (Object.values(mobilityStats) as number[]).reduce((sum, count) => sum + count, 0);
    const mobilityDistribution = Object.entries(mobilityStats).map(([mode, count]) => ({
      mode,
      count,
      percentage: totalMobility > 0 ? (((count as number) / totalMobility) * 100).toFixed(1) : '0'
    }));

    // 5. Indicateur santé - Minutes d'activité/semaine
    // Calcul basé sur : slots.start/end pour durée moyenne × nb réservations validées
    const { data: slotsData } = await supabaseClient
      .from('availability_slots')
      .select(`
        start,
        end,
        bookings!inner(status)
      `)
      .eq('bookings.status', 'validee');

    let totalMinutes = 0;
    let activitiesCount = 0;

    slotsData?.forEach(slot => {
      const start = new Date(slot.start);
      const end = new Date(slot.end);
      const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
      totalMinutes += durationMinutes;
      activitiesCount++;
    });

    const avgMinutesPerActivity = activitiesCount > 0 
      ? (totalMinutes / activitiesCount).toFixed(0)
      : '0';

    // Estimation hebdomadaire (hypothèse : 1 activité/semaine en moyenne)
    const weeklyActivityMinutes = avgMinutesPerActivity;

    const response = {
      kpis: {
        inscriptions: {
          total: totalInscriptions || 0,
          source: "bookings.status = 'validee'",
          description: "Nombre total de réservations validées"
        },
        handicap: {
          percentage: handicapPercentage,
          count: childrenWithDisability,
          total: childrenData?.length || 0,
          source: "children.accessibility_flags (mobility/visual/hearing_impaired)",
          description: "Pourcentage d'enfants avec handicap déclaré parmi les inscrits"
        },
        qpv: {
          percentage: qpvPercentage,
          note: qpvNote,
          source: "profiles.city_insee (à croiser avec référentiel QPV)",
          description: "Pourcentage d'habitants en Quartier Prioritaire de la Ville"
        },
        mobilite: {
          distribution: mobilityDistribution,
          source: "bookings.transport_mode",
          description: "Répartition des modes de transport utilisés"
        },
        sante: {
          weeklyMinutes: weeklyActivityMinutes,
          avgPerActivity: avgMinutesPerActivity,
          source: "availability_slots.start/end × bookings validées",
          description: "Minutes d'activité physique par semaine (estimation)"
        }
      },
      timestamp: new Date().toISOString()
    };

    console.log('KPIs calculated:', response);

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error calculating KPIs:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
