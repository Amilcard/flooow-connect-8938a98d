import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Activity } from "./useActivities";

interface MockActivity {
  id: string;
  theme: string;
  titre: string;
  description: string;
  ageMin: number;
  ageMax: number;
  cout: number;
  lieu: {
    nom: string;
    adresse: string;
    transport: string;
  };
  accessibilite: string[];
  aidesEligibles: string[]; // Format simplifié: ["Pass'Sport", "CAF/VACAF", "ANCV"]
  mobilite: {
    TC: string;     // Format: "Ligne T3 STAS"
    velo: boolean;  // true/false
    covoit: boolean; // true/false
  };
}

const mapMockToActivity = (mock: MockActivity): Activity => {
  return {
    id: mock.id,
    title: mock.titre,
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=600&fit=crop",
    ageRange: `${mock.ageMin}-${mock.ageMax} ans`,
    category: mock.theme,
    categories: [mock.theme],
    price: mock.cout,
    hasAccessibility: mock.accessibilite.length > 0,
    hasFinancialAid: mock.aidesEligibles.length > 0,
    periodType: "annual",
    structureName: mock.lieu.nom,
    structureAddress: mock.lieu.adresse,
  };
};

export const useMockActivities = (limit?: number) => {
  return useQuery({
    queryKey: ["mock-activities", "b2ef1", limit], // Version key to bust cache
    enabled: true,
    staleTime: 0, // Data is always stale
    gcTime: 0, // No garbage collection cache  
    refetchOnMount: 'always', // Always refetch on mount
    refetchOnWindowFocus: true, // Refetch on window focus
    retry: 2,
    retryDelay: 1000,
    queryFn: async () => {
      console.log("🔵 Fetching mock activities from Edge Function...");
      
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
        throw error;
      }

      console.log("✅ Mock activities received:", data?.length || 0);
      
      const mockActivities = (data || []) as MockActivity[];
      const mappedActivities = mockActivities.map(mapMockToActivity);
      
      return limit ? mappedActivities.slice(0, limit) : mappedActivities;
    },
  });
};
