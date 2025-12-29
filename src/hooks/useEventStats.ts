import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * RPC function name - exists in DB but not in generated Supabase types.
 * TODO: Regenerate types with `supabase gen types typescript`
 */
const GET_ORGANIZER_EVENT_STATS_RPC = "get_organizer_event_stats" as const;

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- RPC not in generated types
      const { data, error } = await supabase.rpc(GET_ORGANIZER_EVENT_STATS_RPC as any, {
        p_territory_id: territoryId || null,
      });

      if (error) throw error;
      return (data || []) as EventStats[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
