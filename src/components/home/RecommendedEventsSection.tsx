import { useAuth } from "@/hooks/useAuth";
import { useRecommendedEvents } from "@/hooks/useRecommendedEvents";
import { Card } from "@/components/ui/card";
import { Calendar, MapPin, Sparkles, Heart } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useFavoriteEvents } from "@/hooks/useFavoriteEvents";
import { Button } from "@/components/ui/button";
import { EventShareButton } from "@/components/EventShareButton";
import { EventRegistrationButton } from "@/components/EventRegistrationButton";
import { useNavigate } from "react-router-dom";

const RecommendedEventsSection = () => {
  const { user } = useAuth();
  const { data: events, isLoading } = useRecommendedEvents(user?.id, 6);
  const { toggleFavorite, isFavorite } = useFavoriteEvents(user?.id);
  const navigate = useNavigate();

  if (!user || isLoading) {
    return (
      <section className="py-8">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Recommandé pour vous</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-2/3" />
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
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Recommandé pour vous</h2>
        </div>
        <Button
          variant="link"
          onClick={() => navigate("/agenda-community")}
          className="text-primary"
        >
          Voir tous les événements
        </Button>
      </div>

      <div className="grid-staggered">
        {events.map((event) => (
          <Card
            key={event.id}
            className="card-wetransfer p-5 cursor-pointer group"
          >
            <div className="flex justify-between items-start gap-2 mb-3">
              <Badge variant="secondary" className="text-xs font-medium px-3 py-1 rounded-full">
                {event.recommendation_reason}
              </Badge>
              <div className="flex gap-1 shrink-0">
                <EventShareButton
                  event={{
                    id: event.id,
                    title: event.title,
                    description: event.description,
                    startDate: event.start_date,
                    location: event.location,
                  }}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite.mutate(event.id);
                  }}
                  className="h-8 w-8"
                >
                  <Heart
                    className={`h-4 w-4 ${
                      isFavorite(event.id)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </Button>
              </div>
            </div>

            <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
              {event.title}
            </h3>

            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(event.start_date), "d MMMM yyyy 'à' HH:mm", {
                  locale: fr,
                })}
              </span>
            </div>

            {event.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <MapPin className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
            )}

            {event.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {event.description}
              </p>
            )}

            <div className="pt-2 border-t">
              <EventRegistrationButton
                eventId={event.id}
                userId={user?.id}
                variant="default"
                size="sm"
                showCount={true}
                className="w-full"
              />
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default RecommendedEventsSection;
