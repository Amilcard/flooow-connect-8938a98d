import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, isWithinInterval, addDays, startOfDay, endOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { useFavoriteEvents } from "@/hooks/useFavoriteEvents";
import { useAuth } from "@/hooks/useAuth";
import { EventShareButton } from "@/components/EventShareButton";
import { EventRegistrationButton } from "@/components/EventRegistrationButton";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const EVENT_TYPE_COLORS: Record<string, string> = {
  children_activity: "bg-accent/10 text-accent-foreground",
  teen_activity: "bg-primary/10 text-primary",
  parent_meeting: "bg-secondary/10 text-secondary-foreground",
  territory_news: "bg-muted text-muted-foreground",
  spectacle: "bg-purple-100 text-purple-700",
  sport: "bg-green-100 text-green-700",
  noel: "bg-red-100 text-red-700",
  match_asse: "bg-green-600 text-white",
  vacances: "bg-blue-100 text-blue-700",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  enfants_ados: "Enfants & Ados",
  spectacle: "Spectacle",
  sport: "Sport",
  noel: "Noël",
  match_asse: "ASSE",
  vacances: "Vacances",
};

type FilterType = "all" | "weekend" | "holidays" | "asse";

export const EventsSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toggleFavorite, isFavorite } = useFavoriteEvents(user?.id);
  const [filter, setFilter] = useState<FilterType>("all");

  const { data: allEvents, isLoading } = useQuery({
    queryKey: ["upcoming-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("territory_events")
        .select("*")
        .eq("published", true)
        .gte("start_date", new Date().toISOString())
        .order("start_date", { ascending: true })
        .limit(20);

      if (error) throw error;
      return data;
    },
  });

  // Filtrer les événements selon le filtre actif
  const events = allEvents?.filter(event => {
    const eventDate = new Date(event.start_date);
    
    if (filter === "weekend") {
      // Ce week-end (vendredi soir à dimanche soir)
      const now = new Date();
      const nextFriday = addDays(now, (5 - now.getDay() + 7) % 7);
      const nextSunday = addDays(nextFriday, 2);
      return isWithinInterval(eventDate, {
        start: startOfDay(nextFriday),
        end: endOfDay(nextSunday)
      });
    }
    
    if (filter === "holidays") {
      // Vacances & fêtes (Noël, vacances scolaires)
      const eventType = event.event_type?.toLowerCase() || "";
      return eventType.includes("noel") || 
             eventType.includes("vacances") || 
             eventType.includes("spectacle");
    }
    
    if (filter === "asse") {
      const eventType = event.event_type?.toLowerCase() || "";
      const title = event.title?.toLowerCase() || "";
      return eventType.includes("asse") || 
             eventType.includes("match") ||
             title.includes("asse") ||
             title.includes("saint-étienne") ||
             title.includes("geoffroy");
    }
    
    return true; // "all"
  }).slice(0, filter === "all" ? 10 : 20);

  if (isLoading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Événements à venir
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Ma ville, mon actu
          </h2>
          <p className="text-sm text-text-muted mt-1">
            Matchs, sorties culturelles, événements pour les familles près de chez vous.
          </p>
        </div>
        <Button
          variant="link"
          onClick={() => navigate("/ma-ville-mon-actu")}
          className="text-accent-foreground self-start sm:self-auto"
        >
          Voir tout l'agenda →
        </Button>
      </div>

      {/* Filtres rapides */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)} className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="weekend">Ce week-end</TabsTrigger>
          <TabsTrigger value="holidays">Vacances & fêtes</TabsTrigger>
          <TabsTrigger value="asse">Matches ASSE</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events?.map((event) => (
          <Card
            key={event.id}
            className="card-wetransfer cursor-pointer group relative overflow-hidden hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/event/${event.id}`)}
          >
            {user && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite.mutate(event.id);
                }}
              >
                <Heart
                  className={`h-5 w-5 ${
                    isFavorite(event.id)
                      ? "fill-primary text-primary"
                      : "text-muted-foreground"
                  }`}
                />
              </Button>
            )}
            {event.image_url && (
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                  <p className="text-sm font-medium">
                    {format(new Date(event.start_date), "d MMM", { locale: fr })}
                  </p>
                  {event.event_type && EVENT_TYPE_LABELS[event.event_type] && (
                    <Badge className={EVENT_TYPE_COLORS[event.event_type] || "bg-muted"}>
                      {EVENT_TYPE_LABELS[event.event_type]}
                    </Badge>
                  )}
                </div>
              </div>
            )}
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                  {event.title}
                </CardTitle>
              </div>
              {event.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="line-clamp-1">{event.location.split(',')[0]}</span>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4 text-sm">
                {(event.age_min || event.age_max) && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>
                      {event.age_min && event.age_max 
                        ? `${event.age_min}-${event.age_max} ans`
                        : event.age_min 
                        ? `${event.age_min}+ ans`
                        : `${event.age_max} ans`}
                    </span>
                  </div>
                )}
                {event.price_indicative !== null && event.price_indicative !== undefined && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Euro className="h-3 w-3" />
                    <span className="font-medium">
                      {event.price_indicative === 0 ? "Gratuit" : `${event.price_indicative}€`}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 justify-between pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/event/${event.id}`);
                  }}
                >
                  Voir le détail
                </Button>
                <EventShareButton event={{
                  id: event.id,
                  title: event.title,
                  description: event.description,
                  startDate: event.start_date,
                  location: event.location,
                }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
