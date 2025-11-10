import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { useFavoriteEvents } from "@/hooks/useFavoriteEvents";
import { useAuth } from "@/hooks/useAuth";
import { EventShareButton } from "@/components/EventShareButton";

const EVENT_TYPE_COLORS: Record<string, string> = {
  children_activity: "bg-accent/10 text-accent-foreground",
  teen_activity: "bg-primary/10 text-primary",
  parent_meeting: "bg-secondary/10 text-secondary-foreground",
  territory_news: "bg-muted text-muted-foreground",
};

export const EventsSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toggleFavorite, isFavorite } = useFavoriteEvents(user?.id);

  const { data: events, isLoading } = useQuery({
    queryKey: ["upcoming-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("territory_events")
        .select("*")
        .eq("published", true)
        .gte("start_date", new Date().toISOString())
        .order("start_date", { ascending: true })
        .limit(3);

      if (error) throw error;
      return data;
    },
  });

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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          Événements à venir
        </h2>
        <Button
          variant="link"
          onClick={() => navigate("/agenda-community")}
          className="text-accent-foreground"
        >
          Voir tous les événements →
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {events.map((event) => (
          <Card
            key={event.id}
            className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden group relative"
            onClick={() => navigate("/agenda-community")}
          >
            {user && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 left-2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background"
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
                <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-medium ${EVENT_TYPE_COLORS[event.event_type] || EVENT_TYPE_COLORS.territory_news}`}>
                  {event.event_type === "children_activity" && "Enfants"}
                  {event.event_type === "teen_activity" && "Ados"}
                  {event.event_type === "parent_meeting" && "Parents"}
                  {event.event_type === "territory_news" && "Actualité"}
                </div>
              </div>
            )}
            
            <CardHeader className="pb-3">
              <CardTitle className="text-lg line-clamp-2 group-hover:text-accent-foreground transition-colors">
                {event.title}
              </CardTitle>
              {event.description && (
                <CardDescription className="line-clamp-2">
                  {event.description}
                </CardDescription>
              )}
            </CardHeader>

            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">
                  {format(new Date(event.start_date), "d MMMM yyyy à HH:mm", { locale: fr })}
                </span>
              </div>

              {event.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{event.location}</span>
                </div>
              )}

              {event.organizer_name && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{event.organizer_name}</span>
                </div>
              )}

              <div className="pt-2" onClick={(e) => e.stopPropagation()}>
                <EventShareButton
                  event={{
                    id: event.id,
                    title: event.title,
                    description: event.description,
                    startDate: event.start_date,
                    location: event.location,
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
