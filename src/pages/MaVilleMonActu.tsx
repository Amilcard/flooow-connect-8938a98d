import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, ExternalLink, Phone, Mail, Clock } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { useUserTerritory } from "@/hooks/useUserTerritory";

const MaVilleMonActu = () => {
  const { data: territory } = useUserTerritory();

  // Récupérer les événements du territoire
  const { data: events, isLoading } = useQuery({
    queryKey: ["territory-events", territory?.id],
    queryFn: async () => {
      if (!territory?.id) return [];
      
      const { data, error } = await supabase
        .from("territory_events")
        .select("*")
        .eq("territory_id", territory.id)
        .eq("published", true)
        .gte("start_date", new Date().toISOString())
        .order("start_date", { ascending: true })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    enabled: !!territory?.id,
  });

  // Grouper les événements par catégorie
  const groupedEvents = events?.reduce((acc, event) => {
    const category = event.event_type || "Autres";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(event);
    return acc;
  }, {} as Record<string, typeof events>);

  const getCategoryColor = (category: string): string => {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes("sport") || lowerCategory.includes("match")) {
      return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
    }
    if (lowerCategory.includes("culture") || lowerCategory.includes("atelier")) {
      return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
    }
    if (lowerCategory.includes("famille")) {
      return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
    }
    return "bg-accent text-accent-foreground";
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-6 pb-24">
          <BackButton />
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-6 w-96" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-6 pb-24">
        <BackButton />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Ma ville, mon actu</h1>
          <p className="text-muted-foreground">
            {territory?.name ? `Découvrez l'actualité et les événements de ${territory.name}` : "Découvrez l'actualité et les événements de votre territoire"}
          </p>
        </div>

        {/* Événements par catégorie */}
        {groupedEvents && Object.keys(groupedEvents).length > 0 ? (
          <div className="space-y-10">
            {Object.entries(groupedEvents).map(([category, categoryEvents]) => (
              <section key={category} className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-semibold">{category}</h2>
                  <Badge variant="secondary" className={getCategoryColor(category)}>
                    {categoryEvents.length} événement{categoryEvents.length > 1 ? "s" : ""}
                  </Badge>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categoryEvents.map((event) => (
                    <Card key={event.id} className="flex flex-col hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                        </div>
                        
                        {/* Date et heure */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {format(parseISO(event.start_date), "EEEE d MMMM yyyy", { locale: fr })}
                          </span>
                        </div>
                        
                        {event.start_date && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>
                              {format(parseISO(event.start_date), "HH:mm", { locale: fr })}
                            </span>
                          </div>
                        )}
                      </CardHeader>
                      
                      <CardContent className="flex-1 space-y-3">
                        {/* Public */}
                        {event.age_min !== null && event.age_max !== null && (
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">
                              {event.age_min === event.age_max 
                                ? `${event.age_min} ans`
                                : `${event.age_min}-${event.age_max} ans`
                              }
                            </Badge>
                          </div>
                        )}
                        
                        {/* Description */}
                        {event.description && (
                          <CardDescription className="text-sm line-clamp-3">
                            {event.description}
                          </CardDescription>
                        )}
                        
                        {/* Lieu */}
                        {event.location && (
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                            <span className="text-muted-foreground">{event.location}</span>
                          </div>
                        )}
                        
                        {/* Contact */}
                        <div className="space-y-2 pt-2">
                          {event.organizer_contact && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-4 w-4" />
                              <span>{event.organizer_contact}</span>
                            </div>
                          )}
                          
                          {/* Boutons d'action */}
                          <div className="flex flex-wrap gap-2 pt-2">
                            {event.booking_url && (
                              <Button
                                variant="default"
                                size="sm"
                                className="flex-1"
                                onClick={() => window.open(event.booking_url!, "_blank", "noopener,noreferrer")}
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Billetterie
                              </Button>
                            )}
                            
                            {event.external_link && !event.booking_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => window.open(event.external_link!, "_blank", "noopener,noreferrer")}
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Plus d'infos
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <CardDescription>
              Aucun événement à venir pour le moment. Revenez bientôt !
            </CardDescription>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default MaVilleMonActu;
