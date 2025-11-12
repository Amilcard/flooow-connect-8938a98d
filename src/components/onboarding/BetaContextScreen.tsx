import { Button } from "@/components/ui/button";
import { MapPin, ChevronRight } from "lucide-react";

interface BetaContextScreenProps {
  onNext: () => void;
}

export const BetaContextScreen = ({ onNext }: BetaContextScreenProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
        <MapPin className="w-20 h-20 text-primary" />
        
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-foreground">
            Une version bêta sur quelques territoires
          </h2>
          <p className="text-lg text-muted-foreground">
            Pourquoi on te demande ton territoire
          </p>
        </div>

        <div className="space-y-4 max-w-md text-left">
          <p className="text-base text-foreground">
            Pour l'instant, Flooow est en test sur un nombre limité de territoires.
          </p>
          <p className="text-base text-foreground">
            Nous avons besoin de savoir où tu te situes pour te proposer des activités et des aides vraiment pertinentes.
          </p>
          <p className="text-base text-foreground">
            Si ton territoire n'est pas encore dans la liste, tu pourras quand même découvrir l'appli et t'inscrire pour être averti dès que nous arrivons chez toi.
          </p>
        </div>
      </div>

      <div className="p-6">
        <Button
          onClick={onNext}
          className="w-full h-14"
          size="lg"
        >
          Choisir mon territoire
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
