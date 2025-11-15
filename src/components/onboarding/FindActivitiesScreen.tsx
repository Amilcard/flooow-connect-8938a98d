import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, MapPin, Calendar, Heart, ArrowRight } from "lucide-react";

interface FindActivitiesScreenProps {
  onNext: () => void;
  onSkip: () => void;
}

export const FindActivitiesScreen = ({ onNext, onSkip }: FindActivitiesScreenProps) => {
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Progression */}
        <div className="flex justify-center gap-2">
          <div className="w-8 h-1.5 rounded-full bg-primary" />
          <div className="w-8 h-1.5 rounded-full bg-muted" />
          <div className="w-8 h-1.5 rounded-full bg-muted" />
        </div>

        {/* Icône header */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500/10 to-blue-600/20 flex items-center justify-center shadow-lg">
            <Search className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        {/* Titre */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Trouve des activités <br/>près de chez toi
          </h2>
          <p className="text-base text-muted-foreground max-w-sm mx-auto">
            Sport, culture, loisirs, vacances... pour enfants et ados
          </p>
        </div>

        {/* Features Cards */}
        <div className="space-y-3 max-w-md mx-auto">
          <Card className="p-4 bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm font-medium text-foreground">
                Activités à proximité de ton domicile
              </p>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-purple-50/50 to-purple-100/30 dark:from-purple-950/20 dark:to-purple-900/10 border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-sm font-medium text-foreground">
                Disponibilités et créneaux en temps réel
              </p>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-pink-50/50 to-pink-100/30 dark:from-pink-950/20 dark:to-pink-900/10 border-pink-200 dark:border-pink-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              </div>
              <p className="text-sm font-medium text-foreground">
                Filtres par âge, catégorie et accessibilité
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Boutons */}
      <div className="p-6 space-y-3 border-t">
        <Button
          onClick={onNext}
          className="w-full h-14 text-base font-semibold"
          size="lg"
        >
          Suivant
          <ArrowRight className="ml-2" size={20} />
        </Button>
        
        <Button
          onClick={onSkip}
          variant="ghost"
          className="w-full text-sm text-muted-foreground hover:text-foreground"
        >
          Passer
        </Button>
      </div>
    </div>
  );
};
