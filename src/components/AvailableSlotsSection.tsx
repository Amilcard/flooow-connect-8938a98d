import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Slot {
  id: string;
  start: string;
  end: string;
  seats_remaining: number;
  seats_total: number;
}

interface AvailableSlotsSectionProps {
  slots: Slot[];
  activityId: string;
  activityTitle: string;
}

export const AvailableSlotsSection = ({ 
  slots, 
  activityId, 
  activityTitle 
}: AvailableSlotsSectionProps) => {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  
  const displaySlots = showAll ? slots : slots.slice(0, 6);
  const hasMore = slots.length > 6;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", { 
      weekday: "short", 
      day: "numeric", 
      month: "short",
      year: "numeric"
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  const getPeriodBadge = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth();
    const year = date.getFullYear();
    
    // Périodes vacances scolaires
    if (year === 2025 && month === 10) return { label: "Toussaint", emoji: "🍂" };
    if (year === 2025 && month === 11) return { label: "Noël", emoji: "🎄" };
    if (year === 2026 && month === 1) return { label: "Hiver", emoji: "⛷️" };
    if (year === 2026 && month === 3) return { label: "Printemps", emoji: "🌸" };
    if (year === 2026 && (month === 6 || month === 7)) return { label: "Été", emoji: "☀️" };
    
    return { label: "Année scolaire", emoji: "📚" };
  };

  const getAvailabilityStatus = (remaining: number, total: number) => {
    const percentage = (remaining / total) * 100;
    if (percentage > 50) return { color: "bg-green-100 text-green-700", label: "Disponible" };
    if (percentage > 20) return { color: "bg-orange-100 text-orange-700", label: "Peu de places" };
    if (percentage > 0) return { color: "bg-red-100 text-red-700", label: "Dernières places" };
    return { color: "bg-gray-100 text-gray-700", label: "Complet" };
  };

  if (slots.length === 0) {
    return (
      <section className="border-b pb-10">
        <h2 className="text-2xl font-semibold mb-4">Créneaux disponibles</h2>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              Aucun créneau disponible pour le moment
            </p>
            <Button
              variant="outline"
              onClick={() => navigate(`/activities?similar=${activityId}`)}
            >
              Voir les activités similaires
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="border-b pb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Créneaux disponibles</h2>
        <Badge variant="secondary" className="text-sm">
          {slots.length} créneau{slots.length > 1 ? "x" : ""}
        </Badge>
      </div>
      
      <p className="text-sm text-muted-foreground mb-6">
        Période de prestation: Du 1er Novembre 2025 au 30 Août 2026
      </p>

      <div className="space-y-3">
        {displaySlots.map((slot) => {
          const isFull = slot.seats_remaining === 0;
          const periodBadge = getPeriodBadge(slot.start);
          const availabilityStatus = getAvailabilityStatus(slot.seats_remaining, slot.seats_total);
          
          return (
            <Card 
              key={slot.id} 
              className={`transition-all hover:shadow-md ${isFull ? 'opacity-60' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Date & Time Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm">
                          {formatDate(slot.start)}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {periodBadge.emoji} {periodBadge.label}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(slot.start)} - {formatTime(slot.end)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{slot.seats_remaining}/{slot.seats_total} places</span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Action */}
                  <div className="flex items-center gap-3">
                    <Badge className={availabilityStatus.color}>
                      {availabilityStatus.label}
                    </Badge>
                    {!isFull && (
                      <Button
                        size="sm"
                        onClick={() => navigate(`/booking/${activityId}?slotId=${slot.id}`)}
                      >
                        Réserver
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Show More/Less Button */}
      {hasMore && (
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
            className="gap-2"
          >
            {showAll ? (
              <>
                Voir moins <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Voir tous les créneaux ({slots.length}) <ChevronDown className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      )}

      {/* Alternative activities if no slots available */}
      {slots.length > 0 && slots.every(s => s.seats_remaining === 0) && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground mb-3">
            Tous les créneaux sont complets pour cette activité
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/activities?similar=${activityId}`)}
          >
            Voir les activités similaires
          </Button>
        </div>
      )}
    </section>
  );
};
