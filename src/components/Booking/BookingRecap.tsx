/**
 * BookingRecap - Bloc récapitulatif enrichi pour l'inscription
 * 
 * Affiche: activité, organisateur, lieu, date exacte, horaire, âge, prix
 */
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Clock, Users, Building2, Euro } from "lucide-react";

interface BookingRecapProps {
  activity: {
    title: string;
    category?: string;
    price_base?: number;
    age_min?: number | null;
    age_max?: number | null;
    organism_name?: string;
    organism_type?: string;
    location_name?: string;
    location_address?: string;
    location_city?: string;
    location_postal_code?: string;
  };
  slot?: {
    start: string;
    end: string;
  } | null;
  session?: {
    day_of_week?: number | null;
    start_time?: string | null;
    end_time?: string | null;
    age_min?: number | null;
    age_max?: number | null;
  } | null;
  occurrenceDate?: string | null;
  totalAids?: number;
  remainingPrice?: number;
}

const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

export const BookingRecap = ({
  activity,
  slot,
  session,
  occurrenceDate,
  totalAids,
  remainingPrice,
}: BookingRecapProps) => {
  // Formatage de la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dayName = dayNames[date.getDay()];
    return `${dayName} ${date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculer les infos horaire
  let dateLabel = "";
  let timeLabel = "";

  if (slot) {
    dateLabel = formatDate(slot.start);
    timeLabel = `${formatTime(slot.start)} – ${formatTime(slot.end)}`;
  } else if (session) {
    if (occurrenceDate) {
      dateLabel = formatDate(occurrenceDate);
    } else if (session.day_of_week !== null && session.day_of_week !== undefined) {
      dateLabel = `Tous les ${dayNames[session.day_of_week].toLowerCase()}s`;
    }
    if (session.start_time && session.end_time) {
      timeLabel = `${session.start_time.slice(0, 5)} – ${session.end_time.slice(0, 5)}`;
    }
  }

  // Tranche d'âge (priorité session puis activité)
  const ageMin = session?.age_min ?? activity.age_min ?? 0;
  const ageMax = session?.age_max ?? activity.age_max;
  const ageLabel = ageMax ? `${ageMin}–${ageMax} ans` : `À partir de ${ageMin} ans`;

  // Prix
  const basePrice = activity.price_base ?? 0;
  const finalPrice = remainingPrice ?? basePrice;
  const hasAids = totalAids !== undefined && totalAids > 0;

  // Lieu
  const locationParts = [
    activity.location_name,
    activity.location_address,
    activity.location_postal_code && activity.location_city 
      ? `${activity.location_postal_code} ${activity.location_city}` 
      : activity.location_city,
  ].filter(Boolean);

  return (
    <Card className="p-5">
      <h2 className="font-semibold text-lg mb-4">Récapitulatif</h2>
      
      <div className="space-y-4">
        {/* Titre activité */}
        <div>
          <p className="font-semibold text-base">{activity.title}</p>
          {activity.category && (
            <Badge variant="secondary" className="mt-1">{activity.category}</Badge>
          )}
        </div>

        {/* Organisateur */}
        {activity.organism_name && (
          <div className="flex items-start gap-3 text-sm">
            <Building2 size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">{activity.organism_name}</p>
              {activity.organism_type && (
                <p className="text-muted-foreground text-xs">{activity.organism_type}</p>
              )}
            </div>
          </div>
        )}

        {/* Lieu */}
        {locationParts.length > 0 && (
          <div className="flex items-start gap-3 text-sm">
            <MapPin size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              {locationParts.map((part, i) => (
                <p key={i} className={i === 0 ? "font-medium" : "text-muted-foreground"}>
                  {part}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Date & Horaire */}
        {(dateLabel || timeLabel) && (
          <div className="flex items-start gap-3 text-sm">
            <Calendar size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              {dateLabel && <p className="font-medium">{dateLabel}</p>}
              {timeLabel && (
                <p className="text-muted-foreground flex items-center gap-1">
                  <Clock size={12} />
                  {timeLabel}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tranche d'âge */}
        <div className="flex items-center gap-3 text-sm">
          <Users size={16} className="text-muted-foreground flex-shrink-0" />
          <span>{ageLabel}</span>
        </div>

        {/* Prix */}
        <div className="pt-3 border-t space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Euro size={16} />
              Prix de l'activité
            </span>
            <span className={hasAids ? "line-through text-muted-foreground" : "font-semibold"}>
              {basePrice === 0 ? "Gratuit" : `${basePrice.toFixed(2)} €`}
            </span>
          </div>
          
          {hasAids && (
            <>
              <div className="flex items-center justify-between text-sm text-green-600">
                <span>Aides appliquées</span>
                <span>-{totalAids!.toFixed(2)} €</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="font-medium">Reste à charge</span>
                <span className="text-2xl font-bold text-primary">
                  {finalPrice === 0 ? "Gratuit" : `${finalPrice.toFixed(2)} €`}
                </span>
              </div>
            </>
          )}
          
          {!hasAids && basePrice > 0 && (
            <p className="text-2xl font-bold text-primary">
              {basePrice.toFixed(2)} €
            </p>
          )}
          
          {!hasAids && basePrice === 0 && (
            <p className="text-2xl font-bold text-primary">Gratuit</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default BookingRecap;
