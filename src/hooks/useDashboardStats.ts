import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCollectiviteDashboard = (territoryId?: string) => {
  return useQuery({
    queryKey: ['collectivite-dashboard', territoryId],
    queryFn: async () => {
      let query = supabase
        .from('vw_dashboard_collectivite_overview')
        .select('*');
      
      if (territoryId) {
        query = query.eq('territory_id', territoryId);
      }
      
      const { data, error } = await query.single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!territoryId,
  });
};

export const useFinanceurDashboard = () => {
  return useQuery({
    queryKey: ['financeur-dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_dashboard_financeur_aid_usage')
        .select('*')
        .order('total_simulations', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useTerritoryStats = (territoryId?: string) => {
  return useQuery({
    queryKey: ['territory-stats', territoryId],
    queryFn: async () => {
      let query = supabase
        .from('territory_user_stats')
        .select('*');
      
      if (territoryId) {
        query = query.eq('territory_id', territoryId);
      }
      
      const { data, error } = await query.single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!territoryId,
  });
};

export const useBookingsStats = () => {
  return useQuery({
    queryKey: ['bookings-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('status, created_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Agrégation par statut
      const stats = data.reduce((acc, booking) => {
        acc[booking.status] = (acc[booking.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return {
        total: data.length,
        byStatus: stats,
        recent: data.slice(0, 10),
      };
    },
  });
};