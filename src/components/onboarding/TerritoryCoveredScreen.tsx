import { Button } from "@/components/ui/button";
import { CheckCircle2, Activity, Euro, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";

interface TerritoryCoveredScreenProps {
  onNext: () => void;
}

export const TerritoryCoveredScreen = ({ onNext }: TerritoryCoveredScreenProps) => {
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-green-success/5 to-background">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Success icon animé */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-green flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
              <CheckCircle2 className="w-14 h-14 text-white" />
            </div>
            <div className="absolute inset-0 w-24 h-24 rounded-full bg-green-success/20 animate-ping" />
          </div>
        </div>

        {/* Titre */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            C'est parti !
          </h2>
          <p className="text-base text-muted-foreground max-w-sm mx-auto">
            Votre territoire est en zone de test, vous pouvez explorer toutes les fonctionnalités
          </p>
        </div>

        {/* Ce que vous pouvez faire - version visuelle */}
        <div className="space-y-3 max-w-md mx-auto">
          <Card className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Activités près de chez vous</p>
                <p className="text-sm text-muted-foreground">Sport, culture, loisirs...</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-r from-accent/5 to-accent/10 border-accent/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                <Euro className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Calcul des aides</p>
                <p className="text-sm text-muted-foreground">Nationales et locales</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Note confidentialité intégrée */}
        <Card className="p-4 bg-muted/30 border-muted max-w-md mx-auto">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Vos données sont protégées.</span> Nous ne les revendons pas et vous pouvez les supprimer à tout moment.
            </p>
          </div>
        </Card>
      </div>

      <div className="p-6 border-t bg-card">
        <Button
          onClick={onNext}
          className="w-full h-14 text-base font-semibold shadow-lg"
          size="lg"
        >
          Explorer les activités
        </Button>
      </div>
    </div>
  );
};
