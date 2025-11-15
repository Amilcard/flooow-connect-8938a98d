import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Calendar, Users, Euro, Settings } from "lucide-react";
import { LoadingState } from "@/components/LoadingState";

const StructureDashboard = () => {
  const navigate = useNavigate();

  // Check if user is a structure
  const { data: userRole, isLoading: loadingRole } = useQuery({
    queryKey: ["user-role"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "structure")
        .maybeSingle();

      if (error || !data) {
        throw new Error("Accès non autorisé");
      }

      return data;
    }
  });

  // Fetch structure's activities
  const { data: activities = [], isLoading: loadingActivities } = useQuery({
    queryKey: ["structure-activities"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get structure associated with this user via user_roles
      const { data: userRoleData } = await supabase
        .from("user_roles")
        .select("territory_id")
        .eq("user_id", user.id)
        .eq("role", "structure")
        .maybeSingle();

      if (!userRoleData) return [];

      // Get structures in this territory
      const { data: structureData } = await supabase
        .from("structures")
        .select("id")
        .eq("territory_id", userRoleData.territory_id)
        .maybeSingle();

      if (!structureData) return [];

      // Get activities for this structure
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("structure_id", structureData.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userRole
  });

  if (loadingRole || loadingActivities) {
    return <LoadingState />;
  }

  if (!userRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-6 max-w-md text-center">
          <p className="text-muted-foreground mb-4">
            Cette page est réservée aux structures
          </p>
          <Button onClick={() => navigate("/home")}>
            Retour à l'accueil
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary-light text-white p-6">
        <div className="container">
          <h1 className="text-2xl font-bold mb-2">Espace Structure</h1>
          <p className="text-white/90">Gérez vos activités</p>
        </div>
      </div>

      <div className="container px-4 py-6 space-y-6">
        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{activities.length}</p>
            <p className="text-sm text-muted-foreground">Activités</p>
          </Card>
          <Card className="p-4 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">-</p>
            <p className="text-sm text-muted-foreground">Réservations</p>
          </Card>
        </div>

        {/* Create activity button */}
        <Button
          onClick={() => navigate("/structure/activity/new")}
          className="w-full h-14 text-lg"
          size="lg"
        >
          <Plus className="mr-2" />
          Créer une nouvelle activité
        </Button>

        {/* Activities list */}
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Mes activités</h2>
          
          {activities.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                Vous n'avez pas encore d'activité
              </p>
              <Button onClick={() => navigate("/structure/activity/new")}>
                Créer ma première activité
              </Button>
            </Card>
          ) : (
            activities.map((activity) => (
              <Card
                key={activity.id}
                className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate(`/structure/activity/${activity.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{activity.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Euro size={14} />
                        {activity.price_base === 0 ? "Gratuit" : `${activity.price_base}€`}
                      </span>
                      <span>{activity.category}</span>
                      <span>{activity.published ? "✅ Publié" : "⏸️ Brouillon"}</span>
                    </div>
                  </div>
                  <Settings size={20} className="text-muted-foreground" />
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StructureDashboard;
