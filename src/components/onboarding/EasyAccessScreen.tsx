import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bus, Bike, Navigation, Leaf, ArrowRight } from "lucide-react";

interface EasyAccessScreenProps {
  onNext: () => void;
  onSkip: () => void;
}

export const EasyAccessScreen = ({ onNext, onSkip }: EasyAccessScreenProps) => {
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Progression */}
        <div className="flex justify-center gap-2">
          <div className="w-8 h-1.5 rounded-full bg-primary" />
          <div className="w-8 h-1.5 rounded-full bg-primary" />
          <div className="w-8 h-1.5 rounded-full bg-primary" />
        </div>

        {/* Icône header */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-600/20 flex items-center justify-center shadow-lg">
            <Navigation className="w-12 h-12 text-emerald-600" />
          </div>
        </div>

        {/* Titre */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Y aller facilement
          </h2>
          <p className="text-base text-muted-foreground max-w-sm mx-auto">
            Solutions d'éco-mobilité pour chaque activité
          </p>
        </div>

        {/* Transport Options */}
        <div className="space-y-3 max-w-md mx-auto">
          <Card className="p-4 bg-gradient-to-br from-blue-50/50 to-cyan-100/30 dark:from-blue-950/20 dark:to-cyan-900/10 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Bus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Transport en commun</p>
                <p className="text-xs text-muted-foreground">Itinéraires bus & arrêts proches</p>
              </div>
              <Leaf className="w-4 h-4 text-green-600" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-emerald-50/50 to-green-100/30 dark:from-emerald-950/20 dark:to-green-900/10 border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Bike className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Vélo & vélo partagé</p>
                <p className="text-xs text-muted-foreground">Stations VéliVert & durée trajets</p>
              </div>
              <Leaf className="w-4 h-4 text-green-600" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-purple-50/50 to-violet-100/30 dark:from-purple-950/20 dark:to-violet-900/10 border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Covoiturage</p>
                <p className="text-xs text-muted-foreground">Trouvez ou proposez un trajet</p>
              </div>
              <Leaf className="w-4 h-4 text-green-600" />
            </div>
          </Card>
        </div>

        {/* Slogan final */}
        <div className="text-center pt-4">
          <div className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
            <p className="text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Flooow – Mes activités, mes aides et mes trajets.
            </p>
          </div>
        </div>
      </div>

      {/* Boutons */}
      <div className="p-6 space-y-3 border-t">
        <Button
          onClick={onNext}
          className="w-full h-14 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90"
          size="lg"
        >
          C'est parti !
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
