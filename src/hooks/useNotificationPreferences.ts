import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NotificationPreferences {
  id?: string;
  user_id: string;
  interested_categories: string[];
  notify_territory_events: boolean;
  notify_favorite_categories: boolean;
  email_notifications: boolean;
}

export const useNotificationPreferences = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ["notification-preferences", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("notification_preferences" as any)
        .select("*")
        .eq("user_id", userId)
        .single();

      // Si aucune préférence n'existe, retourner des valeurs par défaut
      if (error && error.code === 'PGRST116') {
        return {
          user_id: userId,
          interested_categories: [],
          notify_territory_events: true,
          notify_favorite_categories: false,
          email_notifications: false,
        };
      }

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const updatePreferences = useMutation({
    mutationFn: async (newPreferences: Partial<NotificationPreferences>) => {
      if (!userId) throw new Error("User must be logged in");

      const { data: existing } = await supabase
        .from("notification_preferences" as any)
        .select("id")
        .eq("user_id", userId)
        .single();

      if (existing) {
        // Mise à jour
        const { error } = await supabase
          .from("notification_preferences" as any)
          .update(newPreferences)
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        // Création
        const { error } = await supabase
          .from("notification_preferences" as any)
          .insert({
            user_id: userId,
            ...newPreferences,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences", userId] });
      toast.success("Préférences de notification mises à jour");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour des préférences");
    },
  });

  return {
    preferences,
    isLoading,
    updatePreferences,
  };
};
