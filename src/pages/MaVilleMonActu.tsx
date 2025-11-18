import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PageLayout from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, ExternalLink, Phone, Mail, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { useUserTerritory } from "@/hooks/useUserTerritory";

const MaVilleMonActu = () => {
  const { data: territory } = useUserTerritory();

  // Récupérer les événements du territoire (ou tous les événements si pas de territoire)
  const { data: events, isLoading } = useQuery({
    queryKey: ["territory-events", territory?.id],
    queryFn: async () => {
      let query = supabase
        .from("territory_events")
        .select("*")
        .eq("published", true)
        .gte("start_date", new Date().toISOString())
        .order("start_date", { ascending: true })
        .limit(50);

      // Filtrer par territoire uniquement si l'utilisateur en a un
      if (territory?.id) {
        query = query.eq("territory_id", territory.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
  });

  // Mapping des labels de sections
  const sectionLabels: Record<string, string> = {
    "cultural_event": "Culture & sorties",
    "community_info": "Vie de la ville",
    "workshop": "Ateliers & activités en famille"
  };

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
      <PageLayout showHeader={false}>
        <PageHeader
          title="Ma ville, mon actu"
          subtitle="Chargement..."
          backFallback="/home"
        />
        <div className="container mx-auto px-4 py-6 pb-24 max-w-[1200px]">
          <div className="mb-8">
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout showHeader={false}>
      <PageHeader
        title="Ma ville, mon actu"
        subtitle={territory?.name
          ? `Découvrez l'actualité et les événements de ${territory.name}`
          : "Découvrez l'actualité et les événements près de chez vous"}
        backFallback="/home"
      />

      <div className="container mx-auto px-4 py-6 pb-24 max-w-[1200px]">
        {/* Bandeau d'intro beige */}
        <Card className="mb-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Retrouvez ici les sorties, événements et informations utiles près de chez vous.
            </p>
          </CardContent>
        </Card>

        {/* Événements par catégorie */}
        {groupedEvents && Object.keys(groupedEvents).length > 0 ? (
          <div className="space-y-10">
            {Object.entries(groupedEvents).map(([category, categoryEvents]) => (
              <section key={category} className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-semibold">{sectionLabels[category] || category}</h2>
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

                        {/* Sous-titre : date • lieu */}
                        <CardDescription className="text-sm">
                          {format(parseISO(event.start_date), "d MMMM yyyy", { locale: fr })}
                          {event.location && ` • ${event.location}`}
                        </CardDescription>
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
                          <p className="text-sm text-gray-600 line-clamp-3">
                            {event.description}
                          </p>
                        )}

                        {/* Contact et CTA */}
                        <div className="space-y-3 pt-2">
                          {event.organizer_contact && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-4 w-4" />
                              <span>{event.organizer_contact}</span>
                            </div>
                          )}

                          {/* Lien externe désactivé en phase test */}
                          {(event.booking_url || event.external_link) && (
                            <div className="space-y-2">
                              <Button
                                variant="default"
                                size="sm"
                                className="w-full"
                                disabled
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                En savoir plus (bientôt disponible)
                              </Button>
                              <p className="text-xs text-gray-400 truncate">
                                Référence : {(event.booking_url || event.external_link)?.replace(/^https?:\/\/(www\.)?/, '')}
                              </p>
                            </div>
                          )}
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
