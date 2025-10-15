import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTerritoryAccess = (postalCode: string | null) => {
  return useQuery({
    queryKey: ["territory-access", postalCode],
    queryFn: async () => {
      if (!postalCode) return { hasAccess: false, territory: null };

      const { data, error } = await supabase
        .from("territories")
        .select("*")
        .contains("postal_codes", [postalCode])
        .eq("type", "commune")
        .single();

      if (error || !data) {
        return { hasAccess: false, territory: null };
      }

      return {
        hasAccess: data.covered === true,
        territory: data
      };
    },
    enabled: !!postalCode
  });
};
