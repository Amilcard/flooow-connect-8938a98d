import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityCard } from "@/components/Activity/ActivityCard";
import { BottomNavigation } from "@/components/BottomNavigation";
import { SearchBar } from "@/components/SearchBar";
import { LoadingState } from "@/components/LoadingState";
import { AlertCircle, ListTodo } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

const Alternatives = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activityId = searchParams.get("activityId");
  const [joinWaitlist, setJoinWaitlist] = useState(false);

  // Fetch original activity for context
  const { data: originalActivity } = useQuery({
    queryKey: ["activity", activityId],
    queryFn: async () => {
      if (!activityId) return null;
      const { data } = await supabase
        .from("activities")
        .select("*")
        .eq("id", activityId)
        .single();
      return data;
    },
    enabled: !!activityId,
  });

  // Fetch similar activities (simple logic: same category)
  const { data: alternatives, isLoading } = useQuery({
    queryKey: ["alternatives", activityId, originalActivity?.category],
    queryFn: async () => {
      if (!originalActivity) return [];
      
      const { data } = await supabase
        .from("activities")
        .select("*")
        .eq("category", originalActivity.category)
        .eq("published", true)
        .neq("id", activityId)
        .limit(5);
      
      return data || [];
    },
    enabled: !!originalActivity,
  });

  const handleWaitlist = async () => {
    if (!joinWaitlist) {
      toast.error("Cochez la case pour rejoindre la liste d'attente");
      return;
    }

    // TODO: Implement waitlist logic
    toast.success("Vous êtes inscrit(e) à la liste d'attente !");
    navigate("/mon-compte");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <SearchBar />
      
      <div className="container py-6 space-y-6">
        <BackButton fallback="/" showText={true} className="gap-2" size="default" />

        {/* Refusal notice */}
        <Card className="border-2 border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle size={20} />
              Réservation refusée
            </CardTitle>
            <CardDescription>
              Malheureusement, votre demande pour "{originalActivity?.title}" a été refusée.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Ne vous inquiétez pas ! Nous avons trouvé des activités similaires qui pourraient vous intéresser.
            </p>
          </CardContent>
        </Card>

        {/* Waitlist option */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ListTodo size={18} />
              Liste d'attente
            </CardTitle>
            <CardDescription>
              Souhaitez-vous être notifié(e) si des places se libèrent ?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="waitlist"
                checked={joinWaitlist}
                onCheckedChange={(checked) => setJoinWaitlist(checked as boolean)}
              />
              <Label
                htmlFor="waitlist"
                className="text-sm font-normal cursor-pointer"
              >
                Oui, je souhaite rejoindre la liste d'attente
              </Label>
            </div>
            
            <Button
              onClick={handleWaitlist}
              disabled={!joinWaitlist}
              variant="outline"
              className="w-full"
            >
              Rejoindre la liste d'attente
            </Button>
          </CardContent>
        </Card>

        {/* Alternative activities */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Activités similaires</h2>
            {alternatives && alternatives.length > 0 && (
              <Badge variant="secondary">{alternatives.length} trouvée(s)</Badge>
            )}
          </div>

          {isLoading ? (
            <LoadingState />
          ) : alternatives && alternatives.length > 0 ? (
            <div className="grid gap-4">
              {alternatives.map((activity: any) => (
                <ActivityCard
                  key={activity.id}
                  id={activity.id}
                  title={activity.title}
                  image={activity.images?.[0] || ""}
                  category={activity.category}
                  price={activity.price_base}
                  ageRange={`${activity.age_min}-${activity.age_max} ans`}
                  hasAccessibility={activity.accessibility_checklist?.wheelchair}
                  hasFinancialAid={activity.accepts_aid_types?.length > 0}
                  onRequestClick={() => navigate(`/activity/${activity.id}`)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  Aucune alternative trouvée pour le moment
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate("/activities")}
                >
                  Voir toutes les activités
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Alternatives;
