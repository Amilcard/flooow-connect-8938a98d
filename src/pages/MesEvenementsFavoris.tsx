import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Calendar, MapPin, Heart, Download } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useFavoriteEvents } from "@/hooks/useFavoriteEvents";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { exportToICal, exportToGoogleCalendar } from "@/lib/calendar";
import { EventShareButton } from "@/components/EventShareButton";
import { EventRegistrationButton } from "@/components/EventRegistrationButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MesEvenementsFavoris = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { favorites, toggleFavorite, isFavorite } = useFavoriteEvents(user?.id);

  const { data: events, isLoading } = useQuery({
    queryKey: ["favorite-events-details", favorites],
    queryFn: async () => {
      if (favorites.length === 0) return [];

      const { data, error } = await supabase
        .from("territory_events")
        .select("*, territories(name)")
        .in("id", favorites)
        .order("start_date", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: favorites.length > 0,
  });

  return (
    <PageLayout showHeader={false}>
      {/* Nouveau bandeau blanc standard */}
      <PageHeader
        title="Mes événements favoris"
        subtitle={events && events.length > 0 ? `${events.length} événement${events.length > 1 ? 's' : ''}` : 'Aucun événement'}
        backFallback="/mon-compte"
        tourId="favorite-events-header"
      />

      <div className="max-w-[1200px] mx-auto px-4 py-6 pb-24" data-tour-id="account-favorites">
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </Card>
            ))}
          </div>
        ) : !events || events.length === 0 ? (
          <Card className="p-8">
            <div className="text-center space-y-4">
              <Heart className="h-16 w-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="font-semibold text-xl mb-2">Aucun événement favori</h3>
                <p className="text-muted-foreground mb-4">
                  Ajoutez des événements à vos favoris pour les retrouver facilement ici
                </p>
              </div>
              <Button onClick={() => navigate("/agenda-community")} variant="default">
                <Calendar className="w-4 h-4 mr-2" />
                Découvrir les événements
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {events.map((event) => (
              <Card key={event.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(event.start_date), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                      </span>
                    </div>

                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                    )}

                    {event.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {event.description}
                      </p>
                    )}

                    {event.territories && (
                      <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full mb-3">
                        {event.territories.name}
                      </span>
                    )}

                    <div className="pt-2">
                      <EventRegistrationButton
                        eventId={event.id}
                        userId={user?.id}
                        variant="default"
                        size="sm"
                        showCount={true}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <EventShareButton
                      event={{
                        id: event.id,
                        title: event.title,
                        description: event.description,
                        startDate: event.start_date,
                        location: event.location,
                      }}
                      variant="outline"
                      size="icon"
                    />

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => exportToICal(event)}>
                          <Calendar className="h-4 w-4 mr-2" />
                          Télécharger iCal
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportToGoogleCalendar(event)}>
                          <Calendar className="h-4 w-4 mr-2" />
                          Google Calendar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite.mutate(event.id)}
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          isFavorite(event.id)
                            ? "fill-primary text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default MesEvenementsFavoris;
