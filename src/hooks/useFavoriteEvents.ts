import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useFavoriteEvents = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["favorite-events", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("favorite_events")
        .select("event_id")
        .eq("user_id", userId);

      if (error) throw error;
      return data.map(f => f.event_id);
    },
    enabled: !!userId,
  });

  const toggleFavorite = useMutation({
    mutationFn: async (eventId: string) => {
      if (!userId) throw new Error("User must be logged in");

      const isFavorite = favorites.includes(eventId);

      if (isFavorite) {
        const { error } = await supabase
          .from("favorite_events")
          .delete()
          .eq("user_id", userId)
          .eq("event_id", eventId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("favorite_events")
          .insert({ user_id: userId, event_id: eventId });

        if (error) throw error;
      }

      return !isFavorite;
    },
    onSuccess: (isFavorite) => {
      queryClient.invalidateQueries({ queryKey: ["favorite-events", userId] });
      toast.success(isFavorite ? "Événement ajouté aux favoris" : "Événement retiré des favoris");
    },
    onError: () => {
      toast.error("Erreur lors de la sauvegarde");
    },
  });

  const isFavorite = (eventId: string) => favorites.includes(eventId);

  return {
    favorites,
    isLoading,
    toggleFavorite,
    isFavorite,
  };
};
