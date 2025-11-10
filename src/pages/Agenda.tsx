import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, User, ExternalLink, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

const EVENT_TYPE_LABELS = {
  enfants_ados: "Enfants & Ados",
  reunion_parents: "Réunion Parents",
  info_collectivite: "Info Collectivité",
  atelier: "Atelier",
  autre: "Autre"
};

const EVENT_TYPE_COLORS = {
  enfants_ados: "bg-primary/10 text-primary hover:bg-primary/20",
  reunion_parents: "bg-secondary/10 text-secondary hover:bg-secondary/20",
  info_collectivite: "bg-accent/10 text-accent-foreground hover:bg-accent/20",
  atelier: "bg-muted text-muted-foreground hover:bg-muted/80",
  autre: "bg-background text-foreground hover:bg-muted"
};

const Agenda = () => {
  const [selectedType, setSelectedType] = useState<string>("all");

  const { data: events, isLoading, error } = useQuery({
    queryKey: ["territory-events", selectedType],
    queryFn: async () => {
      let query = supabase
        .from("territory_events")
        .select("*")
        .eq("published", true)
        .gte("end_date", new Date().toISOString())
        .order("start_date", { ascending: true });

      if (selectedType !== "all") {
        query = query.eq("event_type", selectedType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container px-4 py-6">
          <LoadingState text="Chargement de l'agenda..." />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="container px-4 py-6">
          <ErrorState 
            message="Erreur lors du chargement des événements" 
            onRetry={() => window.location.reload()} 
          />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container px-4 py-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Agenda du territoire
          </h1>
          <p className="text-muted-foreground text-lg">
            Découvrez les événements, ateliers et réunions près de chez vous
          </p>
        </div>

        {/* Filters */}
        <Tabs value={selectedType} onValueChange={setSelectedType} className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="enfants_ados">Enfants</TabsTrigger>
            <TabsTrigger value="reunion_parents">Parents</TabsTrigger>
            <TabsTrigger value="info_collectivite">Collectivité</TabsTrigger>
            <TabsTrigger value="atelier">Ateliers</TabsTrigger>
            <TabsTrigger value="autre">Autre</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedType} className="space-y-4 mt-6">
            {events && events.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Aucun événement à venir dans cette catégorie
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events?.map((event) => (
                  <Card key={event.id} className="hover:shadow-lg transition-shadow">
                    {event.image_url && (
                      <div className="h-48 overflow-hidden rounded-t-lg">
                        <img 
                          src={event.image_url} 
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge className={EVENT_TYPE_COLORS[event.event_type as keyof typeof EVENT_TYPE_COLORS]}>
                          {EVENT_TYPE_LABELS[event.event_type as keyof typeof EVENT_TYPE_LABELS]}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{event.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {event.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">
                            {format(new Date(event.start_date), "d MMMM yyyy", { locale: fr })}
                          </p>
                          <p className="text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(event.start_date), "HH:mm")} - {format(new Date(event.end_date), "HH:mm")}
                          </p>
                        </div>
                      </div>

                      {event.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                      )}

                      {event.organizer_name && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>{event.organizer_name}</span>
                        </div>
                      )}

                      {event.external_link && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => window.open(event.external_link, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Plus d'infos
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default Agenda;
