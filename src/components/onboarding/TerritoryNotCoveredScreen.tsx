import { Button } from "@/components/ui/button";
import { MapPinOff, Eye, Bell, Sparkles } from "lucide-react";

interface TerritoryNotCoveredScreenProps {
  onDiscoverDemo: () => void;
  onNotifyMe: () => void;
}

export const TerritoryNotCoveredScreen = ({ onDiscoverDemo, onNotifyMe }: TerritoryNotCoveredScreenProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex justify-center">
          <MapPinOff className="w-24 h-24 text-muted-foreground" />
        </div>

        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold text-foreground">
            Ton territoire n'est pas encore en zone de test
          </h2>
          <p className="text-lg text-muted-foreground">
            Mais tu peux déjà participer à l'aventure
          </p>
        </div>

        <div className="space-y-4 text-left">
          <p className="text-base text-foreground">
            Nous n'avons pas encore connecté les activités locales et les aides de ton territoire.
          </p>
          <p className="text-base text-foreground">
            Flooow se construit pas à pas avec des territoires pilotes. Tu es en avance sur nous, et c'est une bonne nouvelle.
          </p>
          <p className="text-base text-foreground">
            Tu peux : découvrir le fonctionnement avec des exemples, accéder aux aides nationales, et t'inscrire pour être averti dès que ton territoire sera ouvert.
          </p>
        </div>

        <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Eye className="w-5 h-5 text-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">Accès aux explications et aux écrans de démo</p>
              <p className="text-sm text-muted-foreground">Découvre comment fonctionne Flooow</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">Simulations d'aides nationales possibles</p>
              <p className="text-sm text-muted-foreground">Calcule les aides nationales comme le PassSport</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">Inscription à une liste d'attente pour ton territoire</p>
              <p className="text-sm text-muted-foreground">Sois le premier informé quand nous arrivons chez toi</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-3 border-t">
        <Button
          onClick={onDiscoverDemo}
          className="w-full h-14"
          size="lg"
        >
          Découvrir l'application en mode démo
        </Button>
        
        <Button
          onClick={onNotifyMe}
          variant="outline"
          className="w-full h-12"
        >
          <Bell className="mr-2 h-4 w-4" />
          Être prévenu quand Flooow arrive chez moi
        </Button>
      </div>
    </div>
  );
};
