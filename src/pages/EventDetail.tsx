import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PageLayout from "@/components/PageLayout";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, User, ExternalLink, Clock, Euro, Users, ArrowLeft, Share2, Heart } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { useAuth } from "@/hooks/useAuth";
import { useFavoriteEvents } from "@/hooks/useFavoriteEvents";
import { toast } from "sonner";

const EVENT_TYPE_LABELS: Record<string, string> = {
  enfants_ados: "Enfants & Ados",
  reunion_parents: "Réunion Parents",
  info_collectivite: "Info Collectivité",
  atelier: "Atelier",
  spectacle: "Spectacle",
  sport: "Sport",
  noel: "Noël",
  match_asse: "Match ASSE",
  vacances: "Vacances",
  autre: "Autre"
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  enfants_ados: "bg-primary/10 text-primary",
  spectacle: "bg-purple-100 text-purple-700",
  sport: "bg-green-100 text-green-700",
  noel: "bg-red-100 text-red-700",
  match_asse: "bg-green-600 text-white",
  vacances: "bg-blue-100 text-blue-700",
  reunion_parents: "bg-secondary/10 text-secondary",
  info_collectivite: "bg-accent/10 text-accent-foreground",
  atelier: "bg-muted text-muted-foreground",
  autre: "bg-background text-foreground"
};

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toggleFavorite, isFavorite } = useFavoriteEvents(user?.id);

  const { data: event, isLoading, error } = useQuery({
    queryKey: ["event-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("territory_events")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: event?.description || "",
          url: window.location.href,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Lien copié !");
  };

  const handleAddToAgenda = () => {
    if (!user) {
      toast.error("Connecte-toi pour ajouter cet événement à ton agenda");
      return;
    }
    if (event) {
      toggleFavorite.mutate(event.id);
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container px-4 py-6">
          <LoadingState text="Chargement de l'événement..." />
        </div>
      </PageLayout>
    );
  }

  if (error || !event) {
    return (
      <PageLayout>
        <div className="container px-4 py-6">
          <ErrorState 
            message="Événement introuvable" 
            onRetry={() => navigate("/agenda-community")} 
          />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container px-4 py-6 space-y-6 max-w-4xl mx-auto">
        {/* Header avec bouton retour */}
        <div className="mb-4">
          <BackButton
            positioning="relative"
            size="sm"
            showText={true}
            label="Retour"
          />
        </div>

        {/* Image principale */}
        {event.image_url && (
          <div className="relative h-64 md:h-96 w-full overflow-hidden rounded-lg">
            <img 
              src={event.image_url} 
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <Badge 
              className={`absolute top-4 right-4 ${EVENT_TYPE_COLORS[event.event_type] || EVENT_TYPE_COLORS.autre}`}
            >
              {EVENT_TYPE_LABELS[event.event_type] || "Autre"}
            </Badge>
          </div>
        )}

        {/* Contenu principal */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <CardTitle className="text-2xl md:text-3xl">{event.title}</CardTitle>
                {event.description && (
                  <CardDescription className="text-base">
                    {event.description}
                  </CardDescription>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Partager</span>
                </Button>
                {user && (
                  <Button
                    variant={isFavorite(event.id) ? "default" : "outline"}
                    size="icon"
                    onClick={handleAddToAgenda}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite(event.id) ? "fill-current" : ""}`} />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Infos pratiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Date</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.start_date), "EEEE d MMMM yyyy", { locale: fr })}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(event.start_date), "HH:mm")} - {format(new Date(event.end_date), "HH:mm")}
                  </p>
                </div>
              </div>

              {event.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Lieu</p>
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                  </div>
                </div>
              )}

              {(event.age_min || event.age_max) && (
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Âge conseillé</p>
                    <p className="text-sm text-muted-foreground">
                      {event.age_min && event.age_max 
                        ? `${event.age_min} - ${event.age_max} ans`
                        : event.age_min 
                        ? `À partir de ${event.age_min} ans`
                        : `Jusqu'à ${event.age_max} ans`}
                    </p>
                  </div>
                </div>
              )}

              {event.price_indicative !== null && event.price_indicative !== undefined && (
                <div className="flex items-start gap-3">
                  <Euro className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Prix</p>
                    <p className="text-sm text-muted-foreground">
                      {event.price_indicative === 0 ? "Gratuit" : `${event.price_indicative}€`}
                    </p>
                  </div>
                </div>
              )}

              {event.organizer_name && (
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Organisateur</p>
                    <p className="text-sm text-muted-foreground">{event.organizer_name}</p>
                    {event.organizer_contact && (
                      <p className="text-sm text-muted-foreground">{event.organizer_contact}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              {event.booking_url && (
                <Button
                  className="flex-1"
                  onClick={() => window.open(event.booking_url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Réserver
                </Button>
              )}
              {event.external_link && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open(event.external_link, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Plus d'infos
                </Button>
              )}
              {!user && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/login")}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Ajouter à mon agenda
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default EventDetail;
