/**
 * SessionSlotCard - Carte de créneau/séance enrichie
 * 
 * Format explicite pour les familles :
 * ┌──────────────────────────────────────────────┐
 * │ Mercredi 18 décembre 2026                    │  ← date COMPLÈTE
 * │ 18h30 – 20h00  •  11–17 ans                  │  ← horaire + âge
 * │ Dans 7 jours  •  Semaine prochaine           │  ← aide projection
 * └──────────────────────────────────────────────┘
 */
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Calendar, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface SessionSlotCardProps {
  // Identifiant
  id: string;
  
  // Date et heure
  date: Date;
  startTime?: string; // Format "HH:mm"
  endTime?: string;   // Format "HH:mm"
  
  // Tranche d'âge
  ageMin?: number;
  ageMax?: number;
  
  // État
  isSelected?: boolean;
  isDisabled?: boolean;
  placesRemaining?: number;
  
  // Callbacks
  onClick?: () => void;
}

/**
 * Calcule l'aide à la projection temporelle
 */
const getTimeProjection = (date: Date): { label: string; subLabel?: string } => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return { label: "Aujourd'hui" };
  } else if (diffDays === 1) {
    return { label: "Demain" };
  } else if (diffDays < 7) {
    return { label: `Dans ${diffDays} jours`, subLabel: "Cette semaine" };
  } else if (diffDays < 14) {
    return { label: `Dans ${diffDays} jours`, subLabel: "Semaine prochaine" };
  } else {
    const weeks = Math.ceil(diffDays / 7);
    return { label: `Dans ${diffDays} jours`, subLabel: `Dans ${weeks} semaines` };
  }
};

/**
 * Formate la date complète en français
 */
const formatFullDate = (date: Date): string => {
  const dayName = date.toLocaleDateString('fr-FR', { weekday: 'long' });
  const dayNameCapitalized = dayName.charAt(0).toUpperCase() + dayName.slice(1);
  const day = date.getDate();
  const month = date.toLocaleDateString('fr-FR', { month: 'long' });
  const year = date.getFullYear();
  
  // Gestion du "1er"
  const dayStr = day === 1 ? '1er' : String(day);
  
  return `${dayNameCapitalized} ${dayStr} ${month} ${year}`;
};

/**
 * Formate l'horaire
 */
const formatTimeRange = (startTime?: string, endTime?: string): string | null => {
  if (!startTime || !endTime) return null;

  // Convertir "HH:mm:ss" en "HHhMM"
  const formatTime = (time: string) => {
    const parts = time.slice(0, 5).split(':');
    return `${parts[0]}h${parts[1]}`;
  };

  return `${formatTime(startTime)} – ${formatTime(endTime)}`;
};

/**
 * Determine card styling based on state
 */
const getCardClassName = (isDisabled: boolean, isFull: boolean, isSelected: boolean): string => {
  if (isDisabled || isFull) {
    return "opacity-50 bg-muted/50 cursor-not-allowed border-transparent";
  }
  if (isSelected) {
    return "ring-2 ring-primary ring-offset-2 bg-primary/5 border-primary shadow-md";
  }
  return "hover:bg-accent/50 hover:border-primary/30 border-transparent";
};

/**
 * Get badge styling and text for places remaining
 */
interface BadgeConfig {
  variant: "secondary" | "default" | "outline";
  className: string;
  text: string;
}

const getPlacesBadgeConfig = (
  placesRemaining: number,
  isSelected: boolean
): BadgeConfig => {
  const isFull = placesRemaining <= 0;
  const isLowStock = placesRemaining > 0 && placesRemaining <= 3;

  if (isFull) {
    return {
      variant: "secondary",
      className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      text: "Complet",
    };
  }

  if (isLowStock) {
    return {
      variant: isSelected ? "default" : "outline",
      className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      text: `Plus que ${placesRemaining} place${placesRemaining > 1 ? 's' : ''} !`,
    };
  }

  return {
    variant: isSelected ? "default" : "outline",
    className: isSelected ? "" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    text: `${placesRemaining} places`,
  };
};

export const SessionSlotCard = ({
  id,
  date,
  startTime,
  endTime,
  ageMin,
  ageMax,
  isSelected = false,
  isDisabled = false,
  placesRemaining,
  onClick,
}: SessionSlotCardProps) => {
  const fullDate = formatFullDate(date);
  const timeRange = formatTimeRange(startTime, endTime);
  const projection = getTimeProjection(date);
  const ageRange = ageMin !== undefined && ageMax !== undefined 
    ? `${ageMin}–${ageMax} ans` 
    : null;
  
  const isFull = placesRemaining !== undefined && placesRemaining <= 0;

  const handleClick = () => {
    if (!isDisabled && !isFull) onClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !isDisabled && !isFull) {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <Card
      data-slot-id={id}
      className={cn(
        "p-4 transition-all border-2 cursor-pointer",
        getCardClassName(isDisabled, isFull, isSelected)
      )}
      onClick={handleClick}
      role="button"
      tabIndex={isDisabled || isFull ? -1 : 0}
      onKeyDown={handleKeyDown}
      aria-selected={isSelected}
      aria-disabled={isDisabled || isFull}
    >
      <div className="space-y-2">
        {/* Ligne 1 : Date complète + Check */}
        <div className="flex items-center justify-between gap-2">
          <span className={cn(
            "text-base font-semibold",
            isFull ? "text-muted-foreground" : isSelected ? "text-primary" : "text-foreground"
          )}>
            {fullDate}
          </span>
          {isSelected && !isFull && (
            <CheckCircle2 size={20} className="text-primary flex-shrink-0" />
          )}
        </div>

        {/* Ligne 2 : Horaire + Âge */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {timeRange && (
            <div className="flex items-center gap-1.5">
              <Clock size={14} className={isSelected ? "text-primary" : ""} />
              <span>{timeRange}</span>
            </div>
          )}
          {timeRange && ageRange && (
            <span className="text-muted-foreground/50">•</span>
          )}
          {ageRange && (
            <div className="flex items-center gap-1.5">
              <Users size={14} className={isSelected ? "text-primary" : ""} />
              <span>{ageRange}</span>
            </div>
          )}
        </div>

        {/* Ligne 3 : Aide à la projection + Places */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar size={12} />
            <span>{projection.label}</span>
            {projection.subLabel && (
              <>
                <span className="text-muted-foreground/50">•</span>
                <span className="font-medium text-foreground/70">{projection.subLabel}</span>
              </>
            )}
          </div>
          
          {/* Badge places */}
          {placesRemaining !== undefined && (() => {
            const badgeConfig = getPlacesBadgeConfig(placesRemaining, isSelected);
            return (
              <Badge
                variant={badgeConfig.variant}
                className={cn("text-xs", badgeConfig.className)}
              >
                {badgeConfig.text}
              </Badge>
            );
          })()}
        </div>
      </div>
    </Card>
  );
};

export default SessionSlotCard;
