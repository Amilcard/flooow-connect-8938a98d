import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Slot {
  id: string;
  start: string;
  end: string;
  seats_remaining: number;
  seats_total: number;
}

interface SlotPickerProps {
  slots: Slot[];
  onSelectSlot: (slotId: string) => void;
  selectedSlotId?: string;
}

export const SlotPicker = ({ slots, onSelectSlot, selectedSlotId }: SlotPickerProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", { 
      weekday: "long", 
      day: "numeric", 
      month: "long" 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  const getAvailabilityColor = (remaining: number, total: number) => {
    const percentage = (remaining / total) * 100;
    if (percentage > 50) return "text-green-600";
    if (percentage > 20) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Choisir un créneau</h3>
      
      <div className="space-y-3">
        {slots.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            Aucun créneau disponible pour le moment
          </p>
        )}
        
        {slots.map((slot) => {
          const isSelected = selectedSlotId === slot.id;
          const isFull = slot.seats_remaining === 0;
          
          return (
            <Card
              key={slot.id}
              className={`p-4 cursor-pointer transition-all ${
                isSelected
                  ? "border-primary border-2 bg-primary/5"
                  : isFull
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:border-primary/50"
              }`}
              onClick={() => !isFull && onSelectSlot(slot.id)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{formatDate(slot.start)}</span>
                </div>
                
                {isFull ? (
                  <Badge variant="secondary" className="bg-red-100 text-red-700">
                    Complet
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    Disponible
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{formatTime(slot.start)} - {formatTime(slot.end)}</span>
                </div>

                <div className={`flex items-center gap-2 ${getAvailabilityColor(slot.seats_remaining, slot.seats_total)}`}>
                  <Users className="w-4 h-4" />
                  <span className="font-medium">
                    {slot.seats_remaining}/{slot.seats_total} places
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
