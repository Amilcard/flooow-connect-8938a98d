import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook pour récupérer le territoire de l'utilisateur connecté
 * Retourne les infos du territoire + une clé simplifiée pour les mappings d'aides/mobilité
 */
export const useUserTerritory = () => {
  return useQuery({
    queryKey: ["user-territory"],
    queryFn: async () => {
      // 1. Récupérer l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // 2. Récupérer le profil avec territory_id
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("territory_id, postal_code")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError || !profile || !profile.territory_id) {
        return null;
      }

      // 3. Récupérer les détails du territoire
      const { data: territory, error: territoryError } = await supabase
        .from("territories")
        .select("id, name, type, postal_codes")
        .eq("id", profile.territory_id)
        .maybeSingle();

      if (territoryError || !territory) {
        return null;
      }

      // 4. Mapper vers une clé simple pour TERRITORY_AIDS et TERRITORY_MOBILITY
      // Basé sur le nom du territoire
      const territoryKey = mapTerritoryToKey(territory.name);

      return {
        id: territory.id,
        name: territory.name,
        type: territory.type,
        postal_codes: territory.postal_codes,
        key: territoryKey, // Clé simplifiée pour les mappings
        profile_postal_code: profile.postal_code
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Mappe le nom du territoire vers une clé simplifiée
 * utilisée dans TERRITORY_AIDS et TERRITORY_MOBILITY
 */
function mapTerritoryToKey(territoryName: string): string | null {
  const name = territoryName.toLowerCase();
  
  if (name.includes("saint-étienne") || name.includes("saint-etienne")) {
    return "saint-etienne";
  }
  if (name.includes("lyon")) {
    return "lyon";
  }
  if (name.includes("grenoble")) {
    return "grenoble";
  }
  if (name.includes("marseille")) {
    return "marseille";
  }
  if (name.includes("paris")) {
    return "paris";
  }
  
  return null; // Territoire non configuré dans les données
}
