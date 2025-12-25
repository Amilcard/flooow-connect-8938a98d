import { useState } from 'react';
import { MapPin, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  DemoCityKey, 
  DEMO_CITIES, 
  DEMO_CITY_KEYS 
} from './DemoCityConfig';
import { cn } from '@/lib/utils';

interface DemoCitySelectorProps {
  /** État d'ouverture du modal */
  open: boolean;
  /** Callback fermeture */
  onOpenChange: (open: boolean) => void;
  /** Ville actuellement sélectionnée */
  currentCity: DemoCityKey | null;
  /** Callback sélection */
  onSelect: (cityKey: DemoCityKey) => void;
  /** Titre personnalisé */
  title?: string;
  /** Description personnalisée */
  description?: string;
}

/**
 * Modal de sélection de ville de démonstration
 */
export const DemoCitySelector = ({
  open,
  onOpenChange,
  currentCity,
  onSelect,
  title = "Changer de ville de test",
  description = "Choisissez une ville pilote pour continuer à explorer Flooow."
}: DemoCitySelectorProps) => {
  const [selected, setSelected] = useState<DemoCityKey | null>(currentCity);

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 py-4">
          {DEMO_CITY_KEYS.map((key) => {
            const city = DEMO_CITIES[key];
            const isSelected = selected === key;
            const isCurrent = currentCity === key;

            return (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border transition-all text-left",
                  isSelected 
                    ? "border-primary bg-primary/5 ring-1 ring-primary" 
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    isSelected ? "bg-primary text-white" : "bg-muted"
                  )}>
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{city.shortLabel}</p>
                    <p className="text-sm text-muted-foreground">{city.label}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isCurrent && (
                    <span className="text-xs bg-muted px-2 py-0.5 rounded">
                      actuelle
                    </span>
                  )}
                  {isSelected && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end gap-2">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!selected || selected === currentCity}
          >
            Confirmer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DemoCitySelector;
