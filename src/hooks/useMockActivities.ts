import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Activity } from "@/types/domain";
import { validateAndParseActivity } from "@/types/schemas";
import type { ActivityRaw } from "@/types/domain";

export const useMockActivities = (limit?: number) => {
  return useQuery({
    queryKey: ["mock-activities", "b2ef1", limit],
    enabled: true,
    staleTime: 300000, // 5 minutes (cache plus long)
    gcTime: 600000, // 10 minutes
    refetchOnMount: false, // Pas de refetch automatique
    refetchOnWindowFocus: false,
    retry: false, // Pas de retry automatique (évite saccades)
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('mock-activities', {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        },
        body: {
          _ts: Date.now(),
          _v: 'b2ef1' // Version parameter to bust CDN cache
        }
      });

      if (error) {
        // Fallback sur tableau vide au lieu d'erreur
        return [];
      }
      
      const mockActivities = (data || []) as ActivityRaw[];
      
      // [D1] Validation avec safeParse + logging des écarts
      const validatedActivities: Activity[] = [];
      let validCount = 0;
      let correctedCount = 0;
      
      mockActivities.forEach((raw) => {
        const result = validateAndParseActivity(raw);

        if (result.activity) {
          validatedActivities.push(result.activity);

          if (result.success) {
            validCount++;
          } else {
            correctedCount++;
          }
        }
      });
      
      return limit ? validatedActivities.slice(0, limit) : validatedActivities;
    },
  });
};
