/**
 * SlotAccordion - Accordéon de créneaux pour activités vacances/stages
 * 
 * Les slots vacances sont des dates uniques (pas récurrentes comme les sessions scolaires)
 * 
 * Structure:
 * ┌────────────────────────────────────────────────────────────────┐
 * │ 📅 Vacances de Printemps                  │ 8–12 ans │ ⌄     │
 * ├────────────────────────────────────────────────────────────────┤
 * │ [Lun 14 avr] [Mar 15 avr] [Mer 16 avr] ← pilules cliquables   │
 * │                                                                │
 * │  • 12 places disponibles                                      │
 * └────────────────────────────────────────────────────────────────┘
 */
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SlotData {
  id: string;
  start: string;
  end: string;
  seats_remaining: number | null;
  seats_total?: number | null;
}

interface SlotAccordionProps {
  slots: SlotData[];
  ageMin?: number | null;
  ageMax?: number | null;
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string) => void;
  periodLabel?: string;
  defaultExpanded?: boolean;
}

const dayNamesShort = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

/**
 * Formate une date pour les pilules (format complet sans jour de semaine)
 */
const formatDatePill = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString('fr-FR', { month: 'long' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

/**
 * Formate une date complète
 */
const formatFullDate = (dateString: string): string => {
  const date = new Date(dateString);
  const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const dayName = dayNames[date.getDay()];
  const day = date.getDate();
  const month = date.toLocaleDateString('fr-FR', { month: 'long' });
  const year = date.getFullYear();
  return `${dayName} ${day} ${month} ${year}`;
};

/**
 * Formate l'horaire
 */
const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

/**
 * Calcule la projection temporelle
 */
const getTimeProjection = (dateString: string): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const target = new Date(dateString);
  target.setHours(0, 0, 0, 0);
  
  const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Demain";
  if (diffDays < 7) return `Dans ${diffDays} jours · Cette semaine`;
  if (diffDays < 14) return `Dans ${diffDays} jours · Semaine prochaine`;
  
  const weeks = Math.ceil(diffDays / 7);
  return `Dans ${diffDays} jours · Dans ${weeks} semaines`;
};

export const SlotAccordion = ({
  slots,
  ageMin,
  ageMax,
  selectedSlotId,
  onSelectSlot,
  periodLabel = "Vacances",
  defaultExpanded = true,
}: SlotAccordionProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showAll, setShowAll] = useState(false);
  
  // Trier les slots par date
  const sortedSlots = useMemo(() => {
    return [...slots].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }, [slots]);
  
  // Limiter l'affichage
  const displayedSlots = showAll ? sortedSlots : sortedSlots.slice(0, 3);
  const hasMore = sortedSlots.length > 3;
  
  // Trouver le slot sélectionné
  const selectedSlot = sortedSlots.find(s => s.id === selectedSlotId);
  const isAnySlotSelected = !!selectedSlot;
  
  const ageLabel = ageMin !== null && ageMin !== undefined && ageMax !== null && ageMax !== undefined
    ? `${ageMin}–${ageMax} ans`
    : null;
  
  // Calculer les statistiques
  const availableCount = sortedSlots.filter(s => (s.seats_remaining ?? 0) > 0).length;
  const totalCount = sortedSlots.length;

  return (
    <Card className={cn(
      "overflow-hidden transition-all border-2",
      isAnySlotSelected 
        ? "border-primary bg-primary/5 shadow-md" 
        : "border-transparent hover:border-primary/20"
    )}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
            isAnySlotSelected ? "bg-primary text-primary-foreground" : "bg-muted"
          )}>
            <Calendar size={20} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn(
                "font-semibold",
                isAnySlotSelected && "text-primary"
              )}>
                {periodLabel}
              </span>
              <span className="text-xs text-muted-foreground">
                {availableCount}/{totalCount} créneaux disponibles
              </span>
            </div>
          </div>
        </div>
        
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
          {/* Pilules de slots */}
          <div className="pt-3">
            <p className="text-xs text-muted-foreground mb-2">Sélectionnez une date :</p>
            <div className="flex flex-col gap-2">
              {displayedSlots.map((slot) => {
                const isSelected = selectedSlotId === slot.id;
                const isFull = (slot.seats_remaining ?? 0) <= 0;
                const isLowStock = !isFull && (slot.seats_remaining ?? 0) <= 3;
                
                return (
                  <button
                    key={slot.id}
                    onClick={() => !isFull && onSelectSlot(slot.id)}
                    disabled={isFull}
                    className={cn(
                      "px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left",
                      "border-2 flex items-center gap-2",
                      isFull
                        ? "bg-muted text-muted-foreground border-transparent cursor-not-allowed opacity-50"
                        : isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : isLowStock
                            ? "bg-amber-50 border-amber-300 text-amber-700 hover:border-amber-400"
                            : "bg-background border-muted-foreground/20 hover:border-primary/50 hover:bg-accent"
                    )}
                  >
                    {isSelected && !isFull && <CheckCircle2 size={16} className="flex-shrink-0" />}
                    {isFull && <AlertCircle size={16} className="flex-shrink-0" />}
                    <Calendar size={14} className={cn("flex-shrink-0", !isSelected && !isFull && "text-muted-foreground")} />
                    <span className="flex-1">{formatDatePill(slot.start)}</span>
                    {isLowStock && !isSelected && (
                      <span className="text-xs bg-amber-100 px-2 py-0.5 rounded">Plus que {slot.seats_remaining} place{(slot.seats_remaining ?? 0) > 1 ? 's' : ''}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Bouton voir plus */}
          {hasMore && (
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
                  Voir {sortedSlots.length - 3} autres dates
                </>
              )}
            </Button>
          )}
          
          {/* Détails du slot sélectionné */}
          {selectedSlot && (
            <div className="pt-2 border-t space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <Clock size={14} className="text-muted-foreground" />
                <span>
                  {formatTime(selectedSlot.start)} – {formatTime(selectedSlot.end)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {getTimeProjection(selectedSlot.start)}
              </p>
              {selectedSlot.seats_remaining !== null && selectedSlot.seats_remaining > 0 && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    selectedSlot.seats_remaining <= 3
                      ? "bg-amber-100 text-amber-700 border-amber-300"
                      : "bg-green-100 text-green-700 border-green-300"
                  )}
                >
                  {selectedSlot.seats_remaining <= 3 
                    ? `Plus que ${selectedSlot.seats_remaining} place${selectedSlot.seats_remaining > 1 ? 's' : ''} !`
                    : `${selectedSlot.seats_remaining} places disponibles`
                  }
                </Badge>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

/**
 * Bloc récapitulatif "Créneau choisi" pour les slots vacances
 */
interface SelectedSlotSummaryProps {
  slot: SlotData | null;
  ageMin?: number | null;
  ageMax?: number | null;
  className?: string;
}

export const SelectedSlotSummary = ({
  slot,
  ageMin,
  ageMax,
  className,
}: SelectedSlotSummaryProps) => {
  if (!slot) return null;
  
  const fullDate = formatFullDate(slot.start);
  const timeLabel = `${formatTime(slot.start)} – ${formatTime(slot.end)}`;
  const ageLabel = ageMin !== null && ageMin !== undefined && ageMax !== null && ageMax !== undefined
    ? `${ageMin}–${ageMax} ans`
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
            Créneau choisi
          </p>
          <p className="font-semibold text-sm mt-0.5">{fullDate}</p>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {timeLabel}
            </span>
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

export default SlotAccordion;
