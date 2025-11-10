import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect } from "react";

export type RegistrationStatus = 'interested' | 'going' | 'cancelled';

export const useEventRegistration = (eventId: string, userId: string | undefined) => {
  const queryClient = useQueryClient();

  // Récupérer le statut d'inscription de l'utilisateur
  const { data: userRegistration, isLoading } = useQuery({
    queryKey: ["event-registration", eventId, userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("event_id", eventId)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!userId && !!eventId,
  });

  // Récupérer les statistiques de l'événement
  const { data: stats } = useQuery({
    queryKey: ["event-stats", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_stats")
        .select("*")
        .eq("event_id", eventId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });

  // Récupérer la liste des participants
  const { data: participants } = useQuery({
    queryKey: ["event-participants", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_registrations")
        .select(`
          id,
          status,
          created_at,
          profiles!event_registrations_user_id_fkey (
            id,
            email
          )
        `)
        .eq("event_id", eventId)
        .in("status", ["interested", "going"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });

  // S'abonner aux changements en temps réel
  useEffect(() => {
    if (!eventId) return;

    const channel = supabase
      .channel(`event-registrations-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_registrations',
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          // Rafraîchir les données quand il y a un changement
          queryClient.invalidateQueries({ queryKey: ["event-stats", eventId] });
          queryClient.invalidateQueries({ queryKey: ["event-participants", eventId] });
          queryClient.invalidateQueries({ queryKey: ["event-registration", eventId, userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, userId, queryClient]);

  // Mutation pour s'inscrire/changer de statut
  const register = useMutation({
    mutationFn: async (status: RegistrationStatus) => {
      if (!userId) throw new Error("User must be logged in");

      if (userRegistration) {
        // Mettre à jour le statut existant
        const { error } = await supabase
          .from("event_registrations")
          .update({ status })
          .eq("id", userRegistration.id);

        if (error) throw error;
      } else {
        // Créer une nouvelle inscription
        const { error } = await supabase
          .from("event_registrations")
          .insert({
            user_id: userId,
            event_id: eventId,
            status,
          });

        if (error) throw error;
      }
    },
    onSuccess: (_, status) => {
      queryClient.invalidateQueries({ queryKey: ["event-registration", eventId, userId] });
      queryClient.invalidateQueries({ queryKey: ["event-stats", eventId] });
      queryClient.invalidateQueries({ queryKey: ["event-participants", eventId] });
      
      const messages = {
        interested: "Événement ajouté à vos intéressés",
        going: "Participation confirmée !",
        cancelled: "Inscription annulée",
      };
      toast.success(messages[status]);
    },
    onError: () => {
      toast.error("Erreur lors de l'inscription");
    },
  });

  // Mutation pour se désinscrire
  const unregister = useMutation({
    mutationFn: async () => {
      if (!userId || !userRegistration) throw new Error("No registration found");

      const { error } = await supabase
        .from("event_registrations")
        .delete()
        .eq("id", userRegistration.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-registration", eventId, userId] });
      queryClient.invalidateQueries({ queryKey: ["event-stats", eventId] });
      queryClient.invalidateQueries({ queryKey: ["event-participants", eventId] });
      toast.success("Désinscription réussie");
    },
    onError: () => {
      toast.error("Erreur lors de la désinscription");
    },
  });

  return {
    userRegistration,
    isLoading,
    stats,
    participants,
    register,
    unregister,
    isRegistered: !!userRegistration && userRegistration.status !== 'cancelled',
  };
};
