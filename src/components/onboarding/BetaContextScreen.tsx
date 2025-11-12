import { Button } from "@/components/ui/button";
import { MapPin, Target, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

interface BetaContextScreenProps {
  onNext: () => void;
}

export const BetaContextScreen = ({ onNext }: BetaContextScreenProps) => {
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Icône header */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <MapPin className="w-12 h-12 text-primary" />
          </div>
        </div>

        {/* Titre */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Phase bêta sur quelques territoires
          </h2>
          <p className="text-base text-muted-foreground">
            On te demande ton territoire pour une bonne raison
          </p>
        </div>

        {/* 3 bullets visuels */}
        <div className="space-y-4 max-w-md mx-auto">
          <Card className="p-4 border-l-4 border-l-primary bg-card shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Activités adaptées</p>
                <p className="text-sm text-muted-foreground">On te montre uniquement ce qui est disponible près de chez toi</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-accent bg-card shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Test en conditions réelles</p>
                <p className="text-sm text-muted-foreground">Aide-nous à améliorer l'outil avec tes retours</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-green-success bg-card shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-success/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-green-success" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Pas encore couvert ?</p>
                <p className="text-sm text-muted-foreground">Tu pourras quand même découvrir l'app et t'inscrire pour être averti</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="p-6 border-t">
        <Button
          onClick={onNext}
          className="w-full h-14 text-base font-semibold"
          size="lg"
        >
          Choisir mon territoire
        </Button>
      </div>
    </div>
  );
};
