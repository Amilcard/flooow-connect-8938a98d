import { useState } from "react";
import { Calendar, ChevronDown, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Session {
  id?: string;
  age_min: number;
  age_max: number;
  day_of_week: number | null;
  start_time?: string;
  end_time?: string;
}

interface Slot {
  id: string;
  start: string;
  end: string;
  seats_remaining: number;
}

interface SessionSelectorProps {
  /**
   * Type de période (scolaire = sessions hebdo, vacances = slots)
   */
  periodType: "scolaire" | "vacances";

  /**
   * Sessions pour activités scolaires
   */
  sessions?: Session[];

  /**
   * Créneaux pour activités vacances
   */
  slots?: Slot[];

  /**
   * Index de session sélectionné (pour scolaire)
   */
  selectedSessionIdx?: number | null;

  /**
   * ID du slot sélectionné (pour vacances)
   */
  selectedSlotId?: string;

  /**
   * Callback quand une session est sélectionnée
   */
  onSessionSelect?: (idx: number) => void;

  /**
   * Callback quand un slot est sélectionné
   */
  onSlotSelect?: (slotId: string) => void;

  /**
   * Badge de période (ex: "Printemps", "Été")
   */
  periodBadge?: string;
}

const DAYS_OF_WEEK = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const DAYS_OF_WEEK_FULL = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

/**
 * Calcule les 3 prochaines dates pour un jour donné
 */
const getNextDates = (dayOfWeek: number | null, count: number = 3): string[] => {
  if (dayOfWeek === null) return [];
  const dates: string[] = [];
  const today = new Date();
  const currentDay = today.getDay();
  let daysUntil = dayOfWeek - currentDay;
  if (daysUntil <= 0) daysUntil += 7;
  for (let i = 0; i < count; i++) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntil + (i * 7));
    dates.push(nextDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }));
  }
  return dates;
};

/**
 * Formate l'heure (HH:MM:SS -> HH:MM)
 */
const formatTime = (time?: string): string => {
  if (!time) return "";
  return time.slice(0, 5);
};

/**
 * Composant de sélection de session/créneau
 *
 * Pour les activités scolaires: dropdown avec sessions hebdomadaires
 * Pour les activités vacances: dropdown avec créneaux disponibles
 */
export function SessionSelector({
  periodType,
  sessions = [],
  slots = [],
  selectedSessionIdx,
  selectedSlotId,
  onSessionSelect,
  onSlotSelect,
  periodBadge
}: SessionSelectorProps) {

  if (periodType === "scolaire" && sessions.length > 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700">
            Choisir une session
          </label>
          {periodBadge && (
            <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
              {periodBadge}
            </span>
          )}
        </div>

        <Select
          value={selectedSessionIdx !== null && selectedSessionIdx !== undefined
            ? String(selectedSessionIdx)
            : undefined}
          onValueChange={(val) => onSessionSelect?.(parseInt(val, 10))}
        >
          <SelectTrigger className="w-full h-12 text-left">
            <SelectValue placeholder="Sélectionner un créneau..." />
          </SelectTrigger>
          <SelectContent>
            {sessions.map((session, idx) => {
              const dayLabel = session.day_of_week !== null
                ? DAYS_OF_WEEK_FULL[session.day_of_week]
                : "Vacances";
              const timeLabel = session.start_time && session.end_time
                ? `${formatTime(session.start_time)} - ${formatTime(session.end_time)}`
                : "";

              return (
                <SelectItem key={idx} value={String(idx)} className="py-3">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-slate-500" />
                      <span className="font-medium">{session.age_min}-{session.age_max} ans</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-600">{dayLabel}</span>
                    </div>
                    {timeLabel && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-5">
                        <Clock size={12} />
                        {timeLabel}
                      </div>
                    )}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {/* Afficher les prochaines dates si une session est sélectionnée */}
        {selectedSessionIdx !== null &&
         selectedSessionIdx !== undefined &&
         sessions[selectedSessionIdx]?.day_of_week !== null && (
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
            <Calendar size={14} className="text-primary" />
            <span>Prochaines séances : {getNextDates(sessions[selectedSessionIdx].day_of_week).join(", ")}</span>
          </div>
        )}
      </div>
    );
  }

  if (periodType === "vacances" && slots.length > 0) {
    // Séparer les créneaux disponibles et complets
    const availableSlots = slots.filter(s => s.seats_remaining > 0);
    const fullSlots = slots.filter(s => s.seats_remaining <= 0);

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700">
            Choisir un créneau
          </label>
          {periodBadge && (
            <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full">
              {periodBadge}
            </span>
          )}
        </div>

        <Select
          value={selectedSlotId}
          onValueChange={(val) => onSlotSelect?.(val)}
        >
          <SelectTrigger className="w-full h-12 text-left">
            <SelectValue placeholder="Sélectionner un créneau..." />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {availableSlots.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-slate-500 bg-slate-50">
                  Créneaux disponibles
                </div>
                {availableSlots.map((slot) => {
                  const startDate = new Date(slot.start);
                  const endDate = new Date(slot.end);
                  const dateLabel = startDate.toLocaleDateString('fr-FR', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short'
                  });
                  const timeLabel = `${startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;

                  return (
                    <SelectItem key={slot.id} value={slot.id} className="py-3">
                      <div className="flex items-center justify-between w-full gap-4">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-slate-500" />
                            <span className="font-medium">{dateLabel}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-5">
                            <Clock size={12} />
                            {timeLabel}
                          </div>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          slot.seats_remaining < 5
                            ? 'bg-red-50 text-red-600'
                            : 'bg-green-50 text-green-600'
                        }`}>
                          {slot.seats_remaining} place{slot.seats_remaining > 1 ? 's' : ''}
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </>
            )}

            {fullSlots.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-slate-400 bg-slate-50 mt-2">
                  Complets
                </div>
                {fullSlots.map((slot) => {
                  const startDate = new Date(slot.start);
                  const dateLabel = startDate.toLocaleDateString('fr-FR', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short'
                  });

                  return (
                    <SelectItem
                      key={slot.id}
                      value={slot.id}
                      disabled
                      className="py-3 opacity-50"
                    >
                      <div className="flex items-center justify-between w-full gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-400" />
                          <span className="text-slate-400">{dateLabel}</span>
                        </div>
                        <span className="text-xs text-slate-400">Complet</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </>
            )}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Aucune session/slot disponible
  return (
    <div className="text-center py-4 text-slate-500 text-sm">
      Aucun créneau disponible pour le moment
    </div>
  );
}
