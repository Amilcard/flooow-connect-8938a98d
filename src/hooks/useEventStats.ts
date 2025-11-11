import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EventStats {
  event_id: string;
  title: string;
  start_date: string;
  end_date: string;
  total_registrations: number;
  confirmed_count: number;
  interested_count: number;
  favorites_count: number;
  emails_sent: number;
  emails_opened: number;
  emails_clicked: number;
  email_open_rate: number;
  email_click_rate: number;
  conversion_rate: number;
}

export const useEventStats = (territoryId?: string) => {
  return useQuery({
    queryKey: ["event-stats", territoryId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_organizer_event_stats" as any, {
        p_territory_id: territoryId || null,
      });

      if (error) throw error;
      return (data || []) as EventStats[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
