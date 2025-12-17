/**
 * SessionAccordion - Accordéon de créneaux pour activités scolaires
 * 
 * Structure:
 * ┌────────────────────────────────────────────────────────────────┐
 * │ 📅 Mercredi • 18h30 – 20h00              │ 12–14 ans │ ⌄     │
 * ├────────────────────────────────────────────────────────────────┤
 * │ [17 déc] [24 déc] [31 déc] ← pilules cliquables               │
 * │                                                                │
 * │  • Dans 4 jours · Cette semaine                               │
 * └────────────────────────────────────────────────────────────────┘
 * 
 * Séance choisie : Mercredi 17 décembre 2025 • 18h30 – 20h00
 */
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Clock, 
  Users, 
  MapPin,
  CheckCircle2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatAgeRangeForDetail } from "@/utils/categoryMapping";

interface SessionData {
  id: string;
  day_of_week: number | null;
  start_time: string | null;
  end_time: string | null;
  age_min: number | null;
  age_max: number | null;
  location?: string | null;
  price?: number | null;
}

interface SessionAccordionProps {
  session: SessionData;
  isExpanded: boolean;
  onToggle: () => void;
  selectedDate: string | null;
  onSelectDate: (sessionId: string, date: string) => void;
  activityLocation?: string;
  showMoreDates?: boolean;
}

const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const dayNamesShort = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

/**
 * Génère les N prochaines dates pour un jour de la semaine donné
 */
const getNextDates = (dayOfWeek: number, count = 3): { date: Date; iso: string; label: string }[] => {
  const dates: { date: Date; iso: string; label: string }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let current = new Date(today);
  
  // Trouver le prochain jour correspondant
  const daysUntilNext = (dayOfWeek - current.getDay() + 7) % 7;
  current.setDate(current.getDate() + (daysUntilNext === 0 ? 0 : daysUntilNext));
  
  // Si c'est aujourd'hui mais déjà passé, aller à la semaine suivante
  if (current < today) {
    current.setDate(current.getDate() + 7);
  }
  
  for (let i = 0; i < count; i++) {
    const dateObj = new Date(current);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleDateString('fr-FR', { month: 'long' });
    const year = dateObj.getFullYear();
    
    dates.push({
      date: dateObj,
      iso: dateObj.toISOString().split('T')[0],
      label: `${day} ${month} ${year}`,
    });
    
    current.setDate(current.getDate() + 7);
  }
  
  return dates;
};

/**
 * Calcule la projection temporelle (Dans X jours · Semaine prochaine)
 */
const getTimeProjection = (date: Date): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  
  const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Demain";
  if (diffDays < 7) return `Dans ${diffDays} jours · Cette semaine`;
  if (diffDays < 14) return `Dans ${diffDays} jours · Semaine prochaine`;
  
  const weeks = Math.ceil(diffDays / 7);
  return `Dans ${diffDays} jours · Dans ${weeks} semaines`;
};

/**
 * Formate une date complète
 */
const formatFullDate = (date: Date): string => {
  const dayName = dayNames[date.getDay()];
  const day = date.getDate();
  const month = date.toLocaleDateString('fr-FR', { month: 'long' });
  const year = date.getFullYear();
  return `${dayName} ${day} ${month} ${year}`;
};

export const SessionAccordion = ({
  session,
  isExpanded,
  onToggle,
  selectedDate,
  onSelectDate,
  activityLocation,
  showMoreDates = false,
}: SessionAccordionProps) => {
  const [showAll, setShowAll] = useState(showMoreDates);
  
  const dayLabel = session.day_of_week !== null 
    ? dayNames[session.day_of_week] 
    : "Session";
  
  const timeLabel = session.start_time && session.end_time
    ? `${session.start_time.slice(0, 5)} – ${session.end_time.slice(0, 5)}`
    : "";
  
  const ageLabel = session.age_min !== null && session.age_max !== null
    ? formatAgeRangeForDetail(session.age_min, session.age_max)
    : null;
  
  const location = session.location || activityLocation;
  
  // Générer les dates
  const dates = session.day_of_week !== null 
    ? getNextDates(session.day_of_week, showAll ? 8 : 3)
    : [];
  
  // Vérifier si une date de cette session est sélectionnée
  const isThisSessionSelected = dates.some(d => d.iso === selectedDate);
  const selectedDateObj = dates.find(d => d.iso === selectedDate);

  return (
    <Card className={cn(
      "overflow-hidden transition-all border-2",
      isThisSessionSelected 
        ? "border-primary bg-primary/5 shadow-md" 
        : "border-transparent hover:border-primary/20"
    )}>
      {/* Header - toujours visible */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Icône jour */}
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
            isThisSessionSelected ? "bg-primary text-primary-foreground" : "bg-muted"
          )}>
            <Calendar size={20} />
          </div>
          
          {/* Infos principales */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn(
                "font-semibold",
                isThisSessionSelected && "text-primary"
              )}>
                {dayLabel}
              </span>
              {timeLabel && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock size={12} />
                    {timeLabel}
                  </span>
                </>
              )}
            </div>
            
            {/* Lieu sous le titre */}
            {location && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                <MapPin size={10} />
                {location}
              </p>
            )}
          </div>
        </div>
        
        {/* Badge âge + chevron */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {ageLabel && (
            <Badge variant="outline" className="text-xs">
              <Users size={12} className="mr-1" />
              {ageLabel}
            </Badge>
          )}
          {isExpanded ? (
            <ChevronUp size={20} className="text-muted-foreground" />
          ) : (
            <ChevronDown size={20} className="text-muted-foreground" />
          )}
        </div>
      </button>
      
      {/* Contenu accordéon */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t bg-muted/30">
          {/* Pilules de dates */}
          <div className="pt-3">
            <p className="text-xs text-muted-foreground mb-2">Prochaines séances :</p>
            <div className="flex flex-col gap-2">
              {dates.map((dateObj) => {
                const isSelected = selectedDate === dateObj.iso;
                
                return (
                  <button
                    key={dateObj.iso}
                    onClick={() => onSelectDate(session.id, dateObj.iso)}
                    className={cn(
                      "px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left",
                      "border-2 flex items-center gap-2",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-background border-muted-foreground/20 hover:border-primary/50 hover:bg-accent"
                    )}
                  >
                    {isSelected && <CheckCircle2 size={16} className="flex-shrink-0" />}
                    <Calendar size={14} className={cn("flex-shrink-0", !isSelected && "text-muted-foreground")} />
                    <span>{dateObj.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Bouton voir plus / réduire */}
          {session.day_of_week !== null && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowAll(!showAll);
              }}
              className="w-full text-xs text-muted-foreground hover:text-primary"
            >
              {showAll ? (
                <>
                  <ChevronUp size={14} className="mr-1" />
                  Réduire
                </>
              ) : (
                <>
                  <ChevronDown size={14} className="mr-1" />
                  Voir plus de dates
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};

/**
 * Bloc récapitulatif "Séance choisie"
 */
interface SelectedSessionSummaryProps {
  session: SessionData | null;
  selectedDate: string | null;
  className?: string;
}

export const SelectedSessionSummary = ({
  session,
  selectedDate,
  className,
}: SelectedSessionSummaryProps) => {
  if (!session || !selectedDate) return null;
  
  const dateObj = new Date(selectedDate);
  const fullDate = formatFullDate(dateObj);
  
  const timeLabel = session.start_time && session.end_time
    ? `${session.start_time.slice(0, 5)} – ${session.end_time.slice(0, 5)}`
    : "";
  
  const ageLabel = session.age_min !== null && session.age_max !== null
    ? formatAgeRangeForDetail(session.age_min, session.age_max)
    : null;

  return (
    <div className={cn(
      "p-3 rounded-lg bg-primary/10 border border-primary/20",
      className
    )}>
      <div className="flex items-start gap-3">
        <CheckCircle2 size={20} className="text-primary flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Séance choisie
          </p>
          <p className="font-semibold text-sm mt-0.5">{fullDate}</p>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            {timeLabel && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {timeLabel}
              </span>
            )}
            {ageLabel && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users size={12} />
                  {ageLabel}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionAccordion;
