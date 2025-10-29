import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Activity } from "@/types/domain";
import { validateAndParseActivity } from "@/types/schemas";
import type { ActivityRaw } from "@/types/domain";

export const useMockActivities = (limit?: number) => {
  return useQuery({
    queryKey: ["mock-activities", "b2ef1", limit], // Version key to bust cache
    enabled: true,
    staleTime: 60000, // Cache 1 minute
    gcTime: 300000, // Cache 5 minutes
    refetchOnMount: false, // Pas de refetch automatique
    refetchOnWindowFocus: false, // Pas de refetch au focus
    retry: 0, // Pas de retry automatique (évite saccades)
    queryFn: async () => {
      console.log("🔵 [D1] Fetching mock activities from Edge Function...");

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
        console.error("❌ Error fetching mock activities:", error);
        // Fallback sur tableau vide au lieu d'erreur
        return [];
      }

      console.log("✅ Mock activities received:", data?.length || 0);
      
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
            console.warn(`🟨 [D1] Activité ${raw.id} corrigée via defaults:`, result.errors);
          }
        } else {
          console.error(`❌ [D1] Activité ${raw.id} rejetée (erreur critique)`);
        }
      });
      
      console.log(`📊 [D1] Validation: ${validCount} OK / ${correctedCount} corrigées / ${mockActivities.length - validatedActivities.length} rejetées`);
      
      return limit ? validatedActivities.slice(0, limit) : validatedActivities;
    },
  });
};
