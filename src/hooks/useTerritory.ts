import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

/**
 * Type pour la clé de territoire (source unique de vérité)
 */
export type TerritoryKey = 
  | "saint-etienne"
  | "lyon"
  | "grenoble"
  | "marseille"
  | "paris"
  | null;

export interface Territory {
  id: string;
  name: string;
  type: string;
  postal_codes: string[];
  key: TerritoryKey;
}

/**
 * Hook centralisé pour gérer le territoire de l'utilisateur
 * C'est la SOURCE UNIQUE DE VÉRITÉ pour tout ce qui concerne le territoire
 */
export const useTerritory = () => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: territory, isLoading, error } = useQuery({
    queryKey: ["user-territory", user?.id],
    queryFn: async () => {
      if (!isAuthenticated || !user) {
        // Utilisateur non connecté : vérifier localStorage
        const storedTerritoryId = localStorage.getItem("userTerritoryId");
        if (storedTerritoryId) {
          const { data: territoryData } = await supabase
            .from("territories")
            .select("id, name, type, postal_codes")
            .eq("id", storedTerritoryId)
            .maybeSingle();

          if (territoryData) {
            return {
              ...territoryData,
              key: mapTerritoryToKey(territoryData.name),
            };
          }
        }
        return null;
      }

      // Utilisateur connecté : récupérer depuis le profil
      const { data: profile } = await supabase
        .from("profiles")
        .select("territory_id, postal_code")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile?.territory_id) {
        return null;
      }

      const { data: territoryData } = await supabase
        .from("territories")
        .select("id, name, type, postal_codes")
        .eq("id", profile.territory_id)
        .maybeSingle();

      if (!territoryData) {
        return null;
      }

      return {
        ...territoryData,
        key: mapTerritoryToKey(territoryData.name),
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: true, // Toujours actif, même si non connecté
  });

  /**
   * Met à jour le territoire de l'utilisateur
   */
  const setTerritory = async (territoryId: string) => {
    // Sauvegarder dans localStorage pour les utilisateurs non connectés
    localStorage.setItem("userTerritoryId", territoryId);

    // Si connecté, mettre à jour le profil
    if (isAuthenticated && user) {
      await supabase
        .from("profiles")
        .update({ territory_id: territoryId })
        .eq("id", user.id);
    }

    // Invalider le cache pour recharger
    queryClient.invalidateQueries({ queryKey: ["user-territory"] });
  };

  /**
   * Efface le territoire (pour logout ou changement)
   */
  const clearTerritory = () => {
    localStorage.removeItem("userTerritoryId");
    localStorage.removeItem("userPostalCode");
    queryClient.invalidateQueries({ queryKey: ["user-territory"] });
  };

  return {
    territory,
    territoryKey: territory?.key || null,
    territoryId: territory?.id || null,
    territoryName: territory?.name || null,
    isLoading,
    error,
    setTerritory,
    clearTerritory,
    hasTerritory: !!territory,
  };
};

/**
 * Mappe le nom du territoire vers une clé simplifiée
 */
function mapTerritoryToKey(territoryName: string): TerritoryKey {
  const name = territoryName.toLowerCase();

  if (name.includes("saint-étienne") || name.includes("saint-etienne") || name.includes("saint étienne")) {
    return "saint-etienne";
  }
  if (name.includes("lyon")) {
    return "lyon";
  }
  if (name.includes("grenoble")) {
    return "grenoble";
  }
  if (name.includes("marseille") || name.includes("aix-marseille")) {
    return "marseille";
  }
  if (name.includes("paris") || name.includes("île-de-france") || name.includes("ile-de-france")) {
    return "paris";
  }

  return null;
}
