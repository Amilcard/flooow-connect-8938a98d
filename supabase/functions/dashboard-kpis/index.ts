import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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

    // 3. % QPV - Utilisation de la vue v_qpv_stats (basée sur codes postaux)
    const { data: qpvStats } = await supabaseClient
      .from('v_qpv_stats')
      .select('*')
      .single();

    const qpvPercentage = qpvStats?.qpv_percentage?.toFixed(1) || '0';
    const totalProfiles = qpvStats?.total_profiles || 0;
    const profilesInQPV = qpvStats?.qpv_profiles || 0;
    
    const qpvNote = totalProfiles > 0 
      ? `${profilesInQPV} profils en QPV sur ${totalProfiles} (basé sur codes postaux)`
      : "Aucun profil avec code postal renseigné";

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

    // 6. Nb recherches (nouveauté - tracking)
    const { count: totalSearches } = await supabaseClient
      .from('search_logs')
      .select('*', { count: 'exact', head: true });

    // 7. Top 5 activités consultées (nouveauté - tracking)
    const { data: activityViewsAgg } = await supabaseClient
      .from('activity_views')
      .select('activity_id');
    
    const viewCounts = activityViewsAgg?.reduce((acc: Record<string, number>, view) => {
      acc[view.activity_id] = (acc[view.activity_id] || 0) + 1;
      return acc;
    }, {}) || {};

    const topActivitiesIds = Object.entries(viewCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([id]) => id);

    const { data: topActivities } = topActivitiesIds.length > 0 
      ? await supabaseClient
          .from('activities')
          .select('id, title, category')
          .in('id', topActivitiesIds)
      : { data: [] };

    const topActivitiesWithViews = topActivities?.map(act => ({
      ...act,
      views: viewCounts[act.id] || 0
    })).sort((a, b) => b.views - a.views) || [];

    // 8. Taux conversion (vues → réservations)
    const { count: totalViews } = await supabaseClient
      .from('activity_views')
      .select('*', { count: 'exact', head: true });

    const conversionRate = totalViews && totalViews > 0
      ? (((totalInscriptions || 0) / totalViews) * 100).toFixed(1)
      : '0';

    // 9. Taux participation réelle (confirmée)
    const { count: confirmedParticipations } = await supabaseClient
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('participation_confirmed', true);

    const participationRate = totalInscriptions && totalInscriptions > 0
      ? (((confirmedParticipations || 0) / totalInscriptions) * 100).toFixed(1)
      : '0';

    // 10. Impact par territoire
    const { data: territoryBookings } = await supabaseClient
      .from('bookings')
      .select(`
        id,
        activities!inner(
          structure_id,
          structures!inner(
            territory_id,
            territories(name)
          )
        )
      `)
      .eq('status', 'validee');

    const territoryStats = territoryBookings?.reduce((acc: Record<string, any>, booking: any) => {
      const territoryId = booking.activities?.structures?.territory_id;
      const territoryName = booking.activities?.structures?.territories?.name;
      
      if (territoryId && territoryName) {
        if (!acc[territoryId]) {
          acc[territoryId] = {
            territory_id: territoryId,
            territory_name: territoryName,
            bookings_count: 0
          };
        }
        acc[territoryId].bookings_count++;
      }
      return acc;
    }, {}) || {};

    const territoryImpact = Object.values(territoryStats)
      .sort((a: any, b: any) => b.bookings_count - a.bookings_count)
      .slice(0, 10); // Top 10 territoires

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
        },
        // NOUVEAUX KPIs basés sur tracking
        recherches: {
          total: totalSearches || 0,
          source: "search_logs",
          description: "Nombre total de recherches effectuées sur la plateforme"
        },
        topActivites: {
          activities: topActivitiesWithViews,
          source: "activity_views (agrégation)",
          description: "Top 5 des activités les plus consultées"
        },
        conversion: {
          rate: conversionRate,
          views: totalViews || 0,
          bookings: totalInscriptions || 0,
          source: "activity_views + bookings",
          description: "Taux de conversion (consultations → réservations)"
        },
        participation: {
          rate: participationRate,
          confirmed: confirmedParticipations || 0,
          total: totalInscriptions || 0,
          source: "bookings.participation_confirmed",
          description: "Taux de participation effective (présence confirmée)"
        },
        territories: {
          impact: territoryImpact,
          source: "bookings + structures + territories",
          description: "Répartition des inscriptions par territoire"
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
