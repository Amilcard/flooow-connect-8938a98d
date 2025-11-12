import { Button } from "@/components/ui/button";
import { CheckCircle2, Activity, Euro, MessageSquare } from "lucide-react";

interface TerritoryCoveredScreenProps {
  onNext: () => void;
}

export const TerritoryCoveredScreen = ({ onNext }: TerritoryCoveredScreenProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex justify-center">
          <CheckCircle2 className="w-24 h-24 text-primary" />
        </div>

        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold text-foreground">
            Bonne nouvelle, ton territoire est en zone de test
          </h2>
          <p className="text-lg text-muted-foreground">
            Tu vas pouvoir tester Flooow en conditions presque réelles
          </p>
        </div>

        <div className="space-y-4 text-left">
          <p className="text-base text-foreground">
            Nous avons déjà des activités et des aides configurées pour ton territoire.
          </p>
          <p className="text-base text-foreground">
            Tu pourras : rechercher des activités, simuler des aides nationales et locales, et nous donner ton avis.
          </p>
          <p className="text-base text-foreground">
            N'oublie pas : cette version est en construction. Tes retours nous aideront à améliorer l'outil.
          </p>
        </div>

        <div className="space-y-3 bg-primary/5 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">Activités adaptées à ton territoire</p>
              <p className="text-sm text-muted-foreground">Découvre les activités disponibles près de chez toi</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Euro className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">Première estimation des aides financières</p>
              <p className="text-sm text-muted-foreground">Calcule les aides auxquelles tu as droit</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">Amélioration continue grâce à ton feedback</p>
              <p className="text-sm text-muted-foreground">Aide-nous à améliorer la plateforme</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 border-t">
        <Button
          onClick={onNext}
          className="w-full h-14"
          size="lg"
        >
          Commencer à explorer les activités
        </Button>
      </div>
    </div>
  );
};
