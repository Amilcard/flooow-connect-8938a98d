import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PageLayout from "@/components/PageLayout";
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
      {/* Header avec bandeau orange */}
      <div className="bg-gradient-to-r from-primary to-accent text-white p-4">
        <div className="container flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => window.history.back()}
            className="text-white hover:bg-white/20"
          >
            ← Retour
          </Button>
          <div>
            <h1 className="text-xl font-bold">Mes événements favoris</h1>
            <p className="text-white/90 text-sm">
              {events?.length || 0} événement{(events?.length || 0) > 1 ? 's' : ''} favori{(events?.length || 0) > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
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
                <Button onClick={() => window.location.href = '/agenda-community'}>
                  Découvrir les événements
                </Button>
              </div>
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
