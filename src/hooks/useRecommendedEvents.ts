import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RecommendedEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  start_date: string;
  end_date: string;
  location: string | null;
  image_url: string | null;
  external_link: string | null;
  organizer_name: string | null;
  organizer_contact: string | null;
  territory_id: string;
  territory_name: string;
  relevance_score: number;
  recommendation_reason: string;
}

export const useRecommendedEvents = (userId: string | undefined, limit: number = 6) => {
  return useQuery({
    queryKey: ["recommended-events", userId, limit],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase.rpc("get_recommended_events", {
        p_user_id: userId,
        p_limit: limit,
      });

      if (error) throw error;
      return (data as RecommendedEvent[]) || [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
