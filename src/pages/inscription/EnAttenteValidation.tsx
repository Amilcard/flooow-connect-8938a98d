import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PageLayout from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Clock, CheckCircle2, XCircle, Home, RefreshCw } from "lucide-react";

type RequestStatus = "waiting_parent_link" | "parent_linked" | "validated" | "rejected" | "expired";

interface RequestData {
  id: string;
  status: RequestStatus;
  activity_id: string;
  slot_id: string | null;
  created_at: string;
  activity?: {
    title: string;
  };
}

const EnAttenteValidation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const activityId = searchParams.get("activityId");
  const requestId = searchParams.get("requestId");

  const [request, setRequest] = useState<RequestData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequestStatus();

    // Poll for status updates every 10 seconds
    const interval = setInterval(fetchRequestStatus, 10000);
    return () => clearInterval(interval);
  }, [user?.id, requestId]);

  const fetchRequestStatus = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      let query = supabase
        .from("child_temp_requests")
        .select(`
          id,
          status,
          activity_id,
          slot_id,
          created_at
        `)
        .eq("minor_profile_id", user.id)
        .order("created_at", { ascending: false });

      if (requestId) {
        query = query.eq("id", requestId);
      } else if (activityId) {
        query = query.eq("activity_id", activityId);
      }

      const { data, error } = await query.limit(1).single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching request:", error);
      }

      if (data) {
        setRequest(data as RequestData);

        // If validated, redirect to booking
        if (data.status === "validated") {
          setTimeout(() => {
            navigate(`/booking/${data.activity_id}${data.slot_id ? `?slotId=${data.slot_id}` : ""}`);
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusDisplay = () => {
    if (!request) return null;

    switch (request.status) {
      case "waiting_parent_link":
        return {
          icon: <Clock className="w-12 h-12 text-amber-500" />,
          title: "En attente de ton parent",
          description: "Ton parent doit saisir ton code dans son espace Flooow pour te lier a son compte.",
          color: "amber",
        };
      case "parent_linked":
        return {
          icon: <Clock className="w-12 h-12 text-primary" />,
          title: "Parent connecte !",
          description: "Ton parent a saisi ton code. Il doit maintenant valider ton inscription.",
          color: "primary",
        };
      case "validated":
        return {
          icon: <CheckCircle2 className="w-12 h-12 text-green-500" />,
          title: "Inscription validee !",
          description: "Super ! Ton parent a valide ton inscription. Tu vas etre redirige...",
          color: "green",
        };
      case "rejected":
        return {
          icon: <XCircle className="w-12 h-12 text-destructive" />,
          title: "Inscription refusee",
          description: "Ton parent n'a pas valide cette inscription. Tu peux discuter avec lui et reessayer.",
          color: "destructive",
        };
      case "expired":
        return {
          icon: <Clock className="w-12 h-12 text-muted-foreground" />,
          title: "Demande expiree",
          description: "Cette demande a expire. Tu peux en creer une nouvelle.",
          color: "muted",
        };
      default:
        return null;
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <PageLayout showHeader={false}>
      <PageHeader
        title="Suivi de ta demande"
        showBackButton={true}
        onBackClick={() => navigate("/home")}
      />

      <div className="max-w-[1200px] mx-auto px-4 space-y-6 pb-8">
        {/* Message inspirant Family Flooow */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/10 p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="text-base text-foreground font-medium">
                La Family Flooow veille sur toi
              </p>
              <p className="text-sm text-muted-foreground italic">
                "Pas de stress ! Des que ton parent valide, tu recevras une notification et tu pourras finaliser ton inscription."
              </p>
            </div>
          </div>
        </Card>

        {/* Status display */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <RefreshCw className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        ) : statusDisplay ? (
          <Card className="p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`p-4 rounded-full bg-${statusDisplay.color}/10`}>
                {statusDisplay.icon}
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {statusDisplay.title}
              </h2>
              <p className="text-muted-foreground max-w-sm">
                {statusDisplay.description}
              </p>
            </div>
          </Card>
        ) : (
          <Card className="p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <Clock className="w-12 h-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                Aucune demande en cours trouvee.
              </p>
            </div>
          </Card>
        )}

        {/* Timeline / Progress */}
        {request && request.status !== "rejected" && request.status !== "expired" && (
          <Card className="bg-muted/30 border-0 p-4">
            <h3 className="font-semibold text-foreground mb-4">Progression</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  request.status !== "waiting_parent_link" ? "bg-green-500 text-white" : "bg-primary/20 text-primary"
                }`}>
                  {request.status !== "waiting_parent_link" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-bold">1</span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">Code genere</p>
                  <p className="text-xs text-muted-foreground">Transmets-le a ton parent</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  request.status === "parent_linked" || request.status === "validated" ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {request.status === "parent_linked" || request.status === "validated" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-bold">2</span>
                  )}
                </div>
                <div>
                  <p className={`font-medium text-sm ${request.status === "waiting_parent_link" ? "text-muted-foreground" : ""}`}>
                    Parent connecte
                  </p>
                  <p className="text-xs text-muted-foreground">Ton parent a saisi ton code</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  request.status === "validated" ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {request.status === "validated" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-bold">3</span>
                  )}
                </div>
                <div>
                  <p className={`font-medium text-sm ${request.status !== "validated" ? "text-muted-foreground" : ""}`}>
                    Inscription validee
                  </p>
                  <p className="text-xs text-muted-foreground">Tu peux finaliser ta reservation</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Refresh button */}
        <Button
          variant="outline"
          onClick={fetchRequestStatus}
          className="w-full h-12 gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser le statut
        </Button>

        {/* Return home */}
        <Button
          variant="ghost"
          onClick={() => navigate("/home")}
          className="w-full h-12 gap-2 text-muted-foreground"
        >
          <Home className="w-4 h-4" />
          Retour a l'accueil
        </Button>

        {/* Footer */}
        <p className="text-xs text-center text-muted-foreground pt-2">
          La page se rafraichit automatiquement toutes les 10 secondes.
        </p>
      </div>
    </PageLayout>
  );
};

export default EnAttenteValidation;
