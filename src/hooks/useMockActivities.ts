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
  aidesEligibles: string[];
  mobilite: {
    transportCommun: { disponible: boolean; lignes: string[] };
    velo: { disponible: boolean; station: string };
    covoiturage: { disponible: boolean };
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
    queryKey: ["mock-activities", limit],
    enabled: true, // Force l'exécution
    retry: 1,
    queryFn: async () => {
      console.log("🔵 Fetching mock activities from Edge Function...");
      
      const { data, error } = await supabase.functions.invoke('mock-activities', {
        headers: { 'Content-Type': 'application/json' }
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
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
